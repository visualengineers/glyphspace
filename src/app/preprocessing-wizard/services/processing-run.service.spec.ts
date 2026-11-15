import type { Mock, Mocked } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ProcessingRunService } from './processing-run.service';
import { PreprocessingService } from './preprocessing.service';
import { PreprocessingState, ProcessingProgress, DEFAULT_PROJECTION_CONFIG } from '../models/preprocessing-state';
import { ColumnConfig } from '../models/column-config';
import { DataProfile } from '../models/column-statistics';
import { ProcessedCollection } from '../models/processed-collection';
import {
  ColumnRole,
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
  ScalingMethod,
} from '../models/data-type.enum';
import { DataLoaderService } from '../../services/data-loader.service';
import { ProjectionCancelledError, ProjectionResult, ProjectionService } from '../../services/projection.service';
import { ThumbnailService } from '../../services/thumbnail.service';
import { ToastService } from '../../services/toast.service';
import { createSpyObj } from '../../../testing/create-spy-obj';
import { createTestPreprocessingService, createToastServiceSpy } from '../testing/preprocessing-test-helpers';

/** A projection whose result the test hands out when it wants to. */
interface Deferred {
  promise: Promise<ProjectionResult>;
  resolve(result: ProjectionResult): void;
  reject(error: Error): void;
}

