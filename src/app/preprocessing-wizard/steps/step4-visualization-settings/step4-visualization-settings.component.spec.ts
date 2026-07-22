import { Step4VisualizationSettingsComponent } from './step4-visualization-settings.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from '../../models/data-type.enum';
import { ToastService } from '../../../services/toast.service';

/**
 * A4 – Step 4 glyph-feature editing vs. the undo history.
 *
 * Regression coverage for the reported flaky behaviour: deselecting every glyph
 * feature one by one and then pressing undo once brought several features back
 * instead of exactly one.
 *
 * Root cause: removeGlyphFeature() spliced the component's local
 * selectedGlyphFeatures array first and only then called saveGlyphFeatures(),
 * whose guard skips both the history push AND service.setGlyphFeatures() whenever
 * the count leaves the valid 3–12 range. Removals below the minimum therefore
 * silently desynced the local array from the service state and were never
 * recorded, so a single undo no longer mapped to a single user action.
 *
 * These tests pin the invariants a correct implementation must keep:
 *  - the local selection never drops below MIN_GLYPH_FEATURES,
 *  - the local selection and the service state stay in sync after every removal,
 *  - each persisted removal is exactly one undo entry.
 */
describe('Step4VisualizationSettingsComponent – glyph feature history', () => {
  let component: Step4VisualizationSettingsComponent;
  let service: PreprocessingService;
  let toast: jasmine.SpyObj<ToastService>;

  const dataProcessorStub = {} as unknown as ConstructorParameters<typeof PreprocessingService>[0];
  const dataLoaderStub = {
    getDataSetNames: () => [] as string[],
  } as unknown as ConstructorParameters<typeof PreprocessingService>[1];

  const FIVE = ['a', 'b', 'c', 'd', 'e'];

  /** Put the component and the service into a synced "5 glyph features" state. */
  function startWithFiveFeatures(): void {
    service.setGlyphFeatures([...FIVE]);
    component.selectedGlyphFeatures = [...FIVE];
    // Mark loading as finished so glyph writes are treated as genuine user actions.
    (component as unknown as { historyReady: boolean }).historyReady = true;
  }

  beforeEach(() => {
    localStorage.clear();
    service = new PreprocessingService(dataProcessorStub, dataLoaderStub);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['warning', 'success', 'showUndo', 'info', 'error']);
    component = new Step4VisualizationSettingsComponent(service, toast);
  });

  afterEach(() => localStorage.clear());

  it('never lets the selection drop below the minimum when removing repeatedly', () => {
    startWithFiveFeatures();

    // Try to remove all five, one by one (always removing the first chip).
    for (let i = 0; i < 5; i++) {
      component.removeGlyphFeature(0);
    }

    expect(component.selectedGlyphFeatures.length).toBe(component.MIN_GLYPH_FEATURES);
  });

  it('keeps the local selection and the service state in sync after each removal', () => {
    startWithFiveFeatures();

    for (let i = 0; i < 5; i++) {
      component.removeGlyphFeature(0);
      expect(service.currentState.glyphFeatures)
        .withContext(`after ${i + 1} removal(s)`)
        .toEqual(component.selectedGlyphFeatures);
    }
  });

  it('records exactly one undo entry per persisted removal, so a single undo reverts one step', () => {
    startWithFiveFeatures();

    // Two valid removals: 5 -> 4 -> 3.
    component.removeGlyphFeature(0);
    component.removeGlyphFeature(0);
    expect(service.currentState.glyphFeatures.length).toBe(3);

    // A single undo restores exactly one removed feature (3 -> 4), not several.
    service.undo();
    expect(service.currentState.glyphFeatures.length).toBe(4);
  });

  it('does not push a history entry or change state when removal is blocked at the minimum', () => {
    service.setGlyphFeatures(['a', 'b', 'c']);
    component.selectedGlyphFeatures = ['a', 'b', 'c'];
    (component as unknown as { historyReady: boolean }).historyReady = true;
    expect(service.canUndo).toBeFalse();

    component.removeGlyphFeature(0);

    expect(component.selectedGlyphFeatures).toEqual(['a', 'b', 'c']);
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
    expect(service.canUndo).toBeFalse();
  });

  it('adds a glyph feature back as one undoable action', () => {
    service.setGlyphFeatures(['a', 'b', 'c']);
    component.selectedGlyphFeatures = ['a', 'b', 'c'];
    (component as unknown as { historyReady: boolean }).historyReady = true;

    component.addGlyphFeature('d');
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
  });
});

/**
 * A4 – Step 4 colour selection vs. the undo history.
 *
 * Colour attribute and colour scale were the one Step-4 setting the undo stack did
 * not record, so pressing undo after changing a colour silently reverted an earlier
 * action instead. These tests pin that a colour change is exactly one undoable
 * action, while the default colour assigned during ngOnInit is not.
 */
