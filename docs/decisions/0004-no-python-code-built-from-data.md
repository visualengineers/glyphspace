# 0004. Never build Python source from request data

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2026-09-24 (commit a4a87c3) · **Related:** [Worker protocol](../specs/worker-protocol.md#rules-for-requests-that-touch-files-or-python), [ADR 0002](0002-preprocess-in-the-browser-with-pyodide.md)

## Context

The Pyodide worker runs Python with arguments that come from the user's file: its name, the column names in its header, and the wizard configuration built from them. When those values are pasted into Python source, a crafted header such as `x"); import js; js.fetch(...)#` runs arbitrary code in the page's origin. The review that led to commit a4a87c3 ("fix … Python injection and tooltip XSS") found this.

A second risk is the worker's file system: its working directory is on Python's import path, so an uploaded file named like a module (`pandas.py`) would replace that module, and a name with a path separator could write outside the working directory.

## Decision

- Every call into Python is a fixed piece of code built by `pythonCall(module, function, args)` in `src/app/workers/pyodide-calls.ts`. Module and function names must be identifiers. The arguments are passed to Pyodide as data (`pyodide.toPy`) in a throwaway namespace that the code reads them from; they never become part of the source.
- Every file name passes `assertSafeFileName` (`src/app/workers/pyodide-files.ts`) before anything is written: one path component, not `.` or `..`, no `/`, `\` or NUL, and no `.py`, `.pyc` or `.so` suffix.

## Alternatives considered

None are recorded. The obvious one is escaping values before interpolating them into source. A fixed call template with data arguments removes the whole class of bugs instead of relying on every escape being right.

## Consequences

- A new Python entry point is added as a `pythonCall` with data arguments, never with a template string. `pyodide-calls.spec.ts` and `pyodide-files.spec.ts` cover the rules.
- Uploads whose names end in `.py`, `.pyc` or `.so` are rejected.
