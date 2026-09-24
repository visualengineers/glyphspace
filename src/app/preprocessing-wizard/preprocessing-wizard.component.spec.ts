import type { Mock } from 'vitest';
import { ApplicationRef, ChangeDetectorRef, ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { PreprocessingWizardComponent } from './preprocessing-wizard.component';
import { PreprocessingService } from './services/preprocessing.service';
import { HistoryStatus, PreprocessingState } from './models/preprocessing-state';
import { ColumnConfig } from './models/column-config';
import { WizardStep } from './shared/wizard-step';
import { WIZARD_STEPS, WizardStepId, stepIndex } from './shared/constants/step-info';
import { DataProfile } from './models/column-statistics';
import { WizardAnnouncer } from './shared/wizard-announcer.service';
import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { createTestPreprocessingService } from './testing/preprocessing-test-helpers';
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
 * keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y and the native-undo passthrough),
 * the non-stacking history hint incl. its auto-dismiss timer and deep-link, the
 * undo/redo tooltips, the step-reload triggered by stateRestored$, the
 * undo/redo lock while processing, step completion/navigation by step id, and
 * the columns -> features morph lifecycle.
 *
 * The component uses viewChild(), which requires an injection context, so it is
 * built via TestBed.runInInjectionContext rather than a bare `new` — this avoids
 * rendering the (heavy) template while still giving the signal queries a context.
 */
