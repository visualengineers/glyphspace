import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  viewChild,
  HostListener,
  ChangeDetectorRef,
  AfterRenderRef,
  Injector,
  afterNextRender,
  inject,
} from '@angular/core';
import { Subscription, distinctUntilChanged, map, skip } from 'rxjs';
import { PreprocessingService, UndoRedoInfo } from './services/preprocessing.service';
import { HistoryStatus } from './models/preprocessing-state';
import { ProgressStepperComponent, Step } from './shared/progress-stepper/progress-stepper.component';
import { WIZARD_STEP, WizardStep } from './shared/wizard-step';
import { WIZARD_STEPS, WizardStepId, getStepInfo, stepIdAt, stepIndex } from './shared/constants/step-info';
import { WizardAnnouncer } from './shared/wizard-announcer.service';
import { stepSummaries } from './shared/step-summaries';
import { focusAnchor, wrapTabFocus } from './shared/dialog-focus';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { Step3ConfigureDataFeaturesComponent } from './steps/step3-configure-data-features/step3-configure-data-features.component';
import { Step4ProjectionSettingsComponent } from './steps/step4-projection-settings/step4-projection-settings.component';
import { Step5GlyphColorSettingsComponent } from './steps/step5-glyph-color-settings/step5-glyph-color-settings.component';
import { Step6ReviewProcessingComponent } from './steps/step6-review-processing/step6-review-processing.component';
import { PreprocessingState } from './models/preprocessing-state';

// A14: Rail width, shared with `$wizard-rail-width` in _wizard-shared.scss. Step 2
// collapses to exactly this width so the leftover name band lines up with Step 3's
// rail (one shared value on both sides — no per-side pixel drift). Values that are
// genuinely layout-dependent (row-top, box height) are measured at runtime.
const WIZARD_RAIL_WIDTH = 320;

// Global speed factor for the Step 2 -> 3 morph (1 = production; lower = slower,
// useful for frame-by-frame inspection).
const MORPH_TIMESCALE = 1;

// Easing curves of the morph (CSS equivalents of the former GSAP power2 eases).
const EASE_POWER2_IN_OUT = 'cubic-bezier(0.45, 0, 0.55, 1)';
const EASE_POWER2_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

/** Morph duration in ms for a nominal duration in seconds, scaled by MORPH_TIMESCALE. */
function morphDuration(seconds: number): number {
  return (seconds * 1000) / MORPH_TIMESCALE;
}

/**
 * Open popups that own the Escape key, so one Escape closes the popup, not the
 * whole wizard. Checked in the capture phase, before the popup closes itself.
 */
const OPEN_POPUP_SELECTOR = [
  '[role="tooltip"].visible', // help tooltips and projection previews (PopupTrigger)
  '[aria-haspopup]:not([aria-haspopup="false"])[aria-expanded="true"]', // menus / listboxes
  '.color-scale-options', // Step 5 color-scale dropdown
].join(',');

/** Element that receives focus after the next render. */
type PendingFocus = 'dialog' | 'step';

@Component({
  selector: 'app-preprocessing-wizard',
  standalone: true,
  imports: [
    ProgressStepperComponent,
    Step1UploadComponent,
    Step2ColumnSelectionComponent,
    Step3ConfigureDataFeaturesComponent,
    Step4ProjectionSettingsComponent,
    Step5GlyphColorSettingsComponent,
    Step6ReviewProcessingComponent,
  ],
  templateUrl: './preprocessing-wizard.component.html',
  styleUrl: './preprocessing-wizard.component.scss',
})
export class PreprocessingWizardComponent implements OnInit, OnDestroy {
  @Output() wizardClose = new EventEmitter<void>();
  @ViewChild('wizardContent') wizardContent!: ElementRef<HTMLElement>;

  // Currently rendered step exposed through the WIZARD_STEP token so the shell
  // can drive the centralized navigation bar. Undefined on the review step,
  // which keeps its own context-dependent footer.
  readonly activeStep = viewChild(WIZARD_STEP);

