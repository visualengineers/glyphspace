// The Python tests must run on the package versions users get in the browser. Run with `npm run test:tools`.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { resolvePackages } from '../fetch-pyodide.mjs';

const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const normalize = name => name.toLowerCase().replace(/[-_.]+/g, '-');

test('requirements-dev.txt pins the versions that ship with Pyodide', () => {
  const lock = JSON.parse(read('node_modules/pyodide/pyodide-lock.json'));
  const wizardPackages = resolvePackages(lock, JSON.parse(read('src/app/workers/pyodide-packages.json')));
  const shipped = new Map(wizardPackages.map(pkg => [normalize(pkg.name), pkg.version]));
  const pins = read('requirements-dev.txt')
    .split(/\r?\n/)
    .map(line => line.replace(/#.*/, '').trim())
    .filter(Boolean)
    .map(line => line.split('=='));

  const checked = [];
  for (const [name, version] of pins) {
    assert.ok(version, `${name}: pin an exact version with ==`);
    const inPyodide = shipped.get(normalize(name));
    if (inPyodide === undefined) continue; // test-only tools such as pytest, which the site doesn't ship
    assert.equal(version, inPyodide, `${name} ${version} in requirements-dev.txt, ${inPyodide} in Pyodide`);
    checked.push(name);
  }
  for (const name of ['numpy', 'pandas', 'scikit-learn']) {
    assert.ok(checked.includes(name), `requirements-dev.txt should pin ${name}`);
  }
});
