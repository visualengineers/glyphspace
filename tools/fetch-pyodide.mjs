#!/usr/bin/env node
// Downloads the Python packages the import wizard needs, so the site serves Pyodide itself
// instead of loading it from a CDN at runtime (ADR 0013).
//
// - The Pyodide runtime (pyodide.mjs, pyodide.asm.mjs, pyodide.asm.wasm, python_stdlib.zip,
//   pyodide-lock.json) comes from the `pyodide` npm package; package-lock.json pins its version
//   and integrity hash.
// - The wheels listed in src/app/workers/pyodide-packages.json and all their dependencies are
//   resolved from that pyodide-lock.json, downloaded from the matching Pyodide release and checked
//   against the lock file's SHA-256 before they are kept. A file that is already present with the
//   right hash is not downloaded again, so the script works offline once it has run.
// - THIRD-PARTY-LICENSES.txt collects the licence files shipped inside the wheels.
//
// angular.json serves both folders under `pyodide/`. Runs before `npm start` and `npm run build`.
// No dependencies beyond Node itself.

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PYODIDE_DIR = path.join(ROOT, 'node_modules', 'pyodide');
const PACKAGES_FILE = path.join(ROOT, 'src', 'app', 'workers', 'pyodide-packages.json');
export const OUT_DIR = path.join(ROOT, '.pyodide-packages');
const LICENSES_FILE = 'THIRD-PARTY-LICENSES.txt';

const sha256 = data => createHash('sha256').update(data).digest('hex');

/** PEP 503 name normalisation, used for the lock file's keys and `depends` entries. */
const normalize = name => name.toLowerCase().replace(/[-_.]+/g, '-');

/** The requested packages and everything they depend on, from the lock file. */
export function resolvePackages(lock, requested) {
  const byName = new Map(Object.entries(lock.packages).map(([key, pkg]) => [normalize(key), pkg]));
  const resolved = new Map();
  const visit = name => {
    const key = normalize(name);
    if (resolved.has(key)) return;
    const pkg = byName.get(key);
    if (!pkg) throw new Error(`Package "${name}" is not in pyodide-lock.json`);
    if (!pkg.file_name || /^[a-z]+:/i.test(pkg.file_name) || pkg.file_name.includes('/')) {
      throw new Error(`Package "${name}" has no plain file name in pyodide-lock.json: ${pkg.file_name}`);
    }
    if (!/^[0-9a-f]{64}$/.test(pkg.sha256 ?? '')) throw new Error(`Package "${name}" has no SHA-256 in pyodide-lock.json`);
    resolved.set(key, pkg);
    for (const dep of pkg.depends ?? []) visit(dep);
  };
  requested.forEach(visit);
  return [...resolved.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function fileHash(file) {
  try {
    return sha256(await readFile(file));
  } catch {
    return null;
  }
}

async function download(url, dest, expected) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${url} failed: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  const actual = sha256(data);
  if (actual !== expected) {
    throw new Error(`SHA-256 mismatch for ${url}\n  expected ${expected}\n  received ${actual}`);
  }
  const part = `${dest}.part`;
  await writeFile(part, data);
  await rename(part, dest);
  return data.length;
}

/** The entries of a ZIP archive (a wheel), enough to read its licence files. No ZIP64. */
export function* zipEntries(buffer) {
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 0xffff); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('not a ZIP archive');
  const count = buffer.readUInt16LE(end + 10);
  let p = buffer.readUInt32LE(end + 16);
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(p) !== 0x02014b50) throw new Error('corrupt ZIP central directory');
    const method = buffer.readUInt16LE(p + 10);
    const compressedSize = buffer.readUInt32LE(p + 20);
    const nameLength = buffer.readUInt16LE(p + 28);
    const extraLength = buffer.readUInt16LE(p + 30);
    const commentLength = buffer.readUInt16LE(p + 32);
    const localHeader = buffer.readUInt32LE(p + 42);
    const name = buffer.toString('utf8', p + 46, p + 46 + nameLength);
    p += 46 + nameLength + extraLength + commentLength;
    yield {
      name,
      read() {
        const start = localHeader + 30 + buffer.readUInt16LE(localHeader + 26) + buffer.readUInt16LE(localHeader + 28);
        const raw = buffer.subarray(start, start + compressedSize);
        if (method === 0) return raw;
        if (method === 8) return inflateRawSync(raw);
        throw new Error(`unsupported ZIP compression method ${method} for ${name}`);
      },
    };
  }
}