describe('Step4VisualizationSettingsComponent – colour feature history', () => {
  let component: Step4VisualizationSettingsComponent;
  let service: PreprocessingService;
  let toast: jasmine.SpyObj<ToastService>;

  const dataProcessorStub = {} as unknown as ConstructorParameters<typeof PreprocessingService>[0];
  const dataLoaderStub = {
    getDataSetNames: () => [] as string[],
  } as unknown as ConstructorParameters<typeof PreprocessingService>[1];

  function makeConfig(name: string, isColorFeature: boolean): ColumnConfig {
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

  /** Two enabled numeric columns; "red" is the initial colour feature, scale 0. */
  function seedColourState(): void {
    const configs = new Map<string, ColumnConfig>([
      ['red', makeConfig('red', true)],
      ['blue', makeConfig('blue', false)],
    ]);
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      columnConfigs: configs,
      colorScaleId: 0,
      colorScaleMode: 'continuous',
    });
    component.colorFeature = 'red';
    component.selectedColorScaleId = 0;
  }

  function ready(): void {
    (component as unknown as { historyReady: boolean }).historyReady = true;
  }

  beforeEach(() => {
    localStorage.clear();
    service = new PreprocessingService(dataProcessorStub, dataLoaderStub);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['warning', 'success', 'showUndo', 'info', 'error']);
    component = new Step4VisualizationSettingsComponent(service, toast);
  });

  afterEach(() => localStorage.clear());

  it('records a colour-feature change as one undoable action', () => {
    seedColourState();
    ready();

    component.setColorFeature('blue');
    expect(service.currentState.columnConfigs.get('blue')!.isColorFeature).toBeTrue();
    expect(service.currentState.columnConfigs.get('red')!.isColorFeature).toBeFalse();
    expect(service.canUndo).toBeTrue();

    service.undo();
    expect(service.currentState.columnConfigs.get('red')!.isColorFeature).toBeTrue();
    expect(service.currentState.columnConfigs.get('blue')!.isColorFeature).toBeFalse();
  });

  it('labels a colour-feature undo as Farbattribut on step 4', () => {
    seedColourState();
    ready();

    component.setColorFeature('blue');
    const info = service.undo()!;
    expect(info.settingLabel).toBe('Farbattribut');
    expect(info.step).toBe(3);
  });

  it('records a colour-scale change as one undoable action', () => {
    seedColourState();
    ready();

    component.selectColorScale(2);
    expect(service.currentState.colorScaleId).toBe(2);

    service.undo();
    expect(service.currentState.colorScaleId).toBe(0);
  });

  it('does not record colour history before the step has finished loading', () => {
    seedColourState();
    // historyReady stays false, mirroring the ngOnInit default assignment.
    component.setColorFeature('blue');
    expect(service.canUndo).toBeFalse();
  });
});

/**
 * A4 – Step 4 drag & drop, smart suggestions and projection columns vs. undo.
 *
 * These paths also mutate the glyph selection or a column config; they must each
 * be a single undoable action and stay in sync with the service state.
 */
describe('Step4VisualizationSettingsComponent – drag/drop, suggestions, projection', () => {
  let component: Step4VisualizationSettingsComponent;
  let service: PreprocessingService;
  let toast: jasmine.SpyObj<ToastService>;

  const dataProcessorStub = {} as unknown as ConstructorParameters<typeof PreprocessingService>[0];
  const dataLoaderStub = {
    getDataSetNames: () => [] as string[],
  } as unknown as ConstructorParameters<typeof PreprocessingService>[1];

  function makeConfig(name: string): ColumnConfig {
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
    };
  }

  // Minimal DragEvent stand-in: only the members the handlers actually touch.
  function dragEvent(): DragEvent {
    return {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      dataTransfer: { effectAllowed: '', dropEffect: '', setData: () => undefined, getData: () => '' },
    } as unknown as DragEvent;
  }

  function ready(): void {
    (component as unknown as { historyReady: boolean }).historyReady = true;
  }

  beforeEach(() => {
    localStorage.clear();
    service = new PreprocessingService(dataProcessorStub, dataLoaderStub);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['warning', 'success', 'showUndo', 'info', 'error']);
    component = new Step4VisualizationSettingsComponent(service, toast);
  });

  afterEach(() => localStorage.clear());

  it('reorders a glyph feature via drag as one undoable action', () => {
    service.setGlyphFeatures(['a', 'b', 'c', 'd', 'e']);
    component.selectedGlyphFeatures = ['a', 'b', 'c', 'd', 'e'];
    ready();

    component.onDragStart(dragEvent(), 'a', 'selected', 0);
    component.onDropOnSelectedItem(dragEvent(), 2);
    expect(component.selectedGlyphFeatures).toEqual(['b', 'c', 'a', 'd', 'e']);
    expect(service.currentState.glyphFeatures).toEqual(['b', 'c', 'a', 'd', 'e']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('adds a feature by dropping it into the selected list, undoable', () => {
    service.setGlyphFeatures(['a', 'b', 'c']);
    component.selectedGlyphFeatures = ['a', 'b', 'c'];
    component.availableFeatures = ['a', 'b', 'c', 'd'];
    ready();

    component.onDragStart(dragEvent(), 'd', 'available', 0);
    component.onDropInSelected(dragEvent());
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
  });

  it('removes a feature by dropping it onto the available area, undoable', () => {
    service.setGlyphFeatures(['a', 'b', 'c', 'd']);
    component.selectedGlyphFeatures = ['a', 'b', 'c', 'd'];
    ready();

    component.onDragStart(dragEvent(), 'd', 'selected', 3);
    component.onDropInAvailable(dragEvent());
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd']);
  });

  it('applies recommended features as one undoable action and offers a toast undo', () => {
    component.suggestedFeatures = ['a', 'b', 'c', 'd', 'e'];
    component.availableFeatures = ['a', 'b', 'c', 'd', 'e', 'f'];
    ready();

    component.applySuggestedFeaturesByUser();
    expect(component.selectedGlyphFeatures).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(toast.showUndo).toHaveBeenCalled();

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual([]);
  });

  it('toggles a projection column as one undoable action', () => {
    const configs = new Map<string, ColumnConfig>([['x', makeConfig('x')]]);
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({ columnConfigs: configs });
    component.projectionColumns = [
      { column: { name: 'x' } as never, config: service.currentState.columnConfigs.get('x')! },
    ] as never;

    component.toggleColumnProjection('x');
    expect(service.currentState.columnConfigs.get('x')!.includeInProjection).toBeFalse();
    expect(service.canUndo).toBeTrue();

    service.undo();
    expect(service.currentState.columnConfigs.get('x')!.includeInProjection).toBeTrue();
  });
});