function deferred(): Deferred {
  let resolve: (result: ProjectionResult) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<ProjectionResult>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function config(name: string): ColumnConfig {
  return {
    name,
    originalType: DataType.Numeric,
    targetType: DataType.Numeric,
    role: ColumnRole.Feature,
    encodingMethod: EncodingMethod.Normalize,
    scalingMethod: ScalingMethod.MinMax,
    includeInProjection: true,
    isColorFeature: false,
    missingValueStrategy: MissingValueStrategy.Keep,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Keep,
    enabled: true,
    hasIssues: false,
  };
}

/**
 * Issue: a background projection used to write its result into whatever
 * dataset the wizard held when it finished, and "Start over" during a run let
 * the run finish into the fresh wizard. Every run now keeps its own dataset.
 */
describe('ProcessingRunService', () => {
  let preprocessing: PreprocessingService;
  let runs: ProcessingRunService;
  let projection: Mocked<ProjectionService>;
  let dataLoader: Mocked<DataLoaderService>;
  let thumbnails: { detachArchive: Mock };
  let toast: Mocked<ToastService>;
  let processWithConfig: Mock;
  let umapRuns: Deferred[];

  function seed(datasetName: string, updates: Partial<PreprocessingState> = {}): void {
    const names = ['x', 'y', 'z'];
    const profile = {
      totalRows: 2,
      totalColumns: 3,
      fileName: `${datasetName}.csv`,
      columns: names.map(name => ({ name, dataType: DataType.Numeric, uniqueCount: 2, missingPercentage: 0 })),
    } as unknown as DataProfile;
    (preprocessing as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      rawFileName: `${datasetName}.csv`,
      uploadKey: `${datasetName}.csv`,
      dataProfile: profile,
      columnConfigs: new Map(names.map(name => [name, config(name)])),
      glyphFeatures: names,
      datasetName,
      timestamp: '20261115',
      projectionConfig: { ...DEFAULT_PROJECTION_CONFIG, enablePCA: false, enableIsoMap: false, enableUMAP: true },
      ...updates,
    });
  }

  function datasetOf(collection: ProcessedCollection | null | undefined): { positions?: Record<string, unknown> } {
    return collection?.datasets?.['d'] ?? {};
  }

  const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve));
  const umap = (x: number): ProjectionResult => ({
    method: 'umap',
    positions: [{ id: '0', x, y: x }],
    computeTime: 100,
  });

  beforeEach(() => {
    localStorage.clear();
    processWithConfig = vi.fn().mockImplementation(() => Promise.resolve({ datasets: { d: {} } }));
    preprocessing = createTestPreprocessingService({
      processingProgress: new Subject<ProcessingProgress>().asObservable(),
      processWithConfig,
      getProcessedFeatures: () => Promise.resolve('id,f\n0,1\n1,2\n'),
      pruneFiles: () => Promise.resolve(),
    });
    umapRuns = [];
    projection = createSpyObj<ProjectionService>('ProjectionService', [
      'parseCSVFeatures',
      'runFastMapSync',
      'runUMAP',
      'terminateAllWorkers',
      'clearBackgroundStatuses',
      'detachAll',
      'cancel',
      'canRetry',
      'retry',
    ]);
    projection.parseCSVFeatures.mockReturnValue({ features: [[1], [2]], ids: ['0', '1'] });
    projection.runFastMapSync.mockResolvedValue({
      method: 'fastmap',
      positions: [{ id: '0', x: 0, y: 0 }],
      computeTime: 1,
    });
    projection.runUMAP.mockImplementation(() => {
      const run = deferred();
      umapRuns.push(run);
      return run.promise;
    });
    projection.terminateAllWorkers.mockImplementation(() => {
      // Like the real service: the running jobs of the current run are cancelled.
      umapRuns.forEach(run => run.reject(new ProjectionCancelledError('umap')));
      return ['umap'];
    });
    dataLoader = createSpyObj<DataLoaderService>('DataLoaderService', [
      'getDataSetNames',
      'addProcessedDatasetToCollection',
      'loadProcessedDataset',
      'saveDatasetToStorage',
      'addPositionsToLoadedDataset',
      'attachThumbnails',
    ]);
    dataLoader.getDataSetNames.mockReturnValue([]);
    dataLoader.saveDatasetToStorage.mockResolvedValue(undefined);
    dataLoader.addPositionsToLoadedDataset.mockReturnValue(true);
    dataLoader.attachThumbnails.mockResolvedValue(3);
    thumbnails = { detachArchive: vi.fn().mockResolvedValue(undefined) };
    toast = createToastServiceSpy();
    TestBed.configureTestingModule({
      providers: [
        { provide: PreprocessingService, useValue: preprocessing },
        { provide: ProjectionService, useValue: projection },
        { provide: DataLoaderService, useValue: dataLoader },
        { provide: ThumbnailService, useValue: thumbnails },
        { provide: ToastService, useValue: toast },
      ],
    });
    runs = TestBed.inject(ProcessingRunService);
    runs.minimumRunMs = 0;
  });

  afterEach(() => localStorage.clear());

  it('adopts its result for the inputs it started with and reports completion', async () => {
    seed('wine');

    await runs.start();

    expect(runs.status?.phase).toBe('complete');
    expect(datasetOf(preprocessing.currentState.processedDataset).positions).toHaveProperty('fastmap');
    expect(projection.runUMAP).toHaveBeenCalledTimes(1);
  });

  it('joins a run in progress instead of starting a second one', async () => {
    seed('wine');
    let finish: (value: unknown) => void = () => undefined;
    processWithConfig.mockReturnValue(new Promise(resolve => (finish = resolve)));

    const first = runs.start();
    const second = runs.start();
    finish({ datasets: { d: {} } });
    await Promise.all([first, second]);

    expect(processWithConfig).toHaveBeenCalledTimes(1);
    expect(projection.runFastMapSync).toHaveBeenCalledTimes(1);
  });

  it('adds a background result to its own dataset while the wizard still holds it', async () => {
    seed('wine');
    await runs.start();

    umapRuns[0].resolve(umap(5));
    await flush();

    expect(datasetOf(preprocessing.currentState.processedDataset).positions).toHaveProperty('umap');
    expect(dataLoader.loadProcessedDataset).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('UMAP projection ready! (0.1s)', 4000);
  });

  it('delivers a background result of an opened dataset to that dataset, never to the next one', async () => {
    seed('wine');
    await runs.start();
    expect(runs.openInDashboard()).toBe(true);

    seed('cars');
    await runs.start();
    const cars = preprocessing.currentState.processedDataset;

    umapRuns[0].resolve(umap(1)); // wine's UMAP finishes after cars was processed
    await flush();

    expect(dataLoader.addPositionsToLoadedDataset).toHaveBeenCalledExactlyOnceWith('wine', '20261115', 'umap', [
      { id: '0', position: { x: 1, y: 1 } },
    ]);
    expect(dataLoader.saveDatasetToStorage).toHaveBeenLastCalledWith('wine', '20261115');
    expect(datasetOf(cars).positions).not.toHaveProperty('umap');
    expect(preprocessing.currentState.processedDataset).toBe(cars);
  });

  it('keeps an opened dataset out of the wizard: a later run does not cancel its projections', async () => {
    seed('wine');
    await runs.start();
    runs.openInDashboard();
    projection.terminateAllWorkers.mockClear();

    seed('cars');
    await runs.start();

    expect(projection.terminateAllWorkers).not.toHaveBeenCalled();
    expect(projection.detachAll).toHaveBeenCalledTimes(1);
  });

  it('is discarded when a setting changes: no result, projections cancelled, late results ignored', async () => {
    seed('wine');
    await runs.start();

    preprocessing.updateColumnConfig('x', { includeInProjection: false });
    await flush();

    expect(runs.status).toBeNull();
    expect(preprocessing.currentState.processedDataset).toBeNull();
    expect(projection.terminateAllWorkers).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(runs.openInDashboard()).toBe(false);
  });

  it('ends quietly when the wizard is reset during processing', async () => {
    seed('wine');
    let finish: (value: unknown) => void = () => undefined;
    processWithConfig.mockReturnValue(new Promise(resolve => (finish = resolve)));
    const run = runs.start();
    await flush();

    preprocessing.resetState();
    expect(runs.status).toBeNull();

    finish({ datasets: { d: {} } });
    await run;

    expect(projection.runFastMapSync).not.toHaveBeenCalled();
    expect(projection.runUMAP).not.toHaveBeenCalled();
    expect(preprocessing.currentState.processedDataset).toBeNull();
    expect(dataLoader.addProcessedDatasetToCollection).not.toHaveBeenCalled();
  });

  it('reports a failure of the primary run with its message', async () => {
    seed('wine');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    projection.runFastMapSync.mockRejectedValue(new Error('FastMap failed: boom'));

    await runs.start();

    expect(runs.status).toMatchObject({ phase: 'failed', error: 'FastMap failed: boom' });
    expect(preprocessing.currentState.isProcessing).toBe(false);
  });

  describe('Open in Glyphspace', () => {
    it('hands over the dataset with every projection finished so far, then resets the wizard', async () => {
      seed('wine');
      await runs.start();
      umapRuns[0].resolve(umap(2));
      await flush();

      runs.openInDashboard();

      const dataset = dataLoader.addProcessedDatasetToCollection.mock.calls[0][2] as { positions: object };
      expect(Object.keys(dataset.positions)).toEqual(['fastmap', 'umap']);
      expect(dataLoader.loadProcessedDataset).toHaveBeenCalledWith(dataset, 'wine', '20261115');
      expect(dataLoader.saveDatasetToStorage).toHaveBeenCalledWith('wine', '20261115');
      expect(preprocessing.currentState.dataProfile).toBeNull();
      expect(runs.status).toBeNull();
    });

    it('takes a free name when a dataset of that name was created meanwhile', async () => {
      seed('wine');
      await runs.start();
      dataLoader.getDataSetNames.mockReturnValue(['wine']);

      runs.openInDashboard();

      expect(dataLoader.loadProcessedDataset).toHaveBeenCalledWith(expect.anything(), 'wine (1)', '20261115');
    });

    it('keeps the item images chosen in Step 1 with the dataset, only now', async () => {
      seed('wine', { thumbnailArchiveName: 'images.zip' });
      const archive = new Blob(['PK']);
      vi.spyOn(preprocessing, 'thumbnailArchive').mockResolvedValue(archive);
      await runs.start();
      expect(dataLoader.attachThumbnails).not.toHaveBeenCalled();

      runs.openInDashboard();
      await flush();

      expect(dataLoader.attachThumbnails).toHaveBeenCalledWith('wine', archive);
      expect(toast.success).toHaveBeenCalledWith('3 item images added for the Image glyph type.', 4000);
    });

    it('drops images stored earlier under the name when no ZIP was chosen', async () => {
      seed('wine');
      await runs.start();

      runs.openInDashboard();

      expect(thumbnails.detachArchive).toHaveBeenCalledWith('wine');
      expect(dataLoader.attachThumbnails).not.toHaveBeenCalled();
    });

    it('refuses while there is no current result', () => {
      seed('wine');
      expect(runs.openInDashboard()).toBe(false);
      expect(dataLoader.loadProcessedDataset).not.toHaveBeenCalled();
    });
  });
});
