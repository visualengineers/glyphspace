import type { Mocked } from 'vitest';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Step5GlyphColorSettingsComponent } from './step5-glyph-color-settings.component';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import { ColorScaleSelectorComponent } from '../../../shared/components/color-scale-selector/color-scale-selector.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from '../../models/data-type.enum';
import { ToastService } from '../../../services/toast.service';
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

/** The component outside a view: change detection and focus moves are no-ops. */
function newComponent(
  service: PreprocessingService,
  toast: ToastService = createToastServiceSpy(),
  announcer: WizardAnnouncer = new WizardAnnouncer()
): Step5GlyphColorSettingsComponent {
  const cdr = { detectChanges: () => undefined } as unknown as ChangeDetectorRef;
  return new Step5GlyphColorSettingsComponent(service, toast, announcer, cdr);
}

/** Mark loading as finished so glyph/color writes count as genuine user actions. */
function ready(component: Step5GlyphColorSettingsComponent): void {
  (component as unknown as { historyReady: boolean }).historyReady = true;
}

/**
 * Seven numeric columns a…g whose spread grows alphabetically (stdDev 1…7 at a
 * common mean), so the smart suggestion is deterministic: g, f, e, d, c.
 */
function seedProfile(service: PreprocessingService, glyphFeatures: string[] = []): void {
  const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const columns: ColumnStatistics[] = names.map((name, i) => ({
    name,
    dataType: DataType.Numeric,
    count: 100,
    missingCount: 0,
    missingPercentage: 0,
    uniqueCount: 50,
    mean: 10,
    stdDev: i + 1,
  }));
  const profile: DataProfile = {
    totalRows: 100,
    totalColumns: names.length,
    fileSize: 1000,
    fileName: 'test.csv',
    columns,
    qualityScore: 90,
    duplicateCount: 0,
    previewRows: [],
  };
  setState(service, {
    rawFileName: 'test.csv',
    dataProfile: profile,
    columnConfigs: new Map(names.map(name => [name, makeConfig(name)])),
    glyphFeatures,
  });
}

/**
 * A4 – glyph-feature editing vs. the undo history.
 *
 * Regression coverage for the reported flaky behaviour: deselecting every glyph
 * feature one by one and then pressing undo once brought several features back
 * instead of exactly one. These tests pin the invariants a correct
 * implementation must keep:
 *  - the local selection never drops below MIN_GLYPH_FEATURES,
 *  - the local selection and the service state stay in sync after every removal,
 *  - each persisted removal is exactly one undo entry.
 */
describe('Step5GlyphColorSettingsComponent – glyph feature history', () => {
  let component: Step5GlyphColorSettingsComponent;
  let service: PreprocessingService;

  const FIVE = ['a', 'b', 'c', 'd', 'e'];

  function startWith(features: string[]): void {
    service.setGlyphFeatures([...features]);
    component.selectedGlyphFeatures = [...features];
    ready(component);
  }

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = newComponent(service);
  });

  afterEach(() => localStorage.clear());

  it('never lets the selection drop below the minimum when removing repeatedly', () => {
    startWith(FIVE);
    for (let i = 0; i < 5; i++) {
      component.removeGlyphFeature(0);
    }
    expect(component.selectedGlyphFeatures.length).toBe(component.MIN_GLYPH_FEATURES);
  });

  it('keeps the local selection and the service state in sync after each removal', () => {
    startWith(FIVE);
    for (let i = 0; i < 5; i++) {
      component.removeGlyphFeature(0);
      expect(service.currentState.glyphFeatures, `after ${i + 1} removal(s)`).toEqual(component.selectedGlyphFeatures);
    }
  });

  it('records exactly one undo entry per persisted removal, so a single undo reverts one step', () => {
    startWith(FIVE);
    component.removeGlyphFeature(0);
    component.removeGlyphFeature(0);
    expect(service.currentState.glyphFeatures.length).toBe(3);

    service.undo();
    expect(service.currentState.glyphFeatures.length).toBe(4);
  });

  it('does not push a history entry or change state when removal is blocked at the minimum', () => {
    startWith(['a', 'b', 'c']);
    expect(service.canUndo).toBe(false);

    component.removeGlyphFeature(0);

    expect(component.selectedGlyphFeatures).toEqual(['a', 'b', 'c']);
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
    expect(service.canUndo).toBe(false);
  });

  it('adds a glyph feature back as one undoable action', () => {
    startWith(['a', 'b', 'c']);

    component.addGlyphFeature('d');
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
  });
});

