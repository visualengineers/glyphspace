import type { Mock, Mocked } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { Step6ReviewProcessingComponent } from './step6-review-processing.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataLoaderService } from '../../../services/data-loader.service';
import {
  BackgroundStatus,
  ProjectionCancelledError,
  ProjectionResult,
  ProjectionService,
} from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { DEFAULT_PROJECTION_CONFIG, PreprocessingState, ProcessingProgress } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import { DataProfile } from '../../models/column-statistics';
import { DatasetCollection } from '../../../shared/interfaces/dataset-collection';
import { WizardStepId } from '../../shared/constants/step-info';
import { classifyProcessingError } from '../../shared/constants/wizard-error-classes';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from '../../models/data-type.enum';
import { createSpyObj } from '../../../../testing/create-spy-obj';
import { createTestPreprocessingService, createToastServiceSpy } from '../../testing/preprocessing-test-helpers';

function makeConfig(name: string, isColorFeature = false): ColumnConfig {
  return {
    name,
    originalType: DataType.Numeric,
    targetType: DataType.Numeric,
    encodingMethod: EncodingMethod.Normalize,
    scalingMethod: ScalingMethod.MinMax,
    includeInProjection: true,
    isColorFeature,
    missingValueStrategy: MissingValueStrategy.Keep,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Keep,
    enabled: true,
    hasIssues: false,
  };
}

