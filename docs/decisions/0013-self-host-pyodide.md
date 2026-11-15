# 0013. Serve Pyodide and its packages from the site itself

**Status:** Accepted · **Date:** 2026-11-14 · **Related:** [ADR 0002](0002-preprocess-in-the-browser-with-pyodide.md) (partly supersedes its "loaded from the jsDelivr CDN"), [Deployment](../development/deployment.md), [Worker protocol](../specs/worker-protocol.md)

## Context

[ADR 0002](0002-preprocess-in-the-browser-with-pyodide.md) runs the wizard's Python pipeline on Pyodide, which the worker loaded at runtime from `https://cdn.jsdelivr.net/pyodide/v<version>/full/`, then installed pandas and scikit-learn with micropip. A project review (November 2026) found three problems with that:

- **Integrity.** `pyodide.mjs`, the WebAssembly runtime and `pyodide-lock.json` came from the CDN unchecked. Pyodide does check the wheels against the lock file, but the lock file came from the same CDN, so jsDelivr was the only trust anchor for code that handles the user's data. micropip could also fall back to PyPI for a name that isn't in the lock file.
- **Privacy.** Every visitor's browser contacted a third party, before any interaction, although the app promises that data stays in the browser.
- **No Content-Security-Policy.** A policy that allows a CDN for scripts is weak, so the site had none; an injection through uploaded data had no second line of defence.

The packages the wizard needs are about 40 MB: the Pyodide runtime (about 13.5 MB) and nine wheels (about 26.6 MB: pandas, numpy, scipy, scikit-learn and their dependencies). GitHub Pages serves sites up to 1 GB.

## Decision

We serve Pyodide and the wheels from the site, under `pyodide/` next to the app:

- The runtime files come from the `pyodide` npm package, pinned to an exact version in `package.json`; `package-lock.json` holds its integrity hash, like every other dependency.
- `tools/fetch-pyodide.mjs` (run before `npm start` and `npm run build`) resolves the packages in `src/app/workers/pyodide-packages.json` and their dependencies from that package's `pyodide-lock.json`, downloads the wheels from the matching Pyodide release, and keeps them only if their SHA-256 matches the lock file. It also collects the licence files inside the wheels.
- The worker loads Pyodide from `pyodide/` relative to its own URL and installs packages only with `loadPackage`, which fetches them with the lock file's hash as integrity. No micropip, no PyPI.
- The site sends a Content-Security-Policy that allows only its own origin (see [Deployment](../development/deployment.md#content-security-policy)).
- Deployment moves to GitHub's Pages artifacts (`actions/deploy-pages`), so the 40 MB are not committed to a `gh-pages` branch on every deploy.

## Alternatives considered

- **Keep the CDN and harden it**: load packages only through the lock file and allow exactly the CDN path in a CSP. Smaller change, but jsDelivr stays the trust anchor for the runtime and the lock file, and visitors' IP addresses still go to a third party.
- **Commit the wheels to the repository.** Simple to deploy, but 27 MB of binaries per Pyodide upgrade in the git history.
- **Download the whole Pyodide distribution** (several hundred MB) instead of the needed packages: no resolution step, but a much larger download in CI and on every developer machine.

## Consequences

- The site makes no third-party requests, so a CSP of `'self'` is possible; the wizard works wherever the site is reachable.
- The deployed site grows by about 40 MB. Browsers cache the files; the first import costs the same download as before, now from the site itself.
- `npm start` and `npm run build` need network access the first time (about 27 MB), and whenever the Pyodide version changes. Afterwards they work offline. Calling `ng serve` or `ng build` directly skips the download.
- Upgrading Pyodide means changing one version in `package.json`; the package list and their hashes follow from the new lock file. The packages that ship with Pyodide decide the pandas, numpy and scikit-learn versions, which `requirements-dev.txt` pins for the Python tests.
- The site redistributes Pyodide (MPL-2.0), CPython (PSF) and the wheels' licences; `licenses/` and `pyodide/THIRD-PARTY-LICENSES.txt` carry them.
- GitHub Pages must publish from GitHub Actions (Settings → Pages → Source), a one-time change in the repository settings.
