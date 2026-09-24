/**
 * Bookkeeping for the user files the Pyodide worker writes into its virtual FS.
 *
 * An uploaded CSV has to stay in the FS for reprocessing, and the undo history
 * may still point at an older upload, so the worker cannot decide on its own
 * when a file is obsolete. It records every input it writes and deletes those
 * the main thread no longer references (`pruneFiles`).
 */

/** The part of the Emscripten FS API used here. */
export interface PyodideFs {
  analyzePath(path: string): { exists: boolean };
  unlink(path: string): void;
}

/**
 * Python source/extension-module suffixes: the worker's cwd is on Python's
 * sys.path, so an input named like `pandas.py` would shadow a real module.
 */
const IMPORTABLE_SUFFIX = /\.(py|pyc|so)$/i;

/**
 * Rejects file names that are not a single, inert path component. Input files
 * are written relative to the worker's cwd; a name containing a path separator
 * could write elsewhere, and an importable name could replace Python code.
 */
export function assertSafeFileName(fileName: string): void {
  const isPlainName = fileName.length > 0 && fileName !== '.' && fileName !== '..' && !/[/\\\0]/.test(fileName);
  if (!isPlainName || IMPORTABLE_SUFFIX.test(fileName)) {
    throw new Error(`Unsupported file name: ${JSON.stringify(fileName)}`);
  }
}

/** Derived file that processWithConfig writes next to its input. */
export function resultFileFor(fileName: string): string {
  return `${fileName}.result.json`;
}

/** Tracks the input files written to the Pyodide FS during this session. */
export class InputFileRegistry {
  private readonly inputs = new Set<string>();

  track(fileName: string): void {
    this.inputs.add(fileName);
  }

  tracked(): string[] {
    return Array.from(this.inputs);
  }

  /**
   * Unlinks every tracked input that is not in `keep`, together with its
   * derived result file, and stops tracking it. Returns the removed paths.
   */
  prune(keep: readonly string[], fs: PyodideFs): string[] {
    const keepSet = new Set(keep);
    const removed: string[] = [];
    for (const input of this.tracked()) {
      if (keepSet.has(input)) {
        continue;
      }
      for (const path of [input, resultFileFor(input)]) {
        if (fs.analyzePath(path).exists) {
          fs.unlink(path);
          removed.push(path);
        }
      }
      this.inputs.delete(input);
    }
    return removed;
  }
}