/**
 * A4 – color selection vs. the undo history: a color change is exactly one
 * undoable action, while the default color assigned during ngOnInit is not.
 */
describe('Step5GlyphColorSettingsComponent – color feature history', () => {
  let component: Step5GlyphColorSettingsComponent;
  let service: PreprocessingService;

  /** Two enabled numeric columns; "red" is the initial color feature, scale 0. */
  function seedColorState(): void {
    setState(service, {
      columnConfigs: new Map<string, ColumnConfig>([
        ['red', makeConfig('red', true)],
        ['blue', makeConfig('blue')],
      ]),
      colorScaleId: 0,
      colorScaleMode: 'continuous',
    });
    component.colorFeature = 'red';
    component.selectedColorScaleId = 0;
  }

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = newComponent(service);
  });

  afterEach(() => localStorage.clear());

  it('records a color-feature change as one undoable action', () => {
    seedColorState();
    ready(component);

    component.setColorFeature('blue');
    expect(service.currentState.columnConfigs.get('blue')?.isColorFeature).toBe(true);
    expect(service.currentState.columnConfigs.get('red')?.isColorFeature).toBe(false);
    expect(service.canUndo).toBe(true);

    service.undo();
    expect(service.currentState.columnConfigs.get('red')?.isColorFeature).toBe(true);
    expect(service.currentState.columnConfigs.get('blue')?.isColorFeature).toBe(false);
  });

  it('labels a color-feature undo as Color attribute on the Glyphs & Color step', () => {
    seedColorState();
    ready(component);

    component.setColorFeature('blue');
    const info = service.undo();
    expect(info?.settingLabel).toBe('Color attribute');
    expect(info?.step).toBe('appearance');
    expect(info?.anchorId).toBe('wizard-anchor-color');
  });

  it('records a color-scale change as one undoable action', () => {
    seedColorState();
    ready(component);

    component.selectColorScale(2);
    expect(service.currentState.colorScaleId).toBe(2);

    service.undo();
    expect(service.currentState.colorScaleId).toBe(0);
  });

  it('does not record color history before the step has finished loading', () => {
    seedColorState();
    // historyReady stays false, mirroring the ngOnInit default assignment.
    component.setColorFeature('blue');
    expect(service.canUndo).toBe(false);
  });
});

/**
 * A4 – drag & drop and smart suggestions vs. undo. These paths mutate the glyph
 * selection; each must be a single undoable action in sync with the service.
 */
