import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Step4ProjectionSettingsComponent } from './step4-projection-settings.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DEFAULT_PROJECTION_CONFIG, PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from '../../models/data-type.enum';
import { createTestPreprocessingService } from '../../testing/preprocessing-test-helpers';

function makeConfig(name: string, overrides: Partial<ColumnConfig> = {}): ColumnConfig {
  return {
    name,
    originalType: DataType.Numeric,
    targetType: DataType.Numeric,
    encodingMethod: EncodingMethod.Normalize,
    scalingMethod: ScalingMethod.MinMax,
    includeInProjection: true,
    isColorFeature: false,
    missingValueStrategy: MissingValueStrategy.Keep,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Keep,
    enabled: true,
    hasIssues: false,
    ...overrides,
  };
}

function makeColumn(name: string): ColumnStatistics {
  return {
    name,
    dataType: DataType.Numeric,
    count: 100,
    missingCount: 0,
    missingPercentage: 0,
    uniqueCount: 50,
    mean: 10,
    stdDev: 2,
  };
}

function makeProfile(names: string[]): DataProfile {
  return {
    totalRows: 100,
    totalColumns: names.length,
    fileSize: 1000,
    fileName: 'test.csv',
    columns: names.map(makeColumn),
    qualityScore: 90,
    duplicateCount: 0,
    previewRows: [],
  };
}

function setState(service: PreprocessingService, updates: Partial<PreprocessingState>): void {
  (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState(updates);
}

const stackLength = (service: PreprocessingService): number =>
  (service as unknown as { undoStack: unknown[] }).undoStack.length;

/**
 * A4 – projection columns vs. the undo history. Toggling one column or the
 * master checkbox must each be a single undoable action.
 */
describe('Step4ProjectionSettingsComponent – projection columns', () => {
  let component: Step4ProjectionSettingsComponent;
  let service: PreprocessingService;

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = new Step4ProjectionSettingsComponent(service);
  });

  afterEach(() => localStorage.clear());

  it('toggles a projection column as one undoable action', () => {
    setState(service, { dataProfile: makeProfile(['x']), columnConfigs: new Map([['x', makeConfig('x')]]) });
    component.ngOnInit();

    component.toggleColumnProjection('x');
    expect(service.currentState.columnConfigs.get('x')?.includeInProjection).toBe(false);
    expect(component.isColumnInProjection('x')).toBe(false);
    expect(service.canUndo).toBe(true);

    service.undo();
    expect(service.currentState.columnConfigs.get('x')?.includeInProjection).toBe(true);
  });

  it('does not edit the previous column config object in place', () => {
    setState(service, { dataProfile: makeProfile(['x']), columnConfigs: new Map([['x', makeConfig('x')]]) });
    component.ngOnInit();
    const before = service.currentState.columnConfigs.get('x');

    component.toggleColumnProjection('x');

    expect(before?.includeInProjection).toBe(true);
  });

  it('the "all projection columns" master checkbox is one undoable action', () => {
    const configs = new Map<string, ColumnConfig>([
      ['x', makeConfig('x', { includeInProjection: false })],
      ['y', makeConfig('y', { includeInProjection: false })],
      ['z', makeConfig('z')],
    ]);
    setState(service, { dataProfile: makeProfile(['x', 'y', 'z']), columnConfigs: configs });
    component.ngOnInit();
    const included = (name: string): boolean | undefined =>
      service.currentState.columnConfigs.get(name)?.includeInProjection;

    component.onToggleAllProjection();
    expect(['x', 'y', 'z'].map(included)).toEqual([true, true, true]);
    expect(component.allColumnsInProjection()).toBe(true);
    expect(stackLength(service)).toBe(1);

    service.undo();
    expect(['x', 'y', 'z'].map(included)).toEqual([false, false, true]);
  });

  it('only lists the columns enabled in the column step', () => {
    const configs = new Map<string, ColumnConfig>([
      ['x', makeConfig('x')],
      ['y', makeConfig('y', { enabled: false })],
    ]);
    setState(service, { dataProfile: makeProfile(['x', 'y']), columnConfigs: configs });
    component.ngOnInit();

    expect(component.projectionColumns.map(entry => entry.column.name)).toEqual(['x']);
  });
});

