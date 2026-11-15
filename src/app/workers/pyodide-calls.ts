/**
 * Safe construction and execution of calls into the worker's Python modules.
 *
 * Request data (file names, CSV column names taken from an uploaded file's
 * header, configuration objects) must never be interpolated into Python
 * source: a crafted header such as `x"); import js; js.fetch(...)#` would
 * otherwise run arbitrary Python. Every call is therefore a fixed piece of
 * code that reads its arguments from a variable in a throwaway namespace, and
 * the argument values are handed to Pyodide as data (pyodide.toPy).
 */

/** Name of the Python variable, in the per-call namespace, that holds the arguments. */
export const PY_ARGS = '__call_args__';

/** A JS callback handed to Python (e.g. the progress reporter). */
export type PyCallback = (...args: never[]) => void;

/** A value passed to Python as data. */
export type PyArg = string | number | boolean | readonly string[] | PyCallback;

/** Fixed Python source plus the argument values it reads from {@link PY_ARGS}. */
export interface PythonCall {
  readonly code: string;
  readonly args: readonly PyArg[];
}

/** The part of the Pyodide API that {@link runPythonCall} needs. */
export interface PyodideCallRuntime {
  toPy(value: Record<string, readonly PyArg[]>): PyNamespace;
  runPythonAsync(code: string, options: { globals: PyNamespace }): Promise<unknown>;
}

/** A Python dict proxy that is used as the globals of a single call. */
export interface PyNamespace {
  destroy(): void;
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assertIdentifier(name: string): void {
  if (!IDENTIFIER.test(name)) {
    throw new Error(`Invalid Python identifier: ${name}`);
  }
}

/**
 * Builds `import <module>; <module>.<func>(*args)`. Only the two identifiers
 * become code; they are fixed names chosen by the worker, never request data.
 */
export function pythonCall(module: string, func: string, args: readonly PyArg[]): PythonCall {
  assertIdentifier(module);
  assertIdentifier(func);
  return { code: `import ${module}\n${module}.${func}(*${PY_ARGS})`, args };
}

/**
 * Limits of an unpacked image archive. The unpacked files live in the worker's
 * memory, so they bound what a ZIP bomb can claim. Step 1 accepts archives up to
 * 200 MB, and images barely compress, so real archives stay far below them.
 */
export const ZIP_LIMITS = {
  /** Files in the archive (of any kind). */
  maxEntries: 100_000,
  /** Uncompressed size of one image. */
  maxFileBytes: 32 * 1024 * 1024,
  /** Uncompressed size of all images together. */
  maxTotalBytes: 512 * 1024 * 1024,
} as const;

/**
 * Flat-extracts the image files of a zip archive into `/<archive name>` and
 * returns, as JSON, the image names and the entries left out as duplicates.
 *
 * - Only `.png`, `.jpg`, `.jpeg` and `.webp` files are extracted, without their
 *   folders; `/` and `\` both separate folders (archives made on Windows use `\`).
 *   macOS resource forks (`__MACOSX/`, `._name`) are skipped.
 * - The first entry of a file name wins; later ones are reported in `duplicates`.
 * - The limits (ZIP_LIMITS) are checked against the sizes in the archive's
 *   directory before anything is written; zipfile reads at most that many bytes.
 * - The target folder is only replaced when a previous unpack created it (marker
 *   file), so an archive name can never wipe an unrelated directory such as
 *   `/lib` or `/home`.
 */
const UNPACK_FLAT_SOURCE = `
import json, os, shutil, zipfile

IMAGE_SUFFIXES = (".png", ".jpg", ".jpeg", ".webp")

def unpack_flat(zip_path, max_entries, max_file_bytes, max_total_bytes):
    base = "/" + os.path.splitext(os.path.basename(zip_path))[0]
    marker = os.path.join(base, ".unpacked")

    with zipfile.ZipFile(zip_path, "r") as archive:
        members = [m for m in archive.infolist() if not m.is_dir()]
        if len(members) > max_entries:
            raise ValueError(f"The archive holds {len(members)} files; at most {max_entries} are supported.")
        images, duplicates, total = {}, [], 0
        for member in members:
            path = member.filename.replace("\\\\", "/")
            name = path.rsplit("/", 1)[-1]
            if not name.lower().endswith(IMAGE_SUFFIXES) or name.startswith("._") or "__MACOSX/" in path:
                continue
            if name in images:
                duplicates.append(member.filename)
                continue
            if member.file_size > max_file_bytes:
                raise ValueError(f"The image {member.filename} is larger than {max_file_bytes // 2**20} MB.")
            total += member.file_size
            if total > max_total_bytes:
                raise ValueError(f"The images of the archive are larger than {max_total_bytes // 2**20} MB together.")
            images[name] = member

        if os.path.exists(base):
            if not os.path.exists(marker):
                raise ValueError(f"Refusing to replace existing folder {base}")
            shutil.rmtree(base)
        os.mkdir(base)
        open(marker, "w").close()
        for name, member in images.items():
            with archive.open(member) as source, open(os.path.join(base, name), "wb") as target:
                shutil.copyfileobj(source, target)
    return json.dumps({"images": list(images), "duplicates": duplicates})
`;

/** Call that extracts the zip archive at `zipPath` (see UNPACK_FLAT_SOURCE); returns JSON. */
export function unpackZipCall(zipPath: string): PythonCall {
  const { maxEntries, maxFileBytes, maxTotalBytes } = ZIP_LIMITS;
  return {
    code: `${UNPACK_FLAT_SOURCE}\nunpack_flat(*${PY_ARGS})`,
    args: [zipPath, maxEntries, maxFileBytes, maxTotalBytes],
  };
}

/** Deletes `/<folder>` if, and only if, an unpack created it (see UNPACK_FLAT_SOURCE). */
const REMOVE_UNPACKED_SOURCE = `
import os, shutil

def remove_unpacked(folder):
    base = "/" + folder
    if not os.path.exists(os.path.join(base, ".unpacked")):
        return False
    shutil.rmtree(base)
    return True
`;

/** Call that deletes the unpacked folder `folder` (see REMOVE_UNPACKED_SOURCE). */
export function removeUnpackedCall(folder: string): PythonCall {
  return { code: `${REMOVE_UNPACKED_SOURCE}\nremove_unpacked(*${PY_ARGS})`, args: [folder] };
}

/**
 * Runs a call in a fresh namespace that only contains its arguments, so no
 * temporary names leak into Pyodide's globals, and releases that namespace
 * (and with it the converted arguments) afterwards.
 */
export async function runPythonCall(pyodide: PyodideCallRuntime, call: PythonCall): Promise<unknown> {
  const namespace = pyodide.toPy({ [PY_ARGS]: call.args });
  try {
    return await pyodide.runPythonAsync(call.code, { globals: namespace });
  } finally {
    namespace.destroy();
  }
}

/** Runs a call whose Python function returns a JSON string and parses it. */
export async function runPythonJson(pyodide: PyodideCallRuntime, call: PythonCall): Promise<unknown> {
  const result = await runPythonCall(pyodide, call);
  if (typeof result !== 'string') {
    throw new Error(`Expected a JSON string from Python, got ${typeof result}`);
  }
  return JSON.parse(result);
}