describe('Step5GlyphColorSettingsComponent – drag/drop and suggestions', () => {
  let component: Step5GlyphColorSettingsComponent;
  let service: PreprocessingService;
  let toast: Mocked<ToastService>;

  // Minimal DragEvent stand-in: only the members the handlers actually touch.
  function dragEvent(): DragEvent {
    return {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      dataTransfer: { effectAllowed: '', dropEffect: '', setData: () => undefined, getData: () => '' },
    } as unknown as DragEvent;
  }

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    toast = createToastServiceSpy();
    component = newComponent(service, toast);
  });

  afterEach(() => localStorage.clear());

  it('reorders a glyph feature via drag as one undoable action', () => {
    service.setGlyphFeatures(['a', 'b', 'c', 'd', 'e']);
    component.selectedGlyphFeatures = ['a', 'b', 'c', 'd', 'e'];
    ready(component);

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
    ready(component);

    component.onDragStart(dragEvent(), 'd', 'available', 0);
    component.onDropInSelected(dragEvent());
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);
  });

  it('removes a feature by dropping it onto the available area, undoable', () => {
    service.setGlyphFeatures(['a', 'b', 'c', 'd']);
    component.selectedGlyphFeatures = ['a', 'b', 'c', 'd'];
    ready(component);

    component.onDragStart(dragEvent(), 'd', 'selected', 3);
    component.onDropInAvailable(dragEvent());
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c']);

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd']);
  });

  it('applies recommended features as one undoable action and offers a toast undo', () => {
    component.suggestedFeatures = ['a', 'b', 'c', 'd', 'e'];
    component.availableFeatures = ['a', 'b', 'c', 'd', 'e', 'f'];
    ready(component);

    component.applySuggestedFeaturesByUser();
    expect(component.selectedGlyphFeatures).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(toast.showUndo).toHaveBeenCalled();

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual([]);
  });

  it('tops short suggestions up to the minimum without duplicates', () => {
    component.suggestedFeatures = ['c', 'd'];
    component.availableFeatures = ['a', 'b', 'c', 'd'];

    component.applySuggestedFeatures();

    expect(component.selectedGlyphFeatures).toEqual(['c', 'd', 'a']);
  });

  describe('"Recommended features applied" toast undo is target-specific', () => {
    function applyAndGetToastUndo(): () => boolean {
      component.suggestedFeatures = ['a', 'b', 'c', 'd', 'e'];
      component.availableFeatures = ['a', 'b', 'c', 'd', 'e', 'f'];
      ready(component);
      component.applySuggestedFeaturesByUser();
      const lastCall = toast.showUndo.mock.lastCall;
      if (!lastCall) throw new Error('no undo toast was shown');
      return lastCall[1];
    }

    it('uses English toast text', () => {
      applyAndGetToastUndo();
      expect(toast.showUndo.mock.lastCall?.[0]).toBe('Recommended features applied');
    });

    it('reverts the applied suggestions when nothing happened since', () => {
      const toastUndo = applyAndGetToastUndo();

      expect(toastUndo()).toBe(true);
      expect(service.currentState.glyphFeatures).toEqual([]);
    });

    it('does not revert a later, unrelated change', () => {
      const toastUndo = applyAndGetToastUndo();
      service.updateCleaningConfig({ removeDuplicates: true });

      expect(toastUndo()).toBe(false);
      expect(service.currentState.cleaningConfig.removeDuplicates).toBe(true);
      expect(service.currentState.glyphFeatures).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('offers no toast when nothing was recorded', () => {
      component.suggestedFeatures = ['a', 'b', 'c', 'd', 'e'];
      component.availableFeatures = ['a', 'b', 'c', 'd', 'e', 'f'];
      // historyReady stays false: the write is not a recorded user action.
      component.applySuggestedFeaturesByUser();

      expect(toast.showUndo).not.toHaveBeenCalled();
    });
  });

  it('warns in English when removing below the minimum', () => {
    service.setGlyphFeatures(['a', 'b', 'c']);
    component.selectedGlyphFeatures = ['a', 'b', 'c'];
    ready(component);

    component.removeGlyphFeature(0);

    expect(toast.warning).toHaveBeenCalledWith('At least 3 glyph features are required.');
  });
});

/**
 * Entering the step prefills an empty glyph selection with the recommended
 * features without recording an undo entry, and Continue follows the 3–12 rule.
 */
describe('Step5GlyphColorSettingsComponent – prefill and canProceed', () => {
  let component: Step5GlyphColorSettingsComponent;
  let service: PreprocessingService;

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    component = newComponent(service);
  });

  afterEach(() => localStorage.clear());

  it('prefills an empty selection with the recommended features', () => {
    seedProfile(service);

    component.ngOnInit();

    expect(component.selectedGlyphFeatures).toEqual(['g', 'f', 'e', 'd', 'c']);
    expect(service.currentState.glyphFeatures).toEqual(['g', 'f', 'e', 'd', 'c']);
  });

  it('creates no undo entry for the prefill or the default color', () => {
    seedProfile(service);

    component.ngOnInit();

    expect(service.canUndo).toBe(false);
    expect(component.colorFeature).toBe('g');
  });

  it('keeps an existing valid selection', () => {
    seedProfile(service, ['a', 'b', 'c']);

    component.ngOnInit();

    expect(component.selectedGlyphFeatures).toEqual(['a', 'b', 'c']);
    expect(component.canProceed()).toBe(true);
  });

  it('records later edits after the prefill as undoable actions', () => {
    seedProfile(service);
    component.ngOnInit();

    component.addGlyphFeature('a');

    expect(service.canUndo).toBe(true);
    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(['g', 'f', 'e', 'd', 'c']);
  });

  it('is ready to continue right after the prefill', () => {
    seedProfile(service);
    component.ngOnInit();
    expect(component.canProceed()).toBe(true);
  });

  [
    { count: 2, allowed: false },
    { count: 3, allowed: true },
    { count: 12, allowed: true },
    { count: 13, allowed: false },
  ].forEach(({ count, allowed }) => {
    it(`${allowed ? 'allows' : 'blocks'} continuing with ${count} glyph features`, () => {
      component.selectedGlyphFeatures = Array.from({ length: count }, (_, i) => `f${i}`);
      expect(component.canProceed()).toBe(allowed);
    });
  });

  it('explains the glyph rule when Continue is disabled', () => {
    expect(component.disabledHint).toBe('Select 3–12 glyph features to continue.');
  });

  it('proceeds to the review step', () => {
    seedProfile(service);
    component.ngOnInit();
    service.goToStep('appearance');

    component.proceed();

    expect(service.currentStepId).toBe('review');
  });
});