/**
 * Continue is allowed with at least one projection column and one enabled
 * method. FastMap always runs, so it alone satisfies the method requirement.
 */
describe('Step4ProjectionSettingsComponent – canProceed', () => {
  let component: Step4ProjectionSettingsComponent;
  let service: PreprocessingService;

  function load(configs: ColumnConfig[], projection: Partial<ProjectionConfig> = {}): void {
    setState(service, {
      dataProfile: makeProfile(configs.map(c => c.name)),
      columnConfigs: new Map(configs.map(c => [c.name, c])),
      projectionConfig: { ...DEFAULT_PROJECTION_CONFIG, ...projection },
    });
    component.ngOnInit();
  }

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = new Step4ProjectionSettingsComponent(service);
  });

  afterEach(() => localStorage.clear());

  it('allows continuing with one projection column', () => {
    load([makeConfig('x'), makeConfig('y', { includeInProjection: false })]);
    expect(component.canProceed()).toBe(true);
    expect(component.disabledHint).toBe('');
  });

  it('blocks continuing without any projection column and says why', () => {
    load([makeConfig('x', { includeInProjection: false })]);
    expect(component.canProceed()).toBe(false);
    expect(component.disabledHint).toBe('Include at least one column in the projection to continue.');
  });

  it('becomes blocked when the last projection column is excluded', () => {
    load([makeConfig('x')]);
    component.toggleColumnProjection('x');
    expect(component.canProceed()).toBe(false);
  });

  it('counts FastMap as an enabled method when every background method is off', () => {
    const allOff: Partial<ProjectionConfig> = {
      enablePCA: false,
      enableIsoMap: false,
      enableMDS: false,
      enableLLE: false,
      enableLTSA: false,
      enableTSNE: false,
      enableUMAP: false,
      enableTriMap: false,
      enableTopoMap: false,
      enableSammon: false,
    };
    load([makeConfig('x')], allOff);

    expect(component.enabledMethodCount()).toBe(1);
    expect(component.canProceed()).toBe(true);
  });

  it('adds enabled background methods to the count', () => {
    load([makeConfig('x')], { enablePCA: true, enableIsoMap: true, enableUMAP: true });
    expect(component.enabledMethodCount()).toBe(4);
  });

  it('does not count LLE, which is hidden, even when a saved config enables it', () => {
    load([makeConfig('x')], { enablePCA: false, enableIsoMap: false, enableLLE: true });
    expect(component.enabledMethodCount()).toBe(1);
  });

  it('proceeds to the Glyphs & Color step', () => {
    load([makeConfig('x')]);
    service.goToStep('projection');

    component.proceed();

    expect(service.currentStepId).toBe('appearance');
    expect(component.primaryLabel).toBe('Continue to Glyphs & Color');
  });
});

/**
 * A4 – projection methods and parameters vs. the service.
 *
 * These edits must go through PreprocessingService.updateProjectionConfig, one
 * entry per completed change (slider release / committed number), never one per
 * drag tick, so they are undoable, persisted and emitted on state$.
 */