function setState(service: PreprocessingService, updates: Partial<PreprocessingState>): void {
  (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState(updates);
}

/** A loaded three-column file on the review step. */
function seedReview(service: PreprocessingService, updates: Partial<PreprocessingState> = {}): void {
  const names = ['x', 'y', 'z'];
  const profile: DataProfile = {
    totalRows: 100,
    totalColumns: names.length,
    fileSize: 1000,
    fileName: 'test.csv',
    columns: names.map(name => ({
      name,
      dataType: DataType.Numeric,
      count: 100,
      missingCount: 0,
      missingPercentage: 0,
      uniqueCount: 50,
    })),
    qualityScore: 90,
    duplicateCount: 0,
    previewRows: [],
  };
  setState(service, {
    rawFileName: 'test.csv',
    dataProfile: profile,
    columnConfigs: new Map(names.map(name => [name, makeConfig(name, name === 'x')])),
    glyphFeatures: [...names],
    ...updates,
  });
  service.goToStep('review');
}

/** Only FastMap: no background projection is started by a processing run. */
const NO_BACKGROUND_METHODS = { ...DEFAULT_PROJECTION_CONFIG, enablePCA: false, enableIsoMap: false };

/**
 * Review & Process summary: Projection and Glyphs & Color are separate cards,
 * and every edit button deep-links to the step (by id) and anchor that owns the
 * setting. The processing pipeline itself is not exercised here.
 */
describe('Step6ReviewProcessingComponent – summary and deep links', () => {
  let service: PreprocessingService;
  let toast: Mocked<ToastService>;

  function seed(): void {
    seedReview(service);
  }

  beforeEach(async () => {
    localStorage.clear();
    service = createTestPreprocessingService();
    seed();
    toast = createToastServiceSpy();
    await TestBed.configureTestingModule({
      imports: [Step6ReviewProcessingComponent],
      providers: [
        { provide: PreprocessingService, useValue: service },
        { provide: DataLoaderService, useValue: {} },
        { provide: ProjectionService, useValue: { backgroundStatusObservable: of(new Map()) } },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(Step6ReviewProcessingComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function cardTitles(el: HTMLElement): string[] {
    return Array.from(el.querySelectorAll('.summary-card .card-label')).map(h =>
      (h.textContent ?? '').replace(/\s+/g, ' ').trim()
    );
  }

  it('shows Projection and Glyphs & Color as separate cards with their step numbers', () => {
    expect(cardTitles(render())).toEqual(['Columns Selected', 'Projection Step 4', 'Glyphs & Color Step 5']);
  });

  const editButtons: { label: string; step: WizardStepId; anchor: string }[] = [
    { label: 'Edit column selection', step: 'columns', anchor: 'wizard-anchor-columns' },
    { label: 'Edit projection columns', step: 'projection', anchor: 'wizard-anchor-projection-columns' },
    { label: 'Edit projection methods', step: 'projection', anchor: 'wizard-anchor-methods' },
    { label: 'Edit color attribute and scale', step: 'appearance', anchor: 'wizard-anchor-color' },
    { label: 'Edit glyph features', step: 'appearance', anchor: 'wizard-anchor-glyph' },
  ];

  editButtons.forEach(({ label, step, anchor }) => {
    it(`"${label}" opens the ${step} step at ${anchor}`, () => {
      const button = render().querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
      expect(button, label).not.toBeNull();

      button?.click();

      expect(service.currentStepId).toBe(step);
      expect(service.consumeScrollTarget()).toBe(anchor);
    });
  });

  it('shows the color attribute, scale and glyph count on the Glyphs & Color card', () => {
    const text = (render().textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('x · Diverge');
    expect(text).toContain('3 features');
  });

  it('does not list LLE, which is hidden, even when a saved config enables it', () => {
    seedReview(service, { projectionConfig: { ...NO_BACKGROUND_METHODS, enableLLE: true, enableLTSA: true } });

    const methodsRow = render().querySelector('button[aria-label="Edit projection methods"]')?.closest('dd');
    const methods = methodsRow?.querySelector('.card-row-value')?.textContent?.trim();

    expect(methods).toBe('FastMap (Primary), LTSA');
  });

  it('"Fix in step N" jumps to the issue step by id and names it in the toast', () => {
    const fixture = TestBed.createComponent(Step6ReviewProcessingComponent);
    const issue = classifyProcessingError('A glyph needs 3-12 glyph features');

    fixture.componentInstance.fixInStep(issue);

    expect(service.currentStepId).toBe('appearance');
    expect(service.consumeScrollTarget()).toBe('wizard-anchor-glyph');
    expect(toast.info).toHaveBeenCalledWith('Opening Step 5 · Glyphs & Color', 2500);
  });
});

/**
 * A full primary run: Python processing, then FastMap. The service's
 * isProcessing flag (which the shell uses to block undo/redo) must stay up until
 * FastMap has finished, and screen readers hear each phase once.
 */
describe('Step6ReviewProcessingComponent – processing run', () => {
  let service: PreprocessingService;
  let announcer: WizardAnnouncer;
  let progress$: Subject<ProcessingProgress>;
  let runFastMapSync: Mock<ProjectionService['runFastMapSync']>;
  let terminateAllWorkers: Mock;
  let clearBackgroundStatuses: Mock;
  let detachAll: Mock;
  let runLLE: Mock;

  function dataProcessor(): object {
    return {
      processingProgress: progress$.asObservable(),
      processWithConfig: () => {
        progress$.next({ step: 'Building dataset', progress: 86, message: 'Row 1000' });
        progress$.next({ step: 'Building dataset', progress: 90, message: 'Row 2000' });
        progress$.next({ step: 'Complete', progress: 100, message: 'Processing successful' });
        return Promise.resolve({ datasets: { d: {} } });
      },
      getProcessedFeatures: () => Promise.resolve('id,f\n1,0.5\n2,0.7\n'),
      pruneFiles: () => Promise.resolve(),
    };
  }

  beforeEach(async () => {
    localStorage.clear();
    progress$ = new Subject<ProcessingProgress>();
    service = createTestPreprocessingService(dataProcessor());
    seedReview(service, { projectionConfig: NO_BACKGROUND_METHODS });
    runFastMapSync = vi
      .fn<ProjectionService['runFastMapSync']>()
      .mockResolvedValue({ method: 'fastmap', positions: [{ id: 1, x: 0, y: 0 }], computeTime: 3 });
    terminateAllWorkers = vi.fn().mockReturnValue([]);
    clearBackgroundStatuses = vi.fn();
    detachAll = vi.fn();
    runLLE = vi.fn();
    const projection = {
      backgroundStatusObservable: of(new Map()),
      parseCSVFeatures: () => ({ features: [[0.5], [0.7]], ids: [1, 2] }),
      runFastMapSync,
      terminateAllWorkers,
      clearBackgroundStatuses,
      detachAll,
      runLLE,
    };
    await TestBed.configureTestingModule({
      imports: [Step6ReviewProcessingComponent],
      providers: [
        { provide: PreprocessingService, useValue: service },
        { provide: DataLoaderService, useValue: {} },
        { provide: ProjectionService, useValue: projection },
        { provide: ToastService, useValue: createToastServiceSpy() },
      ],
    }).compileComponents();
    announcer = TestBed.inject(WizardAnnouncer);
    vi.spyOn(announcer, 'announce').mockImplementation(() => undefined);
  });

  afterEach(() => localStorage.clear());

  function create(): ComponentFixture<Step6ReviewProcessingComponent> {
    const fixture = TestBed.createComponent(Step6ReviewProcessingComponent);
    fixture.detectChanges();
    // Skip the minimum loading-screen time; it only exists so sighted users notice a fast run.
    (fixture.componentInstance as unknown as { MIN_LOADING_MS: number }).MIN_LOADING_MS = 0;
    return fixture;
  }

  function failFastMap(): void {
    runFastMapSync.mockRejectedValue(new Error('FastMap failed: boom'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined); // the component logs the failure
  }

  it('keeps the service processing, so undo is blocked, until FastMap has finished', async () => {
    service.pushHistory('Earlier change');
    let processingDuringFastMap = false;
    let undoDuringFastMap: unknown = 'not called';
    runFastMapSync.mockImplementation(async () => {
      processingDuringFastMap = service.currentState.isProcessing;
      undoDuringFastMap = service.undo();
      return { method: 'fastmap', positions: [], computeTime: 1 };
    });

    await create().componentInstance.startProcessing();

    expect(processingDuringFastMap).toBe(true);
    expect(undoDuringFastMap).toBeNull();
    expect(service.currentState.isProcessing).toBe(false);
    expect(service.canUndo).toBe(true);
  });

  it('lets background projections of an earlier dataset finish, detached, on a fresh run', async () => {
    await create().componentInstance.startProcessing();

    expect(detachAll).toHaveBeenCalled();
    expect(terminateAllWorkers).not.toHaveBeenCalled();
    expect(clearBackgroundStatuses).not.toHaveBeenCalled();
  });

  it('stops and forgets the outdated background projections when reprocessing', async () => {
    setState(service, { processedDataset: { datasets: { d: {} } } as unknown as DatasetCollection });

    await create().componentInstance.startProcessing();

    expect(terminateAllWorkers).toHaveBeenCalled();
    expect(clearBackgroundStatuses).toHaveBeenCalledBefore(runFastMapSync);
    expect(detachAll).not.toHaveBeenCalled();
  });

  it('does not start LLE, which is hidden, even when a saved config enables it', async () => {
    seedReview(service, { projectionConfig: { ...NO_BACKGROUND_METHODS, enableLLE: true } });

    await create().componentInstance.startProcessing();

    expect(runFastMapSync).toHaveBeenCalled();
    expect(runLLE).not.toHaveBeenCalled();
  });

  it('releases the processing flag when FastMap fails', async () => {
    failFastMap();
    const fixture = create();

    await fixture.componentInstance.startProcessing();

    expect(service.currentState.isProcessing).toBe(false);
    expect(fixture.componentInstance.isErrorScreen).toBe(true);
  });

  it('announces the start, each phase once (not every tick) and the completion', async () => {
    await create().componentInstance.startProcessing();

    const messages = vi.mocked(announcer.announce).mock.calls.map(args => args[0]);
    expect(messages).toEqual([
      'Processing started.',
      'Building dataset.',
      'Loading features for projections.',
      'Computing FastMap projection.',
      'Loading dataset with FastMap.',
      'Processing complete. Your visualization is ready to open in Glyphspace.',
    ]);
  });

  it('reports a failure once, through the blocking error alert with its cause', async () => {
    failFastMap();
    const fixture = create();

    await fixture.componentInstance.startProcessing();
    fixture.detectChanges();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('.status-hero.error[role="alert"]');
    const cause = fixture.componentInstance.blockingIssue?.title ?? 'missing';
    expect(alert?.textContent).toContain(`Cause: ${cause}.`);
    // role="alert" is already an assertive announcement; the announcer must not repeat it.
    const messages = vi.mocked(announcer.announce).mock.calls.map(args => args[0]);
    expect(messages.some(m => /fail/i.test(m))).toBe(false);
  });

  it('exposes the processing progress as a labelled progressbar', () => {
    const fixture = create();
    Object.assign(fixture.componentInstance, {
      showProcessing: true,
      isProcessing: true,
      processingProgress: 45,
      processingStep: 'Encoding features',
    });
    fixture.detectChanges();

    const bar = (fixture.nativeElement as HTMLElement).querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-label')).toBe('Processing progress');
    expect(bar?.getAttribute('aria-valuemin')).toBe('0');
    expect(bar?.getAttribute('aria-valuemax')).toBe('100');
    expect(bar?.getAttribute('aria-valuenow')).toBe('45');
    expect(bar?.getAttribute('aria-valuetext')).toBe('45% – Encoding features');
  });
});

/**
 * Background projections can be cancelled one by one or all at once, and a
 * cancelled or failed one can be retried on its own, without resetting the wizard.
 */
describe('Step6ReviewProcessingComponent – cancel and retry background projections', () => {
  let service: PreprocessingService;
  let statuses: BehaviorSubject<Map<string, BackgroundStatus>>;
  let projection: Mocked<ProjectionService>;
  let announcer: WizardAnnouncer;
  let toast: Mocked<ToastService>;
  let dataLoader: Mocked<DataLoaderService>;
  let retryable: Set<string>;

  type Entry = [string, BackgroundStatus];
  const entry = (method: string, status: BackgroundStatus['status'], progress = 0): Entry => [
    method,
    { method, status, progress, message: `${method} ${status}` },
  ];
  const initial: Entry[] = [
    entry('pca', 'complete', 100),
    entry('umap', 'running', 40),
    entry('tsne', 'error'),
    entry('mds', 'cancelled'),
  ];

  /** Publish the initial statuses with the given entries replaced. */
  function publish(...changes: Entry[]): void {
    statuses.next(new Map([...initial, ...changes]));
  }

  beforeEach(async () => {
    localStorage.clear();
    service = createTestPreprocessingService({ pruneFiles: () => Promise.resolve() });
    seedReview(service, {
      projectionConfig: {
        ...NO_BACKGROUND_METHODS,
        enablePCA: true,
        enableMDS: true,
        enableTSNE: true,
        enableUMAP: true,
      },
      processedDataset: { datasets: { d: {} } } as unknown as DatasetCollection,
    });
    statuses = new BehaviorSubject(new Map<string, BackgroundStatus>());
    retryable = new Set(['tsne', 'mds']);
    projection = createSpyObj<ProjectionService>(
      'ProjectionService',
      ['cancel', 'terminateAllWorkers', 'canRetry', 'retry', 'detachAll'],
      { backgroundStatusObservable: statuses.asObservable() }
    );
    projection.canRetry.mockImplementation(method => retryable.has(method));
    toast = createToastServiceSpy();
    dataLoader = createSpyObj<DataLoaderService>('DataLoaderService', [
      'addProcessedDatasetToCollection',
      'loadProcessedDataset',
      'saveDatasetToStorage',
    ]);
    await TestBed.configureTestingModule({
      imports: [Step6ReviewProcessingComponent],
      providers: [
        { provide: PreprocessingService, useValue: service },
        { provide: DataLoaderService, useValue: dataLoader },
        { provide: ProjectionService, useValue: projection },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();
    announcer = TestBed.inject(WizardAnnouncer);
    vi.spyOn(announcer, 'announce').mockImplementation(() => undefined);
  });

  afterEach(() => localStorage.clear());

  function render(): { fixture: ComponentFixture<Step6ReviewProcessingComponent>; el: HTMLElement } {
    const fixture = TestBed.createComponent(Step6ReviewProcessingComponent);
    fixture.detectChanges();
    publish();
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  function button(el: HTMLElement, label: string): HTMLButtonElement | null {
    return el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  }

  function buttonByText(el: HTMLElement, text: string): HTMLButtonElement | undefined {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find(b => b.textContent?.includes(text));
  }

  const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve));

  it('offers Cancel while running and Retry once cancelled or failed', () => {
    const { el } = render();

    expect(button(el, 'Cancel UMAP')).not.toBeNull();
    expect(button(el, 'Retry t-SNE')).not.toBeNull();
    expect(button(el, 'Retry MDS')).not.toBeNull();
    expect(button(el, 'Cancel PCA')).toBeNull();
    expect(button(el, 'Retry PCA')).toBeNull();
    expect(buttonByText(el, 'Stop all background projections')).toBeDefined();
  });

  it('shows the cancelled state in the list and in the method bar', () => {
    const { el } = render();

    expect(el.querySelector('.status-badge.status-cancelled')?.textContent).toContain('Cancelled');
    const mdsChip = Array.from(el.querySelectorAll('.method-chip')).find(c => c.textContent?.includes('MDS'));
    expect(mdsChip?.querySelector('.chip-status')?.textContent?.trim()).toBe('Cancelled');
  });

  it('labels the progressbar of each running projection', () => {
    const bar = render().el.querySelector('.projection-status-item [role="progressbar"]');
    expect(bar?.getAttribute('aria-label')).toBe('UMAP progress');
    expect(bar?.getAttribute('aria-valuenow')).toBe('40');
  });

  it('cancels just that method, announces it and moves focus to its Retry button', () => {
    const { el } = render();
    projection.cancel.mockImplementation(method => {
      retryable.add(method);
      publish(entry(method, 'cancelled'));
      return true;
    });

    button(el, 'Cancel UMAP')?.click();

    expect(projection.cancel).toHaveBeenCalledExactlyOnceWith('umap');
    expect(announcer.announce).toHaveBeenCalledWith('UMAP cancelled. You can retry it.');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Retry UMAP');
  });

  it('stops all running projections and announces how many were stopped', () => {
    const { el } = render();
    projection.terminateAllWorkers.mockImplementation(() => {
      publish(entry('umap', 'cancelled'));
      return ['umap'];
    });

    buttonByText(el, 'Stop all background projections')?.click();

    expect(projection.terminateAllWorkers).toHaveBeenCalled();
    expect(announcer.announce).toHaveBeenCalledWith('Stopped 1 background projection.');
    expect(buttonByText(el, 'Stop all background projections')).toBeUndefined();
    expect(document.activeElement?.id).toBe('step6-background-heading');
  });

  it('retries only that method and adds its result to the dataset', async () => {
    const { el } = render();
    const result: ProjectionResult = { method: 'tsne', positions: [{ id: 1, x: 1, y: 2 }], computeTime: 1500 };
    projection.retry.mockImplementation(method => {
      retryable.delete(method);
      publish(entry(method, 'running'));
      return Promise.resolve(result);
    });

    button(el, 'Retry t-SNE')?.click();
    await flush();

    expect(projection.retry).toHaveBeenCalledExactlyOnceWith('tsne');
    expect(announcer.announce).toHaveBeenCalledWith('Retrying t-SNE.');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Cancel t-SNE');
    expect(dataLoader.loadProcessedDataset).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('t-SNE projection ready! (1.5s)', 4000);
  });

  it('shows no error when a retried run is cancelled again', async () => {
    const { el } = render();
    projection.retry.mockReturnValue(Promise.reject(new ProjectionCancelledError('tsne')));

    button(el, 'Retry t-SNE')?.click();
    await flush();

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('detaches the running projections when the dataset is handed to the dashboard', () => {
    const { fixture } = render();

    fixture.componentInstance.goToDashboard();

    expect(projection.detachAll).toHaveBeenCalled();
  });
});
