import { InputFileRegistry, PyodideFs, assertSafeFileName, resultFileFor } from './pyodide-files';

/** In-memory stand-in for the Emscripten FS. */
class FakeFs implements PyodideFs {
  readonly files: Set<string>;

  constructor(files: string[]) {
    this.files = new Set(files);
  }

  analyzePath(path: string): { exists: boolean } {
    return { exists: this.files.has(path) };
  }

  unlink(path: string): void {
    if (!this.files.delete(path)) {
      throw new Error(`ENOENT: ${path}`);
    }
  }
}

describe('assertSafeFileName', () => {
  it('accepts plain file names, including ones with quotes or spaces', () => {
    for (const name of ['data.csv', 'my data (1).csv', 'x"); import js #.csv', "it's.csv", 'archive.zip']) {
      expect(() => assertSafeFileName(name)).not.toThrow();
    }
  });

  it('rejects names that are not a single path component', () => {
    for (const name of ['', '.', '..', 'a/b.csv', '../x.csv', '/lib/x.csv', 'a\\b.csv', 'nul\0.csv']) {
      expect(() => assertSafeFileName(name), JSON.stringify(name)).toThrowError(/Unsupported file name/);
    }
  });

  it('rejects names Python could import as a module', () => {
    for (const name of ['pandas.py', 'processor.py', 'x.PY', 'mod.pyc', 'ext.so']) {
      expect(() => assertSafeFileName(name), name).toThrowError(/Unsupported file name/);
    }
  });
});

describe('InputFileRegistry', () => {
  let registry: InputFileRegistry;

  beforeEach(() => {
    registry = new InputFileRegistry();
  });

  it('unlinks tracked inputs and their result files that are not kept', () => {
    const fs = new FakeFs(['old.csv', resultFileFor('old.csv'), 'current.csv', 'processor.py']);
    registry.track('old.csv');
    registry.track('current.csv');

    const removed = registry.prune(['current.csv'], fs);

    expect(removed).toEqual(['old.csv', 'old.csv.result.json']);
    expect(Array.from(fs.files)).toEqual(['current.csv', 'processor.py']);
    expect(registry.tracked()).toEqual(['current.csv']);
  });

  it('keeps every file referenced by the keep list (e.g. from the undo history)', () => {
    const fs = new FakeFs(['a.csv', 'b.csv']);
    registry.track('a.csv');
    registry.track('b.csv');

    expect(registry.prune(['b.csv', 'a.csv'], fs)).toEqual([]);
    expect(Array.from(fs.files)).toEqual(['a.csv', 'b.csv']);
  });

  it('never touches files it did not write', () => {
    const fs = new FakeFs(['processor.py', 'processed_features.csv']);

    expect(registry.prune([], fs)).toEqual([]);
    expect(fs.files.size).toBe(2);
  });

  it('skips files that are already gone and forgets them', () => {
    const fs = new FakeFs([]);
    registry.track('gone.csv');

    expect(registry.prune([], fs)).toEqual([]);
    expect(registry.tracked()).toEqual([]);
  });

  it('tracks a re-written file only once', () => {
    registry.track('a.csv');
    registry.track('a.csv');

    expect(registry.tracked()).toEqual(['a.csv']);
  });
});
