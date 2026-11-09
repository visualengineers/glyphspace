# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

The project documentation is in `docs/` (index: `docs/README.md`). Read the relevant page before changing an area:

- `docs/development/architecture.md`: module map, data flow, where state lives.
- `docs/development/dashboard.md`, `wizard.md`, `processing-pipeline.md`: how those parts work.
- `docs/specs/`: the contracts (dataset format, CSV input, processing config, worker protocol, wizard storage). Keep them in sync with the code.
- `docs/decisions/`: ADRs. Add one for a decision others will have to live with, and a row in `docs/decisions/README.md`.
- `docs/development/documentation.md`: which document to update for which change. Update docs and `CHANGELOG.md` (under Unreleased) in the same change as the code.

## Architecture in brief

GlyphSpace is an Angular 21 app (standalone components) that shows datasets as glyphs placed by dimensionality reductions. There is no backend; it is deployed as a static site to GitHub Pages.

- **Data:** bundled datasets are JSON files in `src/assets/data/`, listed in `src/default-dataset.ts`. Uploaded CSV files are processed in the browser by the preprocessing wizard.
- **Python in the browser:** the wizard's pipeline (`src/assets/preprocessing_processor*.py`) runs on Pyodide in `src/app/workers/pyodide.worker.ts`. Never build Python source from request data; use `pythonCall` (`src/app/workers/pyodide-calls.ts`).
- **Projections:** DruidJS. FastMap runs on the main thread; other methods run in one web worker each (`src/app/workers/projection.worker.ts`).
- **CLI:** `python tools/process.py <file.csv>` writes a bundled dataset and regenerates `src/default-dataset.ts`; without arguments it only regenerates `src/default-dataset.ts`. Re-run it after adding or deleting files in `src/assets/data/` or `src/assets/thumbnails/`, and check the dataset order in the result: the first entry opens on start.

## Commands

```bash
npm start            # dev server (ng serve)
npm run build        # production build
npm test             # unit tests, Vitest in headless Chromium (watch mode)
npm run test:ci      # unit tests once
npx ng test --include=<path>   # one spec file
npm run lint         # ESLint
npm run format       # Prettier
python -B -m pytest -p no:cacheprovider tools/tests   # Python tests
```

There are no end-to-end tests.
