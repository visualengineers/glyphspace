import { workerErrorMessage, workerErrorPattern, workerErrorSummary } from './worker-error-text';

const TRACEBACK = [
  'Traceback (most recent call last):',
  '  File "/home/pyodide/preprocessing_processor.py", line 236, in profile_data',
  '    df = pd.read_csv(file_name)',
  '  File "/lib/python3.14/site-packages/pandas/io/parsers/readers.py", line 1026, in read_csv',
  '    return _read(filepath_or_buffer, kwds)',
  'pandas.errors.ParserError: Error tokenizing data. C error: Expected 3 fields in line 4, saw 5',
  '',
].join('\n');

describe('worker error text', () => {
  it('keeps the exception at the end of a Python traceback', () => {
    expect(workerErrorSummary(TRACEBACK)).toBe(
      'pandas.errors.ParserError: Error tokenizing data. C error: Expected 3 fields in line 4, saw 5'
    );
  });

  it('keeps a message that is no traceback as it is', () => {
    expect(workerErrorSummary('  Worker request "profileData" timed out after 60000ms ')).toBe(
      'Worker request "profileData" timed out after 60000ms'
    );
    expect(workerErrorSummary(undefined as unknown as string)).toBe('');
  });

  it('keeps a multi-line exception message whole', () => {
    const raw = 'Traceback (most recent call last):\n  File "x.py", line 1\nValueError: first line\nsecond line';
    expect(workerErrorSummary(raw)).toBe('ValueError: first line\nsecond line');
  });

  it("drops a generic exception type and the wizard's own wrapper for people, keeps a specific one", () => {
    const wrapped =
      'Traceback (most recent call last):\n  File "x.py", line 1\nException: Failed to process data: No rows are left';
    expect(workerErrorMessage(wrapped)).toBe('No rows are left');
    expect(workerErrorMessage('ValueError: bad value')).toBe('ValueError: bad value');
  });

  it('removes quoted values for pattern matching', () => {
    expect(workerErrorPattern(`Column 'Memory (GB)': the fill value "lots" is not a number`)).toBe(
      "Column '': the fill value '' is not a number"
    );
  });
});