/**
 * Glyph feature order defines the glyph axes. Besides dragging, it can be
 * changed with Move up / Move down (WCAG 2.1.1, 2.5.7); each move is one undo
 * entry, like a drag, and is announced to screen readers.
 */
describe('Step5GlyphColorSettingsComponent – moving features without dragging', () => {
  let component: Step5GlyphColorSettingsComponent;
  let service: PreprocessingService;
  let announcer: WizardAnnouncer;
  let toast: Mocked<ToastService>;

  const FIVE = ['a', 'b', 'c', 'd', 'e'];

  beforeEach(() => {
    localStorage.clear();
    service = createTestPreprocessingService();
    announcer = new WizardAnnouncer();
    vi.spyOn(announcer, 'announce').mockImplementation(() => undefined);
    toast = createToastServiceSpy();
    component = newComponent(service, toast, announcer);
    service.setGlyphFeatures([...FIVE]);
    component.selectedGlyphFeatures = [...FIVE];
    ready(component);
  });

  afterEach(() => localStorage.clear());

  it('moves a feature up as one undoable action and announces its new position', () => {
    component.moveGlyphFeature(2, 'up');

    expect(service.currentState.glyphFeatures).toEqual(['a', 'c', 'b', 'd', 'e']);
    expect(announcer.announce).toHaveBeenCalledWith('c moved to position 2 of 5.');

    service.undo();
    expect(service.currentState.glyphFeatures).toEqual(FIVE);
    expect(service.canUndo).toBe(false);
  });

  it('moves a feature down', () => {
    component.moveGlyphFeature(0, 'down');

    expect(component.selectedGlyphFeatures).toEqual(['b', 'a', 'c', 'd', 'e']);
    expect(announcer.announce).toHaveBeenCalledWith('a moved to position 2 of 5.');
  });

  it('does nothing past either end', () => {
    component.moveGlyphFeature(0, 'up');
    component.moveGlyphFeature(4, 'down');
    component.moveGlyphFeature(9, 'up');

    expect(service.currentState.glyphFeatures).toEqual(FIVE);
    expect(service.canUndo).toBe(false);
    expect(announcer.announce).not.toHaveBeenCalled();
  });

  it('announces an added feature', () => {
    component.availableFeatures = [...FIVE, 'f'];

    component.addAvailableFeature('f', 0);

    expect(service.currentState.glyphFeatures).toEqual([...FIVE, 'f']);
    expect(announcer.announce).toHaveBeenCalledWith('f added. 6 glyph features selected.');
  });

  it('explains instead of silently ignoring an add beyond the maximum', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => `f${i}`);
    service.setGlyphFeatures(twelve);
    component.selectedGlyphFeatures = [...twelve];

    component.addAvailableFeature('extra', 0);

    expect(component.selectedGlyphFeatures).toEqual(twelve);
    expect(toast.warning).toHaveBeenCalledWith('A glyph takes at most 12 features. Remove one first.');
  });

  it('announces a removed feature, but not a removal blocked at the minimum', () => {
    component.removeSelectedFeature(1);
    expect(announcer.announce).toHaveBeenCalledWith('b removed. 4 glyph features selected.');

    component.removeSelectedFeature(0);
    vi.mocked(announcer.announce).mockClear();
    component.removeSelectedFeature(0);

    expect(component.selectedGlyphFeatures.length).toBe(3);
    expect(announcer.announce).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith('At least 3 glyph features are required.');
  });
});

