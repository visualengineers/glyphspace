import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PreprocessingWizardComponent } from './preprocessing-wizard.component';
import { PreprocessingService } from './services/preprocessing.service';
import { HistoryStatus, PreprocessingState } from './models/preprocessing-state';
import { ColumnConfig } from './models/column-config';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from './models/data-type.enum';

/**
 * A4 – wizard shell: the UX layer on top of the history engine. Covers the
 * keyboard shortcuts (Strg+Z / Umschalt+Z / Y and the native-undo passthrough),
 * the non-stacking history hint incl. its auto-dismiss timer and deep-link, the
 * undo/redo tooltips, and the step-reload triggered by stateRestored$.
 *
 * The component uses viewChild(), which requires an injection context, so it is
 * built via TestBed.runInInjectionContext rather than a bare `new` — this avoids
 * rendering the (heavy) template while still giving the signal queries a context.
 */
describe('PreprocessingWizardComponent – undo/redo shell', () => {
  let component: PreprocessingWizardComponent;
  let service: PreprocessingService;

  const dataProcessorStub = {} as unknown as ConstructorParameters<typeof PreprocessingService>[0];
  const dataLoaderStub = {
    getDataSetNames: () => [] as string[],
  } as unknown as ConstructorParameters<typeof PreprocessingService>[1];

  // The shell also injects a ChangeDetectorRef (used only by the A14 morph path,
  // which these tests do not exercise) — a no-op stub is enough.
  const cdrStub = {
    detectChanges: () => undefined,
    markForCheck: () => undefined,
    detach: () => undefined,
    reattach: () => undefined,
    checkNoChanges: () => undefined,
  } as unknown as ChangeDetectorRef;

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

  /** Seed columns so that toggleColumnEnabled produces a real, describable undo entry. */
  function seedColumns(): void {
    const columnConfigs = new Map<string, ColumnConfig>([['alpha', makeConfig('alpha')]]);
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({ columnConfigs });
  }

  function makeKey(overrides: Partial<Record<'ctrlKey' | 'metaKey' | 'shiftKey', boolean>> & { key?: string; target?: EventTarget | null }): KeyboardEvent {
    return {
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'z',
      target: null,
      preventDefault: jasmine.createSpy('preventDefault'),
      ...overrides,
    } as unknown as KeyboardEvent;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = new PreprocessingService(dataProcessorStub, dataLoaderStub);
    seedColumns();
    component = TestBed.runInInjectionContext(() => new PreprocessingWizardComponent(service, cdrStub));
  });

  afterEach(() => localStorage.clear());

  describe('keyboard shortcuts', () => {
    it('Strg+Z triggers undo and prevents default', () => {
      spyOn(component, 'undo');
      spyOn(component, 'redo');
      const e = makeKey({ ctrlKey: true, key: 'z' });

      component.onKeyDown(e);

      expect(component.undo).toHaveBeenCalled();
      expect(component.redo).not.toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('Strg+Umschalt+Z triggers redo', () => {
      spyOn(component, 'undo');
      spyOn(component, 'redo');

      component.onKeyDown(makeKey({ ctrlKey: true, shiftKey: true, key: 'z' }));

      expect(component.redo).toHaveBeenCalled();
      expect(component.undo).not.toHaveBeenCalled();
    });

    it('Strg+Y triggers redo', () => {
      spyOn(component, 'redo');
      component.onKeyDown(makeKey({ ctrlKey: true, key: 'y' }));
      expect(component.redo).toHaveBeenCalled();
    });

    it('accepts Cmd (metaKey) as the modifier too', () => {
      spyOn(component, 'undo');
      component.onKeyDown(makeKey({ metaKey: true, key: 'z' }));
      expect(component.undo).toHaveBeenCalled();
    });

    it('ignores Z without a modifier', () => {
      spyOn(component, 'undo');
      const e = makeKey({ key: 'z' });
      component.onKeyDown(e);
      expect(component.undo).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('ignores unrelated modifier combos (Strg+A)', () => {
      spyOn(component, 'undo');
      spyOn(component, 'redo');
      component.onKeyDown(makeKey({ ctrlKey: true, key: 'a' }));
      expect(component.undo).not.toHaveBeenCalled();
      expect(component.redo).not.toHaveBeenCalled();
    });

    it('leaves native field-level undo alone when focus is in an input', () => {
      spyOn(component, 'undo');
      const input = document.createElement('input');
      const e = makeKey({ ctrlKey: true, key: 'z', target: input });

      component.onKeyDown(e);

      expect(component.undo).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('history hint', () => {
    it('shows a named hint after an undo', () => {
      service.toggleColumnEnabled('alpha'); // one undoable action, labelled "Spaltenauswahl"
      component.undo();

      expect(component.historyHint).not.toBeNull();
      expect(component.historyHint!.message).toBe('Spaltenauswahl wurde zurückgesetzt');
      expect(component.historyHint!.step).toBe(1);
      expect(component.historyHint!.anchorId).toBe('wizard-anchor-columns');
    });

    it('uses "wiederhergestellt" wording after a redo', () => {
      service.toggleColumnEnabled('alpha');
      service.undo();
      component.redo();

      expect(component.historyHint!.message).toBe('Spaltenauswahl wurde wiederhergestellt');
    });

    it('shows no hint when there is nothing to undo', () => {
      component.undo();
      expect(component.historyHint).toBeNull();
    });

    it('keeps only the latest hint (non-stacking)', () => {
      service.updateColumnConfig('alpha', { encodingMethod: EncodingMethod.Standardize });
      service.toggleColumnEnabled('alpha');

      component.undo(); // reverts the toggle -> "Spaltenauswahl"
      component.undo(); // reverts the encoding change -> "Encoding"

      expect(component.historyHint!.message).toBe('Encoding wurde zurückgesetzt');
    });

    it('auto-dismisses the hint after the timeout', () => {
      jasmine.clock().install();
      try {
        service.toggleColumnEnabled('alpha');
        component.undo();
        expect(component.historyHint).not.toBeNull();

        jasmine.clock().tick(5001);
        expect(component.historyHint).toBeNull();
      } finally {
        jasmine.clock().uninstall();
      }
    });

    it('deep-links to the changed setting and dismisses on showHistoryChange', () => {
      const spy = spyOn(service, 'goToStepWithScroll');
      service.toggleColumnEnabled('alpha');
      component.undo();

      component.showHistoryChange();

      expect(spy).toHaveBeenCalledWith(1, 'wizard-anchor-columns');
      expect(component.historyHint).toBeNull();
    });
  });

  describe('tooltips', () => {
    it('describes the concrete next undo/redo action when available', () => {
      component.history = { canUndo: true, canRedo: true, undoLabel: 'Spalte abgewählt', redoLabel: 'Spalte ausgewählt' } as HistoryStatus;
      expect(component.undoTooltip).toBe('Rückgängig: Spalte abgewählt');
      expect(component.redoTooltip).toBe('Wiederherstellen: Spalte ausgewählt');
    });

    it('falls back to an empty-state message', () => {
      component.history = { canUndo: false, canRedo: false, undoLabel: null, redoLabel: null };
      expect(component.undoTooltip).toBe('Nichts rückgängig zu machen');
      expect(component.redoTooltip).toBe('Nichts wiederherzustellen');
    });
  });

  describe('step reload on stateRestored$', () => {
    it('re-instantiates the visible step after an undo restores a snapshot', () => {
      jasmine.clock().install();
      try {
        component.ngOnInit();
        service.toggleColumnEnabled('alpha');

        service.undo(); // emits stateRestored$ -> reloadCurrentStep()
        expect(component.stepVisible).toBeFalse();

        jasmine.clock().tick(1);
        expect(component.stepVisible).toBeTrue();
      } finally {
        jasmine.clock().uninstall();
        component.ngOnDestroy();
      }
    });
  });
});
