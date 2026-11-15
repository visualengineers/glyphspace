# Worker protocol

_For contributors who add or change a message to the Pyodide worker or the projection worker._

**Status:** Implemented · **Related:** [Processing config](processing-config.md), [ADR 0002](../decisions/0002-preprocess-in-the-browser-with-pyodide.md), [ADR 0003](../decisions/0003-druidjs-projections-in-web-workers.md), [ADR 0004](../decisions/0004-no-python-code-built-from-data.md)

## Scope

The messages between the main thread and the two kinds of web worker:

| Worker | Source | Instances | Client on the main thread |
|---|---|---|---|
| Pyodide worker | `src/app/workers/pyodide.worker.ts` | at most one at a time, created by `DataProcessorService` on first need and replaced after a crash or a timeout | `src/app/services/data-processor.ts` |
| Projection worker | `src/app/workers/projection.worker.ts` | one per background projection run | `src/app/services/projection.service.ts` |

## Pyodide worker

Message types: `WorkerRequest` and `WorkerReply` in `src/app/shared/interfaces/pyodide-messages.ts`.

### Lifecycle

- `DataProcessorService` creates the worker on first need: the first request, or `preload()`, which `PreprocessingService` calls when the wizard opens. The app's start does not create it.
- On start, the worker loads Pyodide `PYODIDE_VERSION` (314.0.7) from `https://cdn.jsdelivr.net/pyodide/v<version>/full/` and installs `pandas` and `scikit-learn` with micropip, then posts `ready`, or `startupFailed { message }` if that fails. Every request waits for this. `DataProcessorService.runtimeStatus` publishes `idle`, `starting`, `ready` or `failed`.
- Requests run one at a time, in the order they arrive (`runSerialized`). When the worker starts a request it posts `started` with the request's id.
- The Python modules `preprocessing_processor.py` and `preprocessing_processor_config.py` are fetched from `assets/` and written to the worker's file system the first time a request needs them.
- The worker's file system holds the uploaded CSV files and the unpacked item images. `DataProcessorService` keeps their contents: an input once `profileData` succeeded, an archive once `unzip` did, until `pruneFiles` or `removeFolder` lets it go.
- **Replacing the worker.** `DataProcessorService` terminates the worker and fails every waiting request when the worker fails (`onerror`, `onmessageerror`), when Pyodide reports a fatal error (the worker posts `crashed { message }` after an error that matches `fatally failed`, `suffered a fatal error` or `Aborted(`), when a request times out (it would keep running and hold up every later request), or when the runtime has not started within 10 minutes. The next request creates a new worker, which first gets the kept files back (`putFile`, `unzip`). Thumbnails still waiting are requested again right away, except after a failed start-up, which is only tried again by the next request. Messages from a replaced worker are ignored.
- A reload loses the worker's files. The wizard keeps the uploaded CSV in IndexedDB and writes it back with `profileData` after a reload ([Wizard storage](wizard-storage.md#uploaded-files)); `ThumbnailService` unpacks a dataset's stored image archive again on first use.

### Matching replies to requests

- Every request sent through `DataProcessorService.sendRequestUntil` carries a numeric `requestId`. Every reply to that request, including `started`, `processingProgress` and `error`, echoes it. The client accepts only replies with its own id, so two requests of the same type never take each other's replies, and it forwards `processingProgress` only for a request it is still waiting for.
- `getThumb` is the exception: it is sent without an id, and `thumb` replies are routed by file name.
- The client gives up 60 s (`REQUEST_TIMEOUT_MS`) after the request's `started`, not after sending it, so the runtime's start-up and the requests queued ahead don't count. It rejects with `Worker request "<type>" timed out after 60000ms`, where `<type>` is the reply type it waited for (e.g. `processed`), not the request type, and replaces the worker (see Lifecycle), because Python can't be interrupted.

### Requests and replies