  // Dialog semantics and focus management (WCAG 2.4.3, 4.1.2).
  readonly dialogRoot = viewChild<ElementRef<HTMLElement>>('dialogRoot');
  readonly dialogTitle = viewChild<ElementRef<HTMLElement>>('dialogTitle');
  readonly stepTitle = viewChild<ElementRef<HTMLElement>>('stepTitle');
  readonly startOverDialog = viewChild<ElementRef<HTMLDialogElement>>('startOverDialog');

  // Screen-reader announcements; the shell renders its two live regions.
  readonly announcer = inject(WizardAnnouncer);
  private readonly injector = inject(Injector);

  readonly stepCount = WIZARD_STEPS.length;

  private subscription = new Subscription();

  // Focus target applied after the next render: the dialog title on open, the
  // step title after a step change. A claimed deep-link anchor takes precedence.
  private pendingFocus: PendingFocus | null = null;
  private pendingAnchorId: string | null = null;
  private revealRef: AfterRenderRef | null = null;

  // Whether a popup was open when Escape went down (captured before it closed itself).
  private popupOpenAtEscape = false;

  currentStep = 0; // index into WIZARD_STEPS; use currentStepId for lookups
  highestStepVisited = 0; // Track highest step to enable forward navigation
  isProcessing = false;

  // A14: When the user prefers reduced motion, the step 2 -> 3 morph is
  // skipped (Angular renders the switch instantly). Read once at init.
  reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A4: undo/redo history state, driven by the service's history$ stream.
  history: HistoryStatus = { canUndo: false, canRedo: false, undoLabel: null, redoLabel: null };
  // Toggled off/on to force the current step to re-instantiate after an undo/redo,
  // so steps that cache state in ngOnInit re-read the restored snapshot.
  stepVisible = true;

  // A4: subtle undo/redo hint embedded in the bottom navigation bar (instead of a
  // floating toast). Single slot: a new hint replaces the previous one, and a
  // timer hides it again after a short while.
  historyHint: { message: string; step: WizardStepId | null; anchorId: string | null } | null = null;
  private historyHintTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly HISTORY_HINT_MS = 5000;

  // Deferred step re-render callback, cleared on destroy.
  private reloadStepTimer: ReturnType<typeof setTimeout> | null = null;

  // A14: running Step 2 -> 3 morph animations, cancelled on destroy so a closed
  // wizard never advances a step or touches its destroyed view.
  private morphAnimations: Animation[] = [];
  private destroyed = false;

  // Labels and descriptions come from WIZARD_STEPS so the sidebar stays the single
  // source of truth for step titles/purposes (no duplication in the work area).
  steps: Step[] = WIZARD_STEPS.map(info => ({ label: info.title, description: info.purpose, completed: false }));

  constructor(
    private preprocessingService: PreprocessingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.subscription.add(
      this.preprocessingService.state$.subscribe(state => {
        // A14: The forward Step 2 -> 3 morph is driven entirely from onProceed
        // (Phase 1 collapse -> swap -> Phase 2 entrance, all in one flow) so the
        // entrance can be set up synchronously right after the swap. This
        // subscription just tracks state; it no longer triggers the animation.
        this.currentStep = state.currentStep;
        this.isProcessing = state.isProcessing;

        // Track highest step visited for navigation
        if (state.currentStep > this.highestStepVisited) {
          this.highestStepVisited = state.currentStep;
        }

        // Update step completion and summaries based on state
        this.updateStepCompletion(state);
      })
    );

    this.subscribeToStepChanges();
    this.subscribeToDeepLinks();

    // A4: keep the undo/redo toolbar in sync with the history stack.
    this.subscription.add(
      this.preprocessingService.history$.subscribe(status => {
        this.history = status;
      })
    );

    // A4: after an undo/redo reinstalls a snapshot, force the visible step to
    // rebuild so it reflects the restored state (steps read state once on init).
    // Never while processing: rebuilding would tear down the running step.
    this.subscription.add(
      this.preprocessingService.stateRestored$.subscribe(() => {
        if (!this.isProcessing) {
          this.reloadCurrentStep();
        }
      })
    );

    window.addEventListener('keydown', this.captureEscape, true);

    // Opening the dialog moves focus into it (onto its title).
    this.pendingFocus = 'dialog';
    this.scheduleReveal();
  }

