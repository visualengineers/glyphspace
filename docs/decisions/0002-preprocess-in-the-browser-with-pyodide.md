# 0002. Preprocess uploaded data in the browser with Pyodide

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2025-07 · **Related:** [Worker protocol](../specs/worker-protocol.md), [Processing config](../specs/processing-config.md), [ADR 0004](0004-no-python-code-built-from-data.md)

## Context

What the repository shows:

- GlyphSpace is a rewrite of Glyphboard, whose data preparation lived in a separate Python service, the [Glyphboard backend](https://github.com/visualengineers/glyphboard-backend).
- GlyphSpace is deployed as a static site on GitHub Pages (`.github/workflows/deploy.yaml`). There is no server of its own.
- The data preparation is written in Python with pandas and scikit-learn, both in the CLI (`tools/process.py`) and in the browser pipeline (`src/assets/preprocessing_processor*.py`).
- Pyodide was part of the app from the first day: the commits of 2025-07-10 already fix "python pyodide worker in build" and the Pages deploy "with pyodide".

The reasons were not written down at the time.

## Decision

Uploaded CSV files are profiled and processed in the browser, by Python code running on Pyodide in a dedicated web worker (`src/app/workers/pyodide.worker.ts`). Pyodide and the packages are loaded from the jsDelivr CDN at runtime; the Python modules are served from `src/assets/`.

## Alternatives considered

None are recorded. The obvious ones are a server-side Python service, as in Glyphboard, which a static Pages deployment can't host, and a rewrite of the preparation in TypeScript, which would give up pandas and scikit-learn.

## Consequences

- The app runs without a backend, and uploaded data is processed locally: the CSV is not sent anywhere.
- Every page load fetches Pyodide, pandas and scikit-learn from the CDN (or the browser cache) in the background, and the first upload waits until they are ready. That takes time and needs network access, and the CDN is a runtime dependency (`PYODIDE_VERSION` pins the release).
- Browser memory and the 60 s request timeout limit dataset size (error classes K6, K7).
- The uploaded file lives in the worker's file system and is lost on reload ([Wizard storage](../specs/wizard-storage.md)).
- Request data reaches a Python interpreter, which makes code injection a risk; [ADR 0004](0004-no-python-code-built-from-data.md) addresses it.
- The CLI and the browser pipeline are separate Python code bases and differ in behaviour ([CSV input](../specs/csv-input.md)).
- Projections were later moved out of Python ([ADR 0003](0003-druidjs-projections-in-web-workers.md)).

## Notes

- **2026-11-09:** The worker's file system is still emptied by a reload, but the uploaded file is no longer lost with it: since #92 the wizard keeps it in IndexedDB and writes it back into the worker after a reload ([Wizard storage](../specs/wizard-storage.md#uploaded-files)).