describe('Step4ProjectionSettingsComponent – projection settings', () => {
  let component: Step4ProjectionSettingsComponent;
  let service: PreprocessingService;

  const STORAGE_KEY = 'glyphspace_preprocessing_state';

  type MethodUI = Step4ProjectionSettingsComponent['projectionMethods'][number];

  function method(key: MethodUI['key']): MethodUI {
    const found = component.projectionMethods.find(m => m.key === key);
    if (!found) throw new Error(`unknown method ${key}`);
    return found;
  }

  function storedProjection(): ProjectionConfig | undefined {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { projectionConfig: ProjectionConfig }).projectionConfig : undefined;
  }

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = new Step4ProjectionSettingsComponent(service);
    // Mirror ngOnInit: the component edits a local copy of the stored config.
    component.projectionConfig = { ...service.currentState.projectionConfig };
  });

  afterEach(() => localStorage.clear());

  describe('toggling a method', () => {
    it('updates the service state immutably and emits on state$', () => {
      const previous = service.currentState.projectionConfig;
      const emitted: ProjectionConfig[] = [];
      const sub = service.state$.subscribe(s => emitted.push(s.projectionConfig));

      component.toggleProjectionMethod(method('enableUMAP'));
      sub.unsubscribe();

      expect(service.currentState.projectionConfig.enableUMAP).toBe(true);
      expect(previous.enableUMAP).toBe(false);
      expect(emitted[emitted.length - 1]).toBe(service.currentState.projectionConfig);
    });

    it('is one undoable action', () => {
      component.toggleProjectionMethod(method('enableUMAP'));
      expect(stackLength(service)).toBe(1);

      service.undo();
      expect(service.currentState.projectionConfig.enableUMAP).toBe(false);
    });

    it('is persisted to localStorage', () => {
      component.toggleProjectionMethod(method('enableUMAP'));
      expect(storedProjection()?.enableUMAP).toBe(true);
    });

    it('is labelled with the method name', () => {
      component.toggleProjectionMethod(method('enableUMAP'));
      component.toggleProjectionMethod(method('enablePCA'));

      const labels: (string | null)[] = [];
      service.history$.subscribe(s => labels.push(s.undoLabel)).unsubscribe();
      expect(labels).toEqual(['PCA disabled']);
    });

    it('an undo of a LATER action no longer silently reverts the toggle', () => {
      component.toggleProjectionMethod(method('enableUMAP'));
      service.updateCleaningConfig({ removeDuplicates: true });

      service.undo(); // reverts the cleaning change only
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(false);
      expect(service.currentState.projectionConfig.enableUMAP).toBe(true);
    });

    it('an undo right after the toggle reverts the toggle, not an earlier action', () => {
      service.updateCleaningConfig({ removeDuplicates: true });
      component.toggleProjectionMethod(method('enableUMAP'));

      service.undo();
      expect(service.currentState.projectionConfig.enableUMAP).toBe(false);
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(true);
    });
  });

  describe('parameter edits', () => {
    it('a slider drag updates only the local preview until release, then records one entry', () => {
      for (const value of [16, 18, 20, 24]) {
        component.onParamInput('umapNeighbors', value, 2, 200);
      }
      expect(component.projectionConfig.umapNeighbors).toBe(24);
      expect(service.currentState.projectionConfig.umapNeighbors).toBe(15);
      expect(service.canUndo).toBe(false);

      component.onParamChange('umapNeighbors', 24, 2, 200);
      expect(stackLength(service)).toBe(1);
      expect(service.currentState.projectionConfig.umapNeighbors).toBe(24);
      expect(storedProjection()?.umapNeighbors).toBe(24);

      service.undo();
      expect(service.currentState.projectionConfig.umapNeighbors).toBe(15);
    });

    it('records nothing when the committed value equals the stored one', () => {
      component.onParamChange('umapNeighbors', 15, 2, 200);
      expect(service.canUndo).toBe(false);
    });

    it('clamps committed values to the parameter range', () => {
      component.onParamChange('umapNeighbors', 999, 2, 200);
      expect(service.currentState.projectionConfig.umapNeighbors).toBe(200);
    });

    it('resetting a method’s parameters is one undoable action', () => {
      service.updateProjectionConfig({ tsnePerplexity: 10, tsneIterations: 2000 });
      component.projectionConfig = { ...service.currentState.projectionConfig };
      const before = stackLength(service);

      component.resetMethodParams(method('enableTSNE'));
      expect(stackLength(service)).toBe(before + 1);
      expect(service.currentState.projectionConfig.tsnePerplexity).toBe(30);
      expect(service.currentState.projectionConfig.tsneIterations).toBe(1000);

      service.undo();
      expect(service.currentState.projectionConfig.tsnePerplexity).toBe(10);
      expect(service.currentState.projectionConfig.tsneIterations).toBe(2000);
    });

    it('flags a neighbour count at or above the row count', () => {
      setState(service, { dataProfile: makeProfile(['x']) });
      component.projectionConfig = { ...component.projectionConfig, umapNeighbors: 150 };
      const umap = method('enableUMAP').params?.find(p => p.configKey === 'umapNeighbors');
      if (!umap) throw new Error('UMAP neighbours parameter missing');

      expect(component.neighborParamError(umap)).toContain('Only 100 rows available');
    });
  });
});