| Request | Fields | Reply | Notes |
|---|---|---|---|
| `profileData` | `fileName`, `buffer` | `dataProfile { profile }` | Writes the file and tracks it as an input. `profile` is the result of `profile_data` plus `fileSize` in bytes. |
| `computeHistogram` | `fileName`, `columnName`, `bins` (default 50) | `histogram { columnName, data }` | |
| `detectOutliers` | `fileName`, `columnName`, `method` | `outliers { columnName, data }` | `method` as in [Processing config](processing-config.md#column-config). |
| `detectDuplicates` | `fileName`, `subsetColumns?` | `duplicates { data }` | |
| `processWithConfig` | `fileName`, `config` | `processingProgress { step, progress, message }` (any number), then `processed { dataset }` | `config` is a `ProcessingRequestConfig`. The result is written to `/glyphspace-output/<fileName>.result.json`, read back, sent, and the file is deleted. |
| `getProcessedFeatures` | — | `processedFeatures { data }` | `data` is the text of `/glyphspace-output/processed_features.csv` from the last `processWithConfig`. |
| `pruneFiles` | `keep: string[]` | `filesPruned { removed }` | Deletes every tracked input not in `keep`, with its result file. |
| `getJson` | `file` | `json { file, data }` | Reads and parses a JSON file from the worker's file system. |
| `unzip` | `folder`, `buffer` | `unzipped { folder, images, duplicates }` | Writes `<folder>.zip`, unpacks its `.png`, `.jpg`, `.jpeg` and `.webp` files (extension in any case) flat into `/<folder>/` and deletes the zip. Files in subfolders land in `/<folder>/` itself, with `/` or `\` as the separator; other files and macOS resource forks (`__MACOSX/`, `._<name>`) are skipped. The first file of a name wins; the later ones are listed in `duplicates`. An archive with more than 100 000 files, an image above 32 MB or images above 512 MB together is rejected before anything is written (`ZIP_LIMITS` in `src/app/workers/pyodide-calls.ts`). `ThumbnailService` sends it with the folders `thumbnails-0`, `thumbnails-1`, … to unpack an item image archive. |
| `removeFolder` | `folder` | `folderRemoved { folder }` | Deletes `/<folder>/` if an `unzip` made it (it holds the marker `.unpacked`), otherwise nothing. `ThumbnailService` sends it when a dataset's archive is replaced or the dataset is forgotten. |
| `putFile` | `fileName`, `buffer` | `filePut { fileName }` | Writes an input file and tracks it, like `profileData` without the profile. Gives a replaced worker its files back. |
| `getThumb` | `file` | `thumb { file, data }` | Reads `/<file>`, e.g. `thumbnails-0/17.jpg`; `data` is transferred, not copied. |

Lifecycle messages, without a `requestId`: `ready`, `startupFailed { message }`, `crashed { message }` (see Lifecycle).

Any exception becomes `error { message }`. The client rejects the pending request with `new Error(message)`; every `error` reply is also logged to the console, with or without a pending request.

The `processed` reply is typed as `DatasetCollection`, but the payload has the shape `{ datasets, selectedDataset }` described in [Processing config](processing-config.md#result). The wizard reads it through the `ProcessedCollection` type in `src/app/preprocessing-wizard/services/processing-config.ts`.

### Rules for requests that touch files or Python

- **File names** pass `assertSafeFileName` (`src/app/workers/pyodide-files.ts`) before anything is written: a single path component, not `.` or `..`, without `/`, `\` or NUL, and not ending in `.py`, `.pyc` or `.so` (the worker's directory is on Python's import path, so such a file could replace a module).
- **Python calls** are built only with `pythonCall(module, function, args)`, plus two fixed source blocks for unpacking and deleting image folders, `unpackZipCall(zipPath)` and `removeUnpackedCall(folder)` (all in `src/app/workers/pyodide-calls.ts`; `tools/tests/test_worker_sources.py` runs the blocks with CPython). Module and function names are fixed identifiers; arguments, including column names from the CSV header and the config, are passed as data, never as source code. See [ADR 0004](../decisions/0004-no-python-code-built-from-data.md).
- **Inputs stay** in the file system after processing, so the user can process again without uploading again. The wizard calls `pruneFiles` with every file name still referenced by its state or its undo/redo history.
- **Outputs** of the pipeline go to `/glyphspace-output/` (`OUTPUT_FOLDER` in `src/app/workers/pyodide-files.ts`). Uploads are single path components in the working directory, so no upload can be overwritten by an output, whatever its name (`processed_features.csv`).

## Projection worker

Message types: `ProjectionWorkerRequest` and `ProjectionWorkerResponse` in `src/app/shared/types/projection.types.ts`.

### Lifecycle

- `ProjectionService` creates a new worker for each background run, sends one `compute` request, and terminates the worker when the result or an error arrives, or when the run is cancelled.
- A run of the same method started later does not stop an earlier one; the earlier run keeps reporting and settles its own promise.
- The primary FastMap projection does not use this worker: it runs on the main thread (`runFastMapSync`) and cannot be cancelled.

### Messages

Request:

```ts
{ type: 'compute', method: ProjectionMethod, features: number[][], ids: string[], config?: ProjectionComputeConfig }
```

`features[i]` is the projection input of the item `ids[i]`. Ids are the strings Python wrote and come back unchanged in `positions`. `config` carries the method's parameters: `perplexity` and `iterations` for t-SNE, `neighbors` and `minDist` for UMAP, `isomapNeighbors`, `lleNeighbors`, `ltsaNeighbors`.

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

### Input checks

DruidJS returns NaN coordinates for degenerate input instead of failing, so `runDruidProjection` and `runTsneProjection` check the input first and the result afterwards (the same code runs FastMap on the main thread):

1. **Input** (`prepareProjectionInput`): at least one row, rows of equal length, finite values; one id per row. Constant columns are dropped, since they change no distance. If no column varies, every item is placed at (0, 0). If every varying column is an affine function of the first (a single varying column, columns that repeat each other, every input of two rows), the items lie on a line and are placed along it at y = 0, with their distances preserved. DruidJS is not called in these two cases.
2. **Parameters**: the neighbours of IsoMap, LLE, LTSA and UMAP must be fewer than the rows, the t-SNE perplexity below the number of rows.
3. **Result** (`assertFiniteEmbedding`): one point per row, every coordinate finite. Otherwise the run fails with `<CLASS> returned invalid coordinates for <k> of <n> items: the projection input is singular for this method …` (for example IsoMap on many identical rows).

A failed check is an `error` response like any other DruidJS failure; the wizard classifies the message (K4 for parameters, K3 for singular input).

## Compatibility

Both workers ship in the same build as their clients, so a message can change freely as long as both sides change in the same commit. Keep the `requestId` echo on every Pyodide reply.
