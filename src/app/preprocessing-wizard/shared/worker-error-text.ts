/**
 * Errors from the Pyodide worker carry Python's whole traceback (PythonError):
 * file paths, source lines and finally the exception. These helpers keep what
 * matters to the wizard: the exception line(s) at the end.
 */

const TRACEBACK_START = /^Traceback \(most recent call last\):/m;

/**
 * The exception at the end of a Python traceback, with its type
 * (e.g. "ValueError: could not convert string to float: 'abc'"); any other
 * message unchanged. Traceback frames are indented, the exception is not.
 */
export function workerErrorSummary(raw: string): string {
  const text = (raw ?? '').trim();
  if (!TRACEBACK_START.test(text)) return text;
  const lines = text.split(/\r?\n/);
  let lastFrame = -1;
  lines.forEach((line, index) => {
    if (/^\s/.test(line)) lastFrame = index;
  });
  const exception = lines
    .slice(lastFrame + 1)
    .join('\n')
    .trim();
  return exception || text;
}

/**
 * The exception message for people: the summary without a generic
 * "Exception:"/"Error:" prefix and without the wizard's own "Failed to process
 * data:" wrapper. A specific type such as ValueError stays, it says something.
 */
export function workerErrorMessage(raw: string): string {
  return workerErrorSummary(raw)
    .replace(/^(Exception|Error|PythonError):\s*/, '')
    .replace(/^Failed to process data:\s*/, '');
}

/**
 * The summary with quoted text removed, for matching error patterns: quoted
 * parts are names and values from the user's data (a column called
 * "Memory (GB)" must not read as a memory error).
 */
export function workerErrorPattern(raw: string): string {
  return workerErrorSummary(raw).replace(/'[^'\n]*'|"[^"\n]*"/g, "''");
}
