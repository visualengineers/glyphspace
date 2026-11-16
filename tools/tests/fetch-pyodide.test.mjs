// Tests for tools/fetch-pyodide.mjs. Run with `npm run test:tools`.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { deflateRawSync } from 'node:zlib';
import { resolvePackages, wheelLicenses, zipEntries } from '../fetch-pyodide.mjs';

const root = new URL('../../', import.meta.url);
const realLock = JSON.parse(await readFile(new URL('node_modules/pyodide/pyodide-lock.json', root), 'utf8'));
const requested = JSON.parse(await readFile(new URL('src/app/workers/pyodide-packages.json', root), 'utf8'));

const lock = packages => ({
  packages: Object.fromEntries(
    packages.map(([name, depends = [], file = `${name}-1.0-py3-none-any.whl`]) => [
      name,
      { name, version: '1.0', file_name: file, sha256: 'a'.repeat(64), depends },
    ])
  ),
});

test('the wizard packages resolve with all dependencies from the real lock file', () => {
  const names = resolvePackages(realLock, requested).map(pkg => pkg.name);
  for (const name of ['pandas', 'numpy', 'scikit-learn', 'scipy', 'joblib', 'threadpoolctl']) {
    assert.ok(names.includes(name), `${name} missing from ${names}`);
  }
  assert.ok(!names.includes('micropip'), 'micropip is no longer needed');
});

test('dependencies are resolved once, by normalised name', () => {
  const resolved = resolvePackages(
    lock([['a', ['B_c', 'd']], ['b-c', ['d']], ['d'], ['unused']]),
    ['a']
  );
  assert.deepEqual(resolved.map(pkg => pkg.name), ['a', 'b-c', 'd']);
});

test('an unknown package fails loudly', () => {
  assert.throws(() => resolvePackages(lock([['a', ['missing']]]), ['a']), /"missing" is not in pyodide-lock.json/);
});

test('a lock entry pointing elsewhere than the release folder is refused', () => {
  for (const file of ['https://example.com/a.whl', '../a.whl', 'sub/a.whl']) {
    assert.throws(() => resolvePackages(lock([['a', [], file]]), ['a']), /no plain file name/);
  }
});

test('a lock entry without SHA-256 is refused', () => {
  const noHash = lock([['a']]);
  noHash.packages.a.sha256 = '';
  assert.throws(() => resolvePackages(noHash, ['a']), /no SHA-256/);
});

/** A minimal ZIP archive with the given files, deflated. */
function zip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const nameBytes = Buffer.from(name);
    const data = deflateRawSync(Buffer.from(text));
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, data);
    centrals.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

test('zip entries are listed and inflated', () => {
  const entries = [...zipEntries(zip({ 'a.txt': 'hello', 'b/c.txt': 'world' }))];
  assert.deepEqual(entries.map(e => e.name), ['a.txt', 'b/c.txt']);
  assert.equal(entries[1].read().toString(), 'world');
});

test('wheel licences come from the .dist-info folder', () => {
  const wheel = zip({
    'pkg/__init__.py': 'LICENSE = "not this one"',
    'pkg-1.0.dist-info/METADATA': 'Name: pkg\nLicense-Expression: BSD-3-Clause\n',
    'pkg-1.0.dist-info/licenses/LICENSE.txt': 'BSD text',
    'pkg-1.0.dist-info/COPYING': 'more text',
    'pkg-1.0.dist-info/RECORD': 'ignored',
  });
  const { license, texts } = wheelLicenses(wheel);
  assert.equal(license, 'BSD-3-Clause');
  assert.deepEqual(texts.map(t => t.name), ['pkg-1.0.dist-info/licenses/LICENSE.txt', 'pkg-1.0.dist-info/COPYING']);
});

test('a licence text in the License field falls back to the classifiers', () => {
  const wheel = zip({
    'pkg-1.0.dist-info/METADATA':
      'Name: pkg\nLicense: Copyright (c) 2001-2002 Enthought, Inc. 2003, SciPy Developers.\n' +
      'Classifier: License :: OSI Approved :: BSD License\n',
  });
  assert.equal(wheelLicenses(wheel).license, 'BSD License');
});