  // ── Focus management (WCAG 2.4.3) ─────────────────────────────────────────

  /**
   * After a step change (not the initial state on open): announce "Step N of 6:
   * <title>" and, once the new step has rendered, scroll the work area to the top
   * and move focus to the step title in the title bar.
   */
  private subscribeToStepChanges(): void {
    this.subscription.add(
      this.preprocessingService.state$
        .pipe(
          map(state => state.currentStep),
          distinctUntilChanged(),
          skip(1)
        )
        .subscribe(index => {
          const id = stepIdAt(index);
          if (id) {
            this.announcer.announce(`Step ${index + 1} of ${this.stepCount}: ${getStepInfo(id).title}`);
          }
          this.pendingFocus = 'step';
          this.scheduleReveal();
        })
    );
  }

  /**
   * A6 deep links (history hint "Show change", Review edit links, issue-card "Fix
   * in step…") end in goToStepWithScroll(), which emits the new state first and
   * stores the anchor id right after. The shell claims that anchor one microtask
   * later — still before change detection renders the target step — and focuses
   * it after the render. Also covers links into the step that is already shown.
   */
  private subscribeToDeepLinks(): void {
    this.subscription.add(
      this.preprocessingService.state$.pipe(skip(1)).subscribe(() => {
        void Promise.resolve().then(() => this.claimDeepLink());
      })
    );
  }

  private claimDeepLink(): void {
    if (this.destroyed) return;
    const anchorId = this.preprocessingService.consumeScrollTarget();
    if (anchorId) {
      this.pendingAnchorId = anchorId;
      this.scheduleReveal();
    }
  }

  private scheduleReveal(): void {
    if (this.revealRef) return;
    this.revealRef = afterNextRender(
      () => {
        this.revealRef = null;
        this.reveal();
      },
      { injector: this.injector }
    );
  }

  /** Applies the pending focus: a deep-link anchor, else the step or dialog title. */
  private reveal(): void {
    const anchor = this.pendingAnchorId ? document.getElementById(this.pendingAnchorId) : null;
    const focus = this.pendingFocus;
    this.pendingAnchorId = null;
    this.pendingFocus = null;
    if (anchor) {
      focusAnchor(anchor, !this.reduceMotion);
      return;
    }
    if (focus === null) return;
    this.scrollToTop();
    const title = focus === 'step' ? this.stepTitle() : this.dialogTitle();
    title?.nativeElement.focus({ preventScroll: true });
  }

  /** Title of the rendered step, shown as the dialog's h2. */
  get stepTitleText(): string {
    return getStepInfo(this.currentStepId).title;
  }

  // ── A4: Undo/Redo ─────────────────────────────────────────────────────────

  undo(): void {
    const info = this.preprocessingService.undo();
    if (info) {
      this.showHistoryHint(info, 'undone');
    }
  }

  redo(): void {
    const info = this.preprocessingService.redo();
    if (info) {
      this.showHistoryHint(info, 'redone');
    }
  }

  /**
   * A4: shows a subtle, non-stacking hint in the navigation bar that names the
   * setting that changed (e.g. "Column selection undone"); a timer hides it again.
   */
  private showHistoryHint(info: UndoRedoInfo, verb: 'undone' | 'redone'): void {
    this.historyHint = {
      message: `${info.settingLabel} ${verb}`,
      step: info.step,
      anchorId: info.anchorId,
    };
    this.announcer.announce(this.historyHint.message);
    if (this.historyHintTimer) {
      clearTimeout(this.historyHintTimer);
    }
    this.historyHintTimer = setTimeout(() => {
      this.historyHint = null;
      this.historyHintTimer = null;
    }, this.HISTORY_HINT_MS);
  }