const LICENSE_FILE = /^(licen[cs]e|copying|notice|authors)/i;

/** Licence name and licence texts of one wheel, from its .dist-info folder. */
export function wheelLicenses(wheel) {
  let license = '';
  const texts = [];
  for (const entry of zipEntries(wheel)) {
    const [top, ...rest] = entry.name.split('/');
    if (!top.endsWith('.dist-info') || rest.length === 0 || entry.name.endsWith('/')) continue;
    if (rest.length === 1 && rest[0] === 'METADATA') {
      const lines = entry.read().toString('utf8').split(/\r?\n/);
      const field = key => lines.find(line => line.startsWith(`${key}: `))?.slice(key.length + 2).trim();
      // Some wheels put the whole licence text into `License`; fall back to the trove classifiers.
      const short = field('License') && field('License').length <= 40 ? field('License') : undefined;
      const classifiers = lines
        .filter(line => line.startsWith('Classifier: License :: '))
        .map(line => line.split(' :: ').at(-1));
      license = field('License-Expression') ?? short ?? classifiers.join(', ');
    } else if (rest[0] === 'licenses' || LICENSE_FILE.test(rest.at(-1))) {
      texts.push({ name: entry.name, text: entry.read().toString('utf8').trim() });
    }
  }
  return { license, texts };
}

function licensesDocument(version, packages, wheels) {
  const rule = '-'.repeat(80);
  const parts = [
    'Python packages served with GlyphSpace',
    '======================================',
    '',
    `The import wizard runs these packages on Pyodide ${version} (MPL-2.0, which includes CPython`,
    'under the PSF licence; see ../licenses/README.txt). They are unmodified wheels from the',
    `Pyodide ${version} distribution (https://github.com/pyodide/pyodide/releases/tag/${version}).`,
    'Their licences, as shipped inside each wheel, follow.',
    '',
  ];
  for (const pkg of packages) {
    const { license, texts } = wheelLicenses(wheels.get(pkg.file_name));
    parts.push(rule, `${pkg.name} ${pkg.version}${license ? ` (${license.split('\n')[0]})` : ''}`, rule, '');
    if (texts.length === 0) parts.push('(The wheel contains no licence file.)', '');
    for (const { name, text } of texts) parts.push(`[${name}]`, '', text, '');
  }
  return `${parts.join('\n').trimEnd()}\n`;
}

async function main() {
  const { version } = JSON.parse(await readFile(path.join(PYODIDE_DIR, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(path.join(PYODIDE_DIR, 'pyodide-lock.json'), 'utf8'));
  const requested = JSON.parse(await readFile(PACKAGES_FILE, 'utf8'));
  const packages = resolvePackages(lock, requested);
  const baseUrl = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;

  await mkdir(OUT_DIR, { recursive: true });
  const keep = new Set([LICENSES_FILE, ...packages.map(pkg => pkg.file_name)]);
  for (const name of await readdir(OUT_DIR)) {
    if (!keep.has(name)) await rm(path.join(OUT_DIR, name), { recursive: true, force: true });
  }

  const fetched = [];
  const wheels = new Map();
  for (const pkg of packages) {
    const dest = path.join(OUT_DIR, pkg.file_name);
    if ((await fileHash(dest)) !== pkg.sha256) {
      await download(baseUrl + pkg.file_name, dest, pkg.sha256);
      fetched.push(pkg.name);
    }
    wheels.set(pkg.file_name, await readFile(dest));
  }
  await writeFile(path.join(OUT_DIR, LICENSES_FILE), licensesDocument(version, packages, wheels));

  const total = [...wheels.values()].reduce((sum, data) => sum + data.length, 0);
  console.log(
    `Pyodide ${version}: ${packages.length} packages (${(total / 1e6).toFixed(1)} MB) in ` +
      `${path.relative(ROOT, OUT_DIR)}/, ${fetched.length ? `downloaded ${fetched.join(', ')}` : 'all up to date'}`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`fetch-pyodide: ${error.message}`);
    process.exit(1);
  });
}