describe('PreprocessingWizardComponent – undo/redo shell', () => {
  let component: PreprocessingWizardComponent;
  let service: PreprocessingService;

  // The shell also injects a ChangeDetectorRef (used only by the A14 morph path)
  // — a no-op stub is enough.
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

  function makeKey(
    overrides: Partial<Record<'ctrlKey' | 'metaKey' | 'shiftKey', boolean>> & {
      key?: string;
      target?: EventTarget | null;
    }
  ): KeyboardEvent {
    return {
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'z',
      target: null,
      preventDefault: vi.fn(),
      ...overrides,
    } as unknown as KeyboardEvent;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = createTestPreprocessingService();
    seedColumns();
    component = TestBed.runInInjectionContext(() => new PreprocessingWizardComponent(service, cdrStub));
  });

  afterEach(() => localStorage.clear());

  describe('keyboard shortcuts', () => {
    it('Ctrl+Z triggers undo and prevents default', () => {
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      vi.spyOn(component, 'redo').mockImplementation(() => undefined);
      const e = makeKey({ ctrlKey: true, key: 'z' });

      component.onKeyDown(e);

      expect(component.undo).toHaveBeenCalled();
      expect(component.redo).not.toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('Ctrl+Shift+Z triggers redo', () => {
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      vi.spyOn(component, 'redo').mockImplementation(() => undefined);

      component.onKeyDown(makeKey({ ctrlKey: true, shiftKey: true, key: 'z' }));

      expect(component.redo).toHaveBeenCalled();
      expect(component.undo).not.toHaveBeenCalled();
    });

    it('Ctrl+Y triggers redo', () => {
      vi.spyOn(component, 'redo').mockImplementation(() => undefined);
      component.onKeyDown(makeKey({ ctrlKey: true, key: 'y' }));
      expect(component.redo).toHaveBeenCalled();
    });

    it('accepts Cmd (metaKey) as the modifier too', () => {
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      component.onKeyDown(makeKey({ metaKey: true, key: 'z' }));
      expect(component.undo).toHaveBeenCalled();
    });

    it('ignores Z without a modifier', () => {
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      const e = makeKey({ key: 'z' });
      component.onKeyDown(e);
      expect(component.undo).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('ignores unrelated modifier combos (Ctrl+A)', () => {
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      vi.spyOn(component, 'redo').mockImplementation(() => undefined);
      component.onKeyDown(makeKey({ ctrlKey: true, key: 'a' }));
      expect(component.undo).not.toHaveBeenCalled();
      expect(component.redo).not.toHaveBeenCalled();
    });

    it('leaves native field-level undo alone when focus is in an input', () => {
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      const input = document.createElement('input');
      const e = makeKey({ ctrlKey: true, key: 'z', target: input });

      component.onKeyDown(e);

      expect(component.undo).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('history hint', () => {
    it('shows a named hint after an undo', () => {
      service.toggleColumnEnabled('alpha'); // one undoable action on the "Column selection" setting
      component.undo();

      expect(component.historyHint).not.toBeNull();
      expect(component.historyHint?.message).toBe('Column selection undone');
      expect(component.historyHint?.step).toBe('columns');
      expect(component.historyHint?.anchorId).toBe('wizard-anchor-columns');
    });

    it('uses "redone" wording after a redo', () => {
      service.toggleColumnEnabled('alpha');
      service.undo();
      component.redo();

      expect(component.historyHint?.message).toBe('Column selection redone');
    });

    it('shows no hint when there is nothing to undo', () => {
      component.undo();
      expect(component.historyHint).toBeNull();
    });

    it('keeps only the latest hint (non-stacking)', () => {
      service.updateColumnConfig('alpha', { encodingMethod: EncodingMethod.Standardize });
      service.toggleColumnEnabled('alpha');

      component.undo(); // reverts the toggle -> "Column selection"
      component.undo(); // reverts the encoding change -> "Encoding"

      expect(component.historyHint?.message).toBe('Encoding undone');
    });

    it('auto-dismisses the hint after the timeout', () => {
      vi.useFakeTimers();
      try {
        service.toggleColumnEnabled('alpha');
        component.undo();
        expect(component.historyHint).not.toBeNull();

        vi.advanceTimersByTime(5001);
        expect(component.historyHint).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('deep-links to the changed setting and dismisses on showHistoryChange', () => {
      const spy = vi.spyOn(service, 'goToStepWithScroll').mockImplementation(() => undefined);
      service.toggleColumnEnabled('alpha');
      component.undo();

      component.showHistoryChange();

      expect(spy).toHaveBeenCalledWith('columns', 'wizard-anchor-columns');
      expect(component.historyHint).toBeNull();
    });
  });

  describe('tooltips', () => {
    it('describes the concrete next undo/redo action when available', () => {
      component.history = {
        canUndo: true,
        canRedo: true,
        undoLabel: 'Column deselected',
        redoLabel: 'Column selected',
      } as HistoryStatus;
      expect(component.undoTooltip).toBe('Undo: Column deselected (Ctrl+Z)');
      expect(component.redoTooltip).toBe('Redo: Column selected (Ctrl+Shift+Z)');
    });

    it('uses the label the service pushes for a column toggle', () => {
      component.ngOnInit();
      service.toggleColumnEnabled('alpha');
      expect(component.undoTooltip).toBe('Undo: Column deselected (Ctrl+Z)');
      component.ngOnDestroy();
    });

    it('falls back to an empty-state message', () => {
      component.history = { canUndo: false, canRedo: false, undoLabel: null, redoLabel: null };
      expect(component.undoTooltip).toBe('Nothing to undo');
      expect(component.redoTooltip).toBe('Nothing to redo');
    });
  });

  describe('step reload on stateRestored$', () => {
    it('re-instantiates the visible step after an undo restores a snapshot', () => {
      vi.useFakeTimers();
      try {
        component.ngOnInit();
        service.toggleColumnEnabled('alpha');

        service.undo(); // emits stateRestored$ -> reloadCurrentStep()
        expect(component.stepVisible).toBe(false);

        vi.advanceTimersByTime(1);
        expect(component.stepVisible).toBe(true);
      } finally {
        vi.useRealTimers();
        component.ngOnDestroy();
      }
    });

    it('clears the pending step-reload timer on destroy', () => {
      vi.useFakeTimers();
      try {
        component.ngOnInit();
        service.toggleColumnEnabled('alpha');
        service.undo();
        expect(component.stepVisible).toBe(false);

        component.ngOnDestroy();
        vi.advanceTimersByTime(1);

        expect(component.stepVisible).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('never scrolls or moves focus after destroy (pending after-render work is cancelled)', () => {
      vi.useFakeTimers();
      const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      try {
        component.ngOnInit(); // schedules the after-render focus/scroll of the dialog title
        component.ngOnDestroy();
        TestBed.inject(ApplicationRef).tick();
        vi.advanceTimersByTime(1);

        expect(scrollSpy).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('Escape key', () => {
    it('closes the wizard and prevents default', () => {
      const closed = vi.spyOn(component.wizardClose, 'emit').mockImplementation(() => undefined);
      const e = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });

      component.onKeyDown(e);

      expect(closed).toHaveBeenCalledTimes(1);
      expect(e.defaultPrevented).toBe(true);
    });

    it('ignores an Escape that another handler already consumed', () => {
      const closed = vi.spyOn(component.wizardClose, 'emit').mockImplementation(() => undefined);
      const e = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
      e.preventDefault();

      component.onKeyDown(e);

      expect(closed).not.toHaveBeenCalled();
    });
  });

  describe('announcements and step summaries', () => {
    let announce: Mock;

    beforeEach(() => {
      announce = vi.spyOn(TestBed.inject(WizardAnnouncer), 'announce').mockImplementation(() => undefined);
    });

    afterEach(() => component.ngOnDestroy());

    it('announces "Step N of 6: <title>" after a step change, but not on open', () => {
      component.ngOnInit();
      expect(announce).not.toHaveBeenCalled();

      service.goToStep('columns');

      expect(announce).toHaveBeenCalledExactlyOnceWith('Step 2 of 6: Select Columns');
    });

    it('does not announce when the step stays the same', () => {
      component.ngOnInit();
      service.toggleColumnEnabled('alpha');
      expect(announce).not.toHaveBeenCalled();
    });

    it('announces the undo/redo hint through the live region', () => {
      service.toggleColumnEnabled('alpha');
      component.undo();
      expect(announce).toHaveBeenCalledWith('Column selection undone');
    });

    it('passes live summaries of completed steps to the stepper', () => {
      const profile = { fileName: 'wine.csv', totalRows: 1599 } as DataProfile;
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
        dataProfile: profile,
      });
      component.ngOnInit();

      expect(component.steps[stepIndex('upload')].summary).toBe('wine.csv · 1,599 rows');
      expect(component.steps[stepIndex('columns')].summary).toBe('1 of 1 column');
      // The purpose stays available for the current and upcoming steps.
      expect(component.steps[stepIndex('upload')].description).toBe(WIZARD_STEPS[0].purpose);
    });

    it('claims the anchor of a deep link before the target step renders', async () => {
      component.ngOnInit();

      service.goToStepWithScroll('columns', 'wizard-anchor-columns');
      await Promise.resolve();

      // Claimed by the shell (focused after render), so the step finds nothing left.
      expect(service.consumeScrollTarget()).toBeNull();
    });
  });

  describe('while processing', () => {
    function setProcessing(isProcessing: boolean): void {
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({ isProcessing });
    }

    beforeEach(() => {
      component.ngOnInit();
      component.history = { canUndo: true, canRedo: true, undoLabel: 'a', redoLabel: 'b' };
    });

    afterEach(() => component.ngOnDestroy());

    it('disables the undo/redo buttons', () => {
      expect(component.undoDisabled).toBe(false);
      expect(component.redoDisabled).toBe(false);

      setProcessing(true);

      expect(component.undoDisabled).toBe(true);
      expect(component.redoDisabled).toBe(true);
    });

    it('ignores the undo/redo keyboard shortcuts', () => {
      setProcessing(true);
      vi.spyOn(component, 'undo').mockImplementation(() => undefined);
      vi.spyOn(component, 'redo').mockImplementation(() => undefined);

      component.onKeyDown(makeKey({ ctrlKey: true, key: 'z' }));
      component.onKeyDown(makeKey({ ctrlKey: true, shiftKey: true, key: 'z' }));
      component.onKeyDown(makeKey({ ctrlKey: true, key: 'y' }));

      expect(component.undo).not.toHaveBeenCalled();
      expect(component.redo).not.toHaveBeenCalled();
    });

    it('does not tear down the current step when a snapshot is restored', () => {
      vi.useFakeTimers();
      try {
        setProcessing(true);
        // Drive stateRestored$ directly so this does not depend on the service's own guard.
        (service as unknown as { stateRestoredSubject: Subject<void> }).stateRestoredSubject.next();

        expect(component.stepVisible).toBe(true);
        vi.advanceTimersByTime(1);
        expect(component.stepVisible).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('step ids', () => {
    function setState(updates: Partial<PreprocessingState>): void {
      (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState(updates);
    }

    afterEach(() => component.ngOnDestroy());

    it('builds one sidebar entry per wizard step, in registry order', () => {
      expect(component.steps.map(s => s.label)).toEqual(WIZARD_STEPS.map(s => s.title));
      expect(component.steps.length).toBe(6);
    });

    it('derives the rendered step id from the stored index', () => {
      component.ngOnInit();
      service.goToStep('appearance');
      expect(component.currentStep).toBe(4);
      expect(component.currentStepId).toBe('appearance');
    });

    it('navigates by id when a stepper entry is clicked', () => {
      const spy = vi.spyOn(service, 'goToStep').mockImplementation(() => undefined);
      component.onStepClick(3);
      expect(spy).toHaveBeenCalledWith('projection');
    });

    it('ignores a stepper index outside the registry', () => {
      const spy = vi.spyOn(service, 'goToStep').mockImplementation(() => undefined);
      component.onStepClick(6);
      expect(spy).not.toHaveBeenCalled();
    });

    it('marks no step completed before a file is loaded', () => {
      setState({ dataProfile: null, columnConfigs: new Map() });
      component.ngOnInit();
      expect(component.steps.map(s => s.completed)).toEqual([false, false, false, false, false, false]);
    });

    it('marks every step before the furthest visited one completed', () => {
      setState({ dataProfile: {} as DataProfile });
      component.ngOnInit();
      service.goToStep('review');

      expect(component.steps.map(s => s.completed)).toEqual([true, true, true, true, true, false]);
    });

    it('completes the Glyphs & Color step only once the user moved past it', () => {
      setState({ dataProfile: {} as DataProfile });
      component.ngOnInit();
      service.goToStep('appearance');

      const completed = (id: WizardStepId): boolean => component.steps[stepIndex(id)].completed;
      expect(completed('projection')).toBe(true);
      expect(completed('appearance')).toBe(false);
    });

    it('completes the review step once a processed dataset exists', () => {
      setState({ dataProfile: {} as DataProfile, processedDataset: {} as DatasetCollection });
      component.ngOnInit();

      expect(component.steps[stepIndex('review')].completed).toBe(true);
    });
  });

  describe('columns -> features morph (Web Animations API)', () => {
    let host: HTMLElement;
    let proceedSpy: Mock;
    let step: WizardStep;

    /**
     * Resolves after the next 'finish' event has been handled by *all* listeners.
     * Resolving on a macrotask matters: zone.js runs addEventListener callbacks
     * from one native listener that precedes the `onfinish` handler, and the
     * microtask checkpoint in between would otherwise resume the test too early.
     */
    function nextFinish(animation: Animation): Promise<void> {
      return new Promise(resolve => animation.addEventListener('finish', () => setTimeout(resolve), { once: true }));
    }

    beforeEach(() => {
      host = document.createElement('div');
      host.innerHTML =
        '<div class="step-container"><div class="columns-table-container" style="width:800px;height:100px"></div></div>';
      document.body.appendChild(host);
      component.wizardContent = new ElementRef(host);
      component.currentStep = stepIndex('columns');
      component.reduceMotion = false;
      proceedSpy = vi.fn();
      step = { proceed: proceedSpy, canProceed: () => true, primaryLabel: 'Continue' };
    });

    afterEach(() => {
      component.ngOnDestroy();
      host.remove();
    });

    (['upload', 'features', 'projection', 'appearance'] as WizardStepId[]).forEach(id => {
      it(`proceeds immediately without a morph on the ${id} step`, () => {
        component.currentStep = stepIndex(id);

        component.onProceed(step);

        expect(proceedSpy).toHaveBeenCalledTimes(1);
        expect(host.getAnimations({ subtree: true }).length).toBe(0);
      });
    });

    it('proceeds immediately when the user prefers reduced motion', () => {
      component.reduceMotion = true;

      component.onProceed(step);

      expect(proceedSpy).toHaveBeenCalledTimes(1);
      expect(host.getAnimations({ subtree: true }).length).toBe(0);
    });

    it('proceeds once the collapse animation has finished', async () => {
      component.onProceed(step);
      const [collapse] = host.getAnimations({ subtree: true });
      expect(collapse).toBeDefined();
      expect(proceedSpy).not.toHaveBeenCalled();

      const done = nextFinish(collapse);
      collapse.finish();
      await done;

      expect(proceedSpy).toHaveBeenCalledTimes(1);
    });

    it('ignores a repeated continue click while the collapse is running', async () => {
      component.onProceed(step);
      component.onProceed(step);
      const animations = host.getAnimations({ subtree: true });
      expect(animations.length).toBe(1);

      const done = nextFinish(animations[0]);
      animations[0].finish();
      await done;

      expect(proceedSpy).toHaveBeenCalledTimes(1);
    });

    it('does not proceed when the user left the column step while the collapse was running', async () => {
      component.onProceed(step);
      const [collapse] = host.getAnimations({ subtree: true });
      component.currentStep = stepIndex('upload'); // e.g. navigated back via the stepper

      const done = nextFinish(collapse);
      collapse.finish();
      await done;

      expect(proceedSpy).not.toHaveBeenCalled();
    });

    it('cancels the collapse and never proceeds when destroyed mid-transition', async () => {
      const detectSpy = vi.spyOn(cdrStub, 'detectChanges').mockImplementation(() => undefined);
      component.onProceed(step);
      const [collapse] = host.getAnimations({ subtree: true });

      component.ngOnDestroy();
      expect(collapse.playState).toBe('idle');

      // Even if the animation were driven to completion afterwards, the destroyed
      // shell must neither advance the wizard nor touch its view.
      const done = nextFinish(collapse);
      collapse.finish();
      await done;

      expect(proceedSpy).not.toHaveBeenCalled();
      expect(detectSpy).not.toHaveBeenCalled();
    });

    it('leaves no transform on the Step 3 rail header / detail well after the entrance', async () => {
      component.onProceed(step);
      const [collapse] = host.getAnimations({ subtree: true });
      // Simulate the swap to Step 3 that proceed() + detectChanges() would render.
      proceedSpy.mockImplementation(() => {
        host.innerHTML =
          '<div class="step-container"><div class="rail-header">h</div><div class="detail-well">w</div></div>';
      });

      const done = nextFinish(collapse);
      collapse.finish();
      await done;

      const entrance = host.getAnimations({ subtree: true });
      expect(entrance.length).toBe(2);
      entrance.forEach(a => a.finish());

      const railHeader = host.querySelector<HTMLElement>('.rail-header');
      const well = host.querySelector<HTMLElement>('.detail-well');
      expect(railHeader && getComputedStyle(railHeader).transform).toBe('none');
      expect(well && getComputedStyle(well).transform).toBe('none');
      expect(host.getAnimations({ subtree: true }).length).toBe(0);
    });
  });
});