  /** Deep-link from the hint to the changed setting, then dismiss the hint. */
  showHistoryChange(): void {
    const hint = this.historyHint;
    if (hint && hint.step !== null && hint.anchorId) {
      this.preprocessingService.goToStepWithScroll(hint.step, hint.anchorId);
    }
    this.dismissHistoryHint();
  }

  private dismissHistoryHint(): void {
    this.historyHint = null;
    if (this.historyHintTimer) {
      clearTimeout(this.historyHintTimer);
      this.historyHintTimer = null;
    }
  }

  // Undo/redo is locked while processing: restoring a snapshot mid-run would
  // rebuild (and thereby abort) the running step.
  get undoDisabled(): boolean {
    return !this.history.canUndo || this.isProcessing;
  }

  get redoDisabled(): boolean {
    return !this.history.canRedo || this.isProcessing;
  }

  get undoTooltip(): string {
    return this.history.canUndo && this.history.undoLabel
      ? `Undo: ${this.history.undoLabel} (Ctrl+Z)`
      : 'Nothing to undo';
  }

  get redoTooltip(): string {
    return this.history.canRedo && this.history.redoLabel
      ? `Redo: ${this.history.redoLabel} (Ctrl+Shift+Z)`
      : 'Nothing to redo';
  }

  /** Id of the rendered step, derived from the numeric index kept in state. */
  get currentStepId(): WizardStepId {
    return stepIdAt(this.currentStep) ?? 'upload';
  }

  /**
   * Wizard keyboard handling while the dialog is open: Tab/Shift+Tab stay inside
   * the dialog, Escape closes it, and the undo/redo shortcuts. Everything is left
   * to the native Start-over dialog while that one is open (Escape cancels it).
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isStartOverOpen) return;
    if (event.key === 'Tab') {
      const root = this.dialogRoot()?.nativeElement;
      if (root) wrapTabFocus(event, root);
      return;
    }
    if (event.key === 'Escape') {
      this.onEscape(event);
      return;
    }
    this.onHistoryShortcut(event);
  }

  /**
   * Escape closes the wizard — unless the key already closed a popup (help
   * tooltip, preview, dropdown) or another handler consumed it.
   */
  private onEscape(event: KeyboardEvent): void {
    const popupWasOpen = this.popupOpenAtEscape;
    this.popupOpenAtEscape = false;
    if (event.defaultPrevented || popupWasOpen) return;
    event.preventDefault();
    this.closeWizard();
  }

