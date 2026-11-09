# 0003. Compute projections with DruidJS, FastMap first, the rest in web workers

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2025-12-28 (DruidJS, worker per method), 2026-01 (FastMap first) · **Related:** [Worker protocol](../specs/worker-protocol.md), [Processing config](../specs/processing-config.md#projections), [ADR 0002](0002-preprocess-in-the-browser-with-pyodide.md)

## Context

The wizard first computed projections in Python on Pyodide, with scikit-learn's PCA, IncrementalPCA and t-SNE. The comments left in `compute_projections` (`src/assets/preprocessing_processor_config.py`) give the reasons for moving them out:

- Projections no longer block the UI while they compute.
- A first projection is available immediately; the others follow in the background.
- UMAP works, which it didn't under Pyodide.
- The Python code only cleans and encodes.

## Decision

- Python exports the scaled feature matrix as `processed_features.csv`; projections are computed in JavaScript with [DruidJS](https://github.com/saehm/DruidJS) (commit 067a29a, "change to druid js").
- FastMap is the primary projection (commit 628d0e1, "fastmap default"). It runs on the main thread right after processing, so the dashboard can open as soon as the data is ready.
- Every other method the user enables runs in its own web worker (`src/app/workers/projection.worker.ts`), started by `ProjectionService`. Each can be cancelled and retried, and its result is added to the dataset when it arrives.

## Alternatives considered

Keeping the projections in Pyodide was the starting point and was dropped for the reasons above. Others are not recorded.

## Consequences

- The dashboard opens with FastMap; slower methods (t-SNE, UMAP, Sammon) arrive later as toasts and new projection entries.
- FastMap on the main thread can't be cancelled and blocks the UI while it runs.
- Each background worker receives its own copy of the feature matrix, so memory grows with the number of methods running at once.
- DruidJS is licensed LGPL-3.0-or-later. The deployed site ships its licence texts and a notice (`src/licenses/`).
- DruidJS's own bugs become ours: LLE is hidden (`HIDDEN_PROJECTION_METHODS`) because DruidJS 0.9 computes wrong LLE embeddings ([wizard redesign spec](../specs/wizard-redesign.md#ausblick--offen-aber-nicht-im-umsetzungsrahmen)).
- DruidJS 0.9 (upgraded in 2026-09) brings WASM kernels with a JavaScript fallback. Its worker pool is Node-only, so browsers spawn no nested workers.
- The CLI still computes PCA, UMAP and t-SNE in Python (scikit-learn, umap-learn), so bundled and uploaded datasets have different projections.