describe('Step5GlyphColorSettingsComponent – template', () => {
  let service: PreprocessingService;

  beforeEach(async () => {
    localStorage.clear();
    service = createTestPreprocessingService();
    seedProfile(service);
    await TestBed.configureTestingModule({
      imports: [Step5GlyphColorSettingsComponent],
      providers: [
        { provide: PreprocessingService, useValue: service },
        { provide: ToastService, useValue: createToastServiceSpy() },
      ],
    })
      .overrideComponent(Step5GlyphColorSettingsComponent, {
        set: { imports: [FormsModule, ColorScaleSelectorComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  afterEach(() => localStorage.clear());

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(Step5GlyphColorSettingsComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function selectedNames(el: HTMLElement): (string | undefined)[] {
    return Array.from(el.querySelectorAll('.feature-row.selected .feature-name')).map(n => n.textContent?.trim());
  }

  function byLabel(el: HTMLElement, label: string): HTMLButtonElement | null {
    return el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  }

  it('offers Move up / Move down per selected feature, disabled at the ends', () => {
    const el = render(); // prefilled: g, f, e, d, c

    expect(byLabel(el, 'Move g up')?.disabled).toBe(true);
    expect(byLabel(el, 'Move g down')?.disabled).toBe(false);
    expect(byLabel(el, 'Move c up')?.disabled).toBe(false);
    expect(byLabel(el, 'Move c down')?.disabled).toBe(true);
    expect(byLabel(el, 'Remove e')).not.toBeNull();
  });

  it('moves a feature with its button and keeps focus on the moved feature', () => {
    const el = render();

    byLabel(el, 'Move e up')?.click();
    expect(selectedNames(el)).toEqual(['g', 'e', 'f', 'd', 'c']);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Move e up');

    byLabel(el, 'Move e up')?.click();
    expect(selectedNames(el)).toEqual(['e', 'g', 'f', 'd', 'c']);
    // "Move up" is disabled at the top, so focus switches to "Move down".
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Move e down');
  });

  it('renders available features as buttons named "Add <feature>"', () => {
    const el = render();
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button.feature-row.available'));

    expect(buttons.map(b => b.getAttribute('aria-label'))).toEqual(['Add a', 'Add b']);

    buttons[0].click();
    expect(selectedNames(el)).toEqual(['g', 'f', 'e', 'd', 'c', 'a']);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Add b');
  });

  it('keeps help buttons out of the label and the heading', () => {
    const el = render();

    const label = el.querySelector('label[for="step5-color-attribute"]');
    expect(label?.textContent?.trim()).toBe('Color attribute');
    expect(label?.querySelector('app-help-tooltip, button')).toBeNull();
    expect(el.querySelector('#step5-glyph-heading app-help-tooltip')).toBeNull();
  });

  it('names the color scale picker by its visible label', () => {
    const el = render();
    const trigger = el.querySelector('app-color-scale-selector button.selected-scale');

    expect(trigger?.getAttribute('aria-labelledby')?.split(' ')[0]).toBe('step5-color-scale-label');
    expect(el.querySelector('#step5-color-scale-label')?.textContent?.trim()).toBe('Color scale');
  });

  it('marks the active glyph type with aria-pressed', () => {
    const pressed = Array.from(render().querySelectorAll('.glyph-type-tabs button')).map(b =>
      b.getAttribute('aria-pressed')
    );
    expect(pressed).toEqual(['true', 'false', 'false']);
  });

  it('tells the user these settings can be changed later in the dashboard', () => {
    const text = (render().textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain("You can change these later in the dashboard's Encoding panel.");
  });

  it('keeps the deep-link anchors for color and glyph features', () => {
    const el = render();
    expect(el.querySelector('#wizard-anchor-color')).not.toBeNull();
    expect(el.querySelector('#wizard-anchor-glyph')).not.toBeNull();
  });

  it('renders the prefilled features in the selected list', () => {
    const names = Array.from(render().querySelectorAll('.feature-row.selected .feature-name')).map(n =>
      n.textContent?.trim()
    );
    expect(names).toEqual(['g', 'f', 'e', 'd', 'c']);
  });
});