  // Window capture runs before the popup coordinator's document-capture listener
  // closes the popup, so this still sees whether one was open.
  private readonly captureEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.popupOpenAtEscape = this.dialogRoot()?.nativeElement.querySelector(OPEN_POPUP_SELECTOR) != null;
    }
  };

  /**
   * Ctrl+Z = undo, Ctrl+Shift+Z (or Ctrl+Y) = redo. When focus is inside a text
   * input/textarea/contenteditable we do nothing and let the browser's native
   * field-level undo run instead. Ignored while processing.
   */
  private onHistoryShortcut(event: KeyboardEvent): void {
    const ctrl = event.ctrlKey || event.metaKey;
    if (!ctrl) return;

    const key = event.key.toLowerCase();
    const isUndo = key === 'z' && !event.shiftKey;
    const isRedo = (key === 'z' && event.shiftKey) || key === 'y';
    if (!isUndo && !isRedo) return;

    if (this.isEditableTarget(event.target) || this.isProcessing) return;

    event.preventDefault();
    if (isRedo) {
      this.redo();
    } else {
      this.undo();
    }
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  private reloadCurrentStep(): void {
    this.stepVisible = false;
    this.clearTimer(this.reloadStepTimer);
    this.reloadStepTimer = setTimeout(() => {
      this.reloadStepTimer = null;
      this.stepVisible = true;
    }, 0);
  }

  /** Runs after the new step has rendered (see reveal()). */
  private scrollToTop(): void {
    // Scroll the wizard content container to top
    if (this.wizardContent?.nativeElement) {
      this.wizardContent.nativeElement.scrollTop = 0;
    }
    // Also scroll the window/document in case wizard is in a scrollable container
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  private clearTimer(timer: ReturnType<typeof setTimeout> | null): void {
    if (timer !== null) {
      clearTimeout(timer);
    }
  }

  private get stepContainer(): HTMLElement | null {
    return this.wizardContent?.nativeElement?.querySelector('.step-container') ?? null;
  }

  /**
   * A14: Central handler for the primary "continue" button. For the columns ->
   * features transition (with motion enabled) it first collapses the column
   * table down to the rail width (Phase 1) and only then advances the wizard, so
   * the swap happens while both steps share the same narrow geometry. Every
   * other step proceeds immediately. A repeated click while the collapse runs is
   * ignored.
   */
  onProceed(step: WizardStep): void {
    if (this.currentStepId === 'columns' && !this.reduceMotion) {
      if (this.morphAnimations.length === 0) {
        this.collapseStep2Then(() => step.proceed());
      }
      return;
    }
    step.proceed();
  }

  /**
   * A14 Phase 1: collapse Step 2 on the *live* table (before the component swap).
   * The only motion is horizontal: the table narrows from full width to the rail
   * width, clipping the stat columns off the right edge (overflow hidden). Step 2
   * stays fully opaque the whole time (no fade), so there is no transparent frame.
   * On completion we swap to Step 3 and start Phase 2 synchronously.
   */
  private collapseStep2Then(proceed: () => void): void {
    const table = this.stepContainer?.querySelector<HTMLElement>('.columns-table-container');
    if (!table) {
      proceed();
      return;
    }

    const coverWidth = Math.max(0, table.getBoundingClientRect().width - WIZARD_RAIL_WIDTH);

    // A grey panel (same tone as Step 3's detail well) slides in from the right
    // over the stat columns. Using a translated overlay means the collapse is a
    // pure transform (GPU-composited) — the table itself never re-lays-out, so no
    // per-frame reflow / lag (unlike animating width or padding). The overlay is
    // part of the doomed Step 2 DOM, so it needs no cleanup after the swap.
    // Look and stacking of the cover (and the clipping of the table) live in the
    // shell SCSS (.wizard-morph-collapsing / .wizard-morph-cover); only the width
    // depends on the live table.
    table.classList.add('wizard-morph-collapsing');
    const cover = document.createElement('div');
    cover.className = 'wizard-morph-cover';
    cover.style.width = `${coverWidth}px`;
    table.appendChild(cover);

    // Slide the grey panel from fully off to the right (revealing nothing) to
    // covering the stat columns down to the rail width -> one directed
    // right-to-left wave, matching where the detail well then slides in. The
    // panel's untransformed resting state equals the end state, so nothing needs
    // to persist after the animation.
    const collapse = this.startMorph(
      cover,
      [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
      0.6,
      EASE_POWER2_IN_OUT
    );
    collapse.onfinish = () => {
      // Never advance after the shell is gone or once the user has left the
      // column step by other means (e.g. the stepper) while the collapse ran.
      if (this.destroyed || this.currentStepId !== 'columns') {
        return;
      }
      // Swap to Step 3, force Angular to render it into the DOM *now*, then set
      // up the entrance synchronously. Animation events are dispatched in the
      // frame's "update animations" step, before style/layout/paint, so Step 3's
      // start state is applied before its first paint.
      proceed();
      this.cdr.detectChanges();
      this.animateStep3Entrance();
    };
  }

  /**
   * A14 Phase 2: Step 3 appears fully opaque immediately (NO opacity fade) so
   * there is never a transparent/white frame during the component swap. The only
   * entrance motion is the detail well sliding in from the right; its start state
   * is applied synchronously (right after detectChanges, before the browser
   * paints) so there is no one-frame flash of it at its final position.
   */
  private animateStep3Entrance(): void {
    const container = this.stepContainer;
    if (!container) {
      return;
    }

    // Rail header (search + type filter) slides down from above into its slot,
    // instead of just appearing. It starts translated fully up (clipped by the
    // config-shell's overflow:hidden) so it emerges from the top edge. Transform
    // only -> smooth. No transform may remain once it ends: any element with a
    // transform becomes the containing block for its position:fixed descendants,
    // which would make the fixed help tooltips inside .detail-well position
    // relative to the well (drifting into a corner) instead of the viewport.
    // startMorph() never fills forwards, so the transform is gone on completion.
    const railHeader = container.querySelector<HTMLElement>('.rail-header');
    if (railHeader) {
      this.startMorph(
        railHeader,
        [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
        0.5,
        EASE_POWER2_OUT
      );
    }

    // The detail/config well slides in from the right as one block.
    const well = container.querySelector<HTMLElement>('.detail-well');
    if (well) {
      this.startMorph(well, [{ transform: 'translateX(40%)' }, { transform: 'translateX(0)' }], 0.6, EASE_POWER2_OUT);
    }
  }

  /**
   * Start one morph animation and track it until it ends, so ngOnDestroy can
   * cancel it. `fill: 'backwards'` applies the first keyframe immediately (on the
   * next style recalc, before paint); there is no forwards fill, so no transform
   * is left behind on the element once the animation has finished.
   */
  private startMorph(element: HTMLElement, keyframes: Keyframe[], seconds: number, easing: string): Animation {
    const animation = element.animate(keyframes, { duration: morphDuration(seconds), easing, fill: 'backwards' });
    this.morphAnimations = [...this.morphAnimations, animation];
    animation.addEventListener('finish', () => {
      this.morphAnimations = this.morphAnimations.filter(running => running !== animation);
    });
    return animation;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subscription.unsubscribe();
    this.clearTimer(this.historyHintTimer);
    this.clearTimer(this.reloadStepTimer);
    this.revealRef?.destroy();
    this.revealRef = null;
    window.removeEventListener('keydown', this.captureEscape, true);
    this.morphAnimations.forEach(animation => animation.cancel());
    this.morphAnimations = [];
  }

  private updateStepCompletion(state: PreprocessingState): void {
    const summaries = stepSummaries(state);
    this.steps = WIZARD_STEPS.map((info, index) => ({
      ...this.steps[index],
      completed: this.isStepCompleted(info.id, state),
      summary: summaries[info.id],
    }));
  }

  /**
   * A step counts as completed when its required data exists, or once the user
   * has moved past it (highestStepVisited). Review completes with processing.
   */
  isStepCompleted(id: WizardStepId, state: PreprocessingState): boolean {
    const visitedBeyond = this.highestStepVisited > stepIndex(id);
    switch (id) {
      case 'upload':
        return state.dataProfile !== null;
      case 'columns':
        return state.columnConfigs.size > 0 && visitedBeyond;
      case 'review':
        return state.processedDataset !== null;
      default:
        return visitedBeyond;
    }
  }

  /** The stepper reports a position; navigation itself goes by step id. */
  onStepClick(index: number): void {
    const id = stepIdAt(index);
    if (id) {
      this.preprocessingService.goToStep(id);
    }
  }

  previousStep(): void {
    this.preprocessingService.previousStep();
  }

  /** Title-bar "Start over": asks for confirmation in a modal native dialog. */
  reset(): void {
    const dialog = this.startOverDialog()?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  get isStartOverOpen(): boolean {
    return this.startOverDialog()?.nativeElement.open ?? false;
  }

  /**
   * Closes the Start-over dialog (the browser returns focus to the title-bar
   * button) and clears the wizard only when confirmed.
   */
  closeStartOver(confirmed: boolean): void {
    this.startOverDialog()?.nativeElement.close();
    if (confirmed) {
      this.highestStepVisited = 0; // Reset navigation tracking
      this.preprocessingService.resetState();
    }
  }

  closeWizard(): void {
    this.wizardClose.emit();
  }

  onWizardComplete(): void {
    this.wizardClose.emit();
  }
}
