# Worker protocol

_For contributors who add or change a message to the Pyodide worker or the projection worker._

**Status:** Implemented · **Related:** [Processing config](processing-config.md), [ADR 0002](../decisions/0002-preprocess-in-the-browser-with-pyodide.md), [ADR 0003](../decisions/0003-druidjs-projections-in-web-workers.md), [ADR 0004](../decisions/0004-no-python-code-built-from-data.md)

## Scope

The messages between the main thread and the two kinds of web worker:

| Worker | Source | Instances | Client on the main thread |
|---|---|---|---|
| Pyodide worker | `src/app/workers/pyodide.worker.ts` | one per page, created with `DataProcessorService` when the app starts | `src/app/services/data-processor.ts` |
| Projection worker | `src/app/workers/projection.worker.ts` | one per background projection run | `src/app/services/projection.service.ts` |

## Pyodide worker

Message types: `WorkerRequest` and `WorkerReply` in `src/app/shared/interfaces/pyodide-messages.ts`.

### Lifecycle

- On start, the worker loads Pyodide `PYODIDE_VERSION` (0.29.5) from `https://cdn.jsdelivr.net/pyodide/v<version>/full/` and installs `pandas` and `scikit-learn` with micropip. Every request waits for this.
- Requests run one at a time, in the order they arrive (`runSerialized`).
- The Python modules `preprocessing_processor.py` and `preprocessing_processor_config.py` are fetched from `assets/` and written to the worker's file system the first time a request needs them.
- The worker lives as long as the page. Its file system holds the uploaded CSV files and the unpacked item images, so a reload loses them. The wizard keeps the uploaded CSV in IndexedDB and writes it back with `profileData` after a reload ([Wizard storage](wizard-storage.md#uploaded-files)); `ThumbnailService` unpacks a dataset's stored image archive again on first use.

### Matching replies to requests

- Every request sent through `DataProcessorService.sendRequestUntil` carries a numeric `requestId`. Every reply to that request, including `processingProgress` and `error`, echoes it. The client accepts only replies with its own id, so two requests of the same type never take each other's replies.
- `getThumb` is the exception: it is sent without an id, and `thumb` replies are routed by file name.
- The client gives up after 60 s (`timeoutMs`) and rejects with `Worker request "<type>" timed out after 60000ms`, where `<type>` is the reply type it waited for (e.g. `processed`), not the request type. The worker is not told and finishes the request; its late reply is ignored.

### Requests and replies

| Request | Fields | Reply | Notes |
|---|---|---|---|
| `profileData` | `fileName`, `buffer` | `dataProfile { profile }` | Writes the file and tracks it as an input. `profile` is the result of `profile_data` plus `fileSize` in bytes. |
| `computeHistogram` | `fileName`, `columnName`, `bins` (default 50) | `histogram { columnName, data }` | |
| `detectOutliers` | `fileName`, `columnName`, `method` | `outliers { columnName, data }` | `method` as in [Processing config](processing-config.md#column-config). |
| `detectDuplicates` | `fileName`, `subsetColumns?` | `duplicates { data }` | |
| `processWithConfig` | `fileName`, `config` | `processingProgress { step, progress, message }` (any number), then `processed { dataset }` | `config` is a `ProcessingRequestConfig`. The result is written to `<fileName>.result.json`, read back, sent, and the file is deleted. |
| `getProcessedFeatures` | — | `processedFeatures { data }` | `data` is the text of `processed_features.csv` from the last `processWithConfig`. |
| `pruneFiles` | `keep: string[]` | `filesPruned { removed }` | Deletes every tracked input not in `keep`, with its result file. |
| `getJson` | `file` | `json { file, data }` | Reads and parses a JSON file from the worker's file system. |
| `unzip` | `folder`, `buffer` | `unzipped { folder, images }` | Writes `<folder>.zip`, unpacks it flat into `/<folder>/` (files in subfolders land in `/<folder>/` itself) and lists its `.png`, `.jpg`, `.jpeg` and `.webp` files, extension in any case. `ThumbnailService` sends it with the folders `thumbnails-0`, `thumbnails-1`, … to unpack an item image archive. |
| `getThumb` | `file` | `thumb { file, data }` | Reads `/<file>`, e.g. `thumbnails-0/17.jpg`; `data` is transferred, not copied. |

Any exception becomes `error { message }`. The client rejects the pending request with `new Error(message)`; every `error` reply is also logged to the console, with or without a pending request.

The `processed` reply is typed as `DatasetCollection`, but the payload has the shape `{ datasets, selectedDataset }` described in [Processing config](processing-config.md#result). The wizard reads it through the `ProcessedCollection` type in `src/app/preprocessing-wizard/services/processing-config.ts`.

### Rules for requests that touch files or Python

- **File names** pass `assertSafeFileName` (`src/app/workers/pyodide-files.ts`) before anything is written: a single path component, not `.` or `..`, without `/`, `\` or NUL, and not ending in `.py`, `.pyc` or `.so` (the worker's directory is on Python's import path, so such a file could replace a module).
- **Python calls** are built only with `pythonCall(module, function, args)`, plus one fixed source block for unzipping, `unpackZipCall(zipPath)` (both in `src/app/workers/pyodide-calls.ts`). Module and function names are fixed identifiers; arguments, including column names from the CSV header and the config, are passed as data, never as source code. See [ADR 0004](../decisions/0004-no-python-code-built-from-data.md).
- **Inputs stay** in the file system after processing, so the user can process again without uploading again. The wizard calls `pruneFiles` with every file name still referenced by its state or its undo/redo history.

## Projection worker

Message types: `ProjectionWorkerRequest` and `ProjectionWorkerResponse` in `src/app/shared/types/projection.types.ts`.

### Lifecycle

- `ProjectionService` creates a new worker for each background run, sends one `compute` request, and terminates the worker when the result or an error arrives, or when the run is cancelled.
- A run of the same method started later does not stop an earlier one; the earlier run keeps reporting and settles its own promise.
- The primary FastMap projection does not use this worker: it runs on the main thread (`runFastMapSync`) and cannot be cancelled.

### Messages

Request:

```ts
{ type: 'compute', method: ProjectionMethod, features: number[][], ids: (string | number)[], config?: ProjectionComputeConfig }
```

`features[i]` is the projection input of the item `ids[i]`. `config` carries the method's parameters: `perplexity` and `iterations` for t-SNE, `neighbors` and `minDist` for UMAP, `isomapNeighbors`, `lleNeighbors`, `ltsaNeighbors`.

Responses:

| `type` | Fields | When |
|---|---|---|
| `progress` | `method`, `progress` (0–100), `message` | t-SNE only, every 50 iterations |
| `result` | `method`, `positions: { id, x, y }[]`, `computeTime` (ms) | once, at the end |
| `error` | `method`, `error` | instead of `result` |

A worker `onerror` event is treated like an `error` response. Messages that arrive after the run ended or was cancelled are ignored.

### Methods and parameters

`druidSpecFor` and `runTsneProjection` in `src/app/workers/druid-runner.ts` map each method to a DruidJS class:

| Method | DruidJS class | Parameters |
|---|---|---|
| `pca` | `PCA` | `d: 2` |
| `fastmap` | `FASTMAP` | `d: 2` |
| `isomap`, `lle`, `ltsa` | `ISOMAP`, `LLE`, `LTSA` | `d: 2`, `neighbors` when > 0 (otherwise DruidJS's default) |
| `umap` | `UMAP` | `n_neighbors` (default 15), `min_dist` (default 0.1; 0 is valid), `local_connectivity: 1` |
| `tsne` | `TSNE` | `perplexity` (default 30), `epsilon: 10`, `iterations` (default 1000), run in chunks of 50 |
| `mds`, `sammon` | `MDS`, `SAMMON` | `d: 2` |
| `trimap` | `TriMap` | `d: 2`, DruidJS defaults |
| `topomap` | `TopoMap` | none (always 2-D) |

The parameter objects use DruidJS's own type declarations, so a parameter that DruidJS renames or drops fails to compile.

## Compatibility

Both workers ship in the same build as their clients, so a message can change freely as long as both sides change in the same commit. Keep the `requestId` echo on every Pyodide reply.
