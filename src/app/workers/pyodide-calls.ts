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
 * Flat-extracts a zip archive into `/<archive name>`. The target folder is only
 * replaced when a previous unpack created it (marker file), so an archive name
 * can never wipe an unrelated directory such as `/lib` or `/home`.
 */
const UNPACK_FLAT_SOURCE = `
import os, shutil, zipfile

def unpack_flat(zip_path):
    base = "/" + os.path.splitext(os.path.basename(zip_path))[0]
    marker = os.path.join(base, ".unpacked")
    if os.path.exists(base):
        if not os.path.exists(marker):
            raise ValueError(f"Refusing to replace existing folder {base}")
        shutil.rmtree(base)
    os.mkdir(base)
    open(marker, "w").close()

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        for member in zip_ref.namelist():
            if member.endswith("/"):
                continue
            target_path = os.path.join(base, os.path.basename(member))
            with zip_ref.open(member) as source, open(target_path, "wb") as target:
                shutil.copyfileobj(source, target)
    print("Unpacked to", base)
`;

/** Call that extracts the zip archive at `zipPath` (see UNPACK_FLAT_SOURCE). */
export function unpackZipCall(zipPath: string): PythonCall {
  return { code: `${UNPACK_FLAT_SOURCE}\nunpack_flat(*${PY_ARGS})`, args: [zipPath] };
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
