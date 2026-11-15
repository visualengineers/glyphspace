// Keeps the licence notices in step with the installed versions. Run with `npm run test:tools`.
// LGPL-3.0 asks the DruidJS notice to name the version conveyed; the Pyodide notice names its
// release and the CPython licence it ships.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const notice = read('src/licenses/README.txt');

test('the DruidJS notice names the installed version', () => {
  const { version } = JSON.parse(read('node_modules/@saehrimnir/druidjs/package.json'));
  assert.match(read('src/app/menubar/about/about.component.ts'), new RegExp(`DRUIDJS_VERSION = '${version}'`));
  assert.ok(notice.includes(`DruidJS ${version}`), `licenses/README.txt should name DruidJS ${version}`);
  assert.ok(notice.includes(`DruidJS/tree/v${version}`), `licenses/README.txt should link the v${version} source`);
});

test('the Pyodide notice names the installed release and its CPython licence', () => {
  const { version } = JSON.parse(read('node_modules/pyodide/package.json'));
  const python = JSON.parse(read('node_modules/pyodide/pyodide-lock.json')).info.python.split('.').slice(0, 2).join('.');
  assert.ok(notice.includes(`Pyodide ${version}`), `licenses/README.txt should name Pyodide ${version}`);
  assert.ok(notice.includes(`Python-${python}.txt`), `licenses/README.txt should list Python-${python}.txt`);
  assert.ok(existsSync(new URL(`src/licenses/Python-${python}.txt`, root)), `src/licenses/Python-${python}.txt missing`);
});