/**
 * Template wiring for the parameter inputs: `input` events (every slider tick or
 * keystroke) must only update the local preview; the `change` event (slider
 * released / number committed) records exactly one history entry. Child
 * components are stubbed out so only this template's bindings are exercised.
 */
describe('Step4ProjectionSettingsComponent – template', () => {
  let service: PreprocessingService;

  beforeEach(async () => {
    localStorage.clear();
    service = createTestPreprocessingService();
    const names = ['x', 'y', 'z'];
    setState(service, {
      rawFileName: 'test.csv',
      dataProfile: makeProfile(names),
      columnConfigs: new Map(names.map(name => [name, makeConfig(name)])),
      projectionConfig: { ...DEFAULT_PROJECTION_CONFIG, enableUMAP: true },
    });
    await TestBed.configureTestingModule({
      imports: [Step4ProjectionSettingsComponent],
      providers: [{ provide: PreprocessingService, useValue: service }],
    })
      .overrideComponent(Step4ProjectionSettingsComponent, {
        set: { imports: [CommonModule, FormsModule], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  afterEach(() => localStorage.clear());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(Step4ProjectionSettingsComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function renderInputs(): { range: HTMLInputElement; number: HTMLInputElement } {
    const range = render().querySelector<HTMLInputElement>('#step4-param-umapNeighbors');
    const number = range?.parentElement?.querySelector<HTMLInputElement>('input[type="number"]');
    if (!range || !number) throw new Error('UMAP parameter inputs not rendered');
    return { range, number };
  }

  function fire(el: HTMLInputElement, type: 'input' | 'change', value: number): void {
    el.value = String(value);
    el.dispatchEvent(new Event(type));
  }

  it('keeps the deep-link anchors for projection columns and methods', () => {
    const el = render();
    expect(el.querySelector('#wizard-anchor-projection-columns')).not.toBeNull();
    expect(el.querySelector('.projection-panel #wizard-anchor-methods')).not.toBeNull();
  });

  it('does not offer LLE, even when a saved config enables it', () => {
    setState(service, { projectionConfig: { ...DEFAULT_PROJECTION_CONFIG, enableLLE: true } });
    const el = render();

    const names = Array.from(el.querySelectorAll('.projection-card .method-name')).map(n => n.textContent?.trim());
    expect(names).toEqual(['PCA', 'TriMap', 'MDS', 'IsoMap', 'LTSA', 'TopoMap', 'UMAP', 'Sammon', 't-SNE']);
    expect(el.querySelector('#step4-method-enableLLE')).toBeNull();
  });

  it('renders an enabled TriMap card without parameters', () => {
    setState(service, { projectionConfig: { ...DEFAULT_PROJECTION_CONFIG, enableTriMap: true } });
    const card = render().querySelector('#step4-method-enableTriMap')?.closest('.projection-card');
    if (!card) throw new Error('TriMap card not rendered');

    expect(card.classList.contains('enabled')).toBe(true);
    expect(card.querySelector('.btn-expand-params')).toBeNull();
    expect(card.querySelector('.params-wrapper')).toBeNull();
    expect(card.querySelector('.card-desc')?.textContent?.trim()).toBe('Global structure preservation');
  });

  it('a slider drag records one entry on release, not one per tick', () => {
    const { range } = renderInputs();
    const before = stackLength(service);

    [16, 20, 30, 40].forEach(v => fire(range, 'input', v));
    expect(stackLength(service)).toBe(before);

    fire(range, 'change', 40);
    expect(stackLength(service)).toBe(before + 1);
    expect(service.currentState.projectionConfig.umapNeighbors).toBe(40);
  });

  it('typing in the number field records one entry when committed', () => {
    const { number } = renderInputs();
    const before = stackLength(service);

    [2, 25].forEach(v => fire(number, 'input', v));
    expect(stackLength(service)).toBe(before);

    fire(number, 'change', 25);
    expect(stackLength(service)).toBe(before + 1);
    expect(service.currentState.projectionConfig.umapNeighbors).toBe(25);
  });
});
