import { ApplicationRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreprocessingWizardComponent } from './preprocessing-wizard.component';
import { PreprocessingService } from './services/preprocessing.service';
import { PreprocessingState } from './models/preprocessing-state';
import { ColumnConfig } from './models/column-config';
import { ColumnStatistics, DataProfile } from './models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
} from './models/data-type.enum';
import { WizardAnnouncer } from './shared/wizard-announcer.service';
import { tabbableEdges } from './shared/dialog-focus';
import { ProgressStepperComponent } from './shared/progress-stepper/progress-stepper.component';
import { Step1UploadComponent } from './steps/step1-upload/step1-upload.component';
import { Step2ColumnSelectionComponent } from './steps/step2-column-selection/step2-column-selection.component';
import { createTestPreprocessingService } from './testing/preprocessing-test-helpers';

/**
 * Rendered shell: dialog semantics, focus management, the Escape key, the focus
 * trap and the Start-over confirmation. Only the steps needed here are imported
 * (other step elements are ignored via NO_ERRORS_SCHEMA).
 */
describe('PreprocessingWizardComponent – dialog and focus (rendered)', () => {
  let service: PreprocessingService;
  let fixture: ComponentFixture<PreprocessingWizardComponent> | null = null;
  let el: HTMLElement;

  function query<T extends HTMLElement>(selector: string): T {
    const found = el.querySelector<T>(selector);
    if (!found) throw new Error(`${selector} not rendered`);
    return found;
  }

  function shell(): ComponentFixture<PreprocessingWizardComponent> {
    if (!fixture) throw new Error('wizard not opened');
    return fixture;
  }

  /** Renders, lets pending async work settle and runs the after-render hooks. */
  async function settle(): Promise<void> {
    shell().detectChanges();
    await shell().whenStable();
    TestBed.inject(ApplicationRef).tick();
  }

  async function open(): Promise<void> {
    fixture = TestBed.createComponent(PreprocessingWizardComponent);
    el = fixture.nativeElement as HTMLElement;
    await settle();
  }

  function keydown(target: EventTarget, key: string, shiftKey = false): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  function stepTitleText(): string {
    return (query('h2.step-title').textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  /** A loaded single-column dataset, so Step 2 can render. */
  function seedProfile(): void {
    const column: ColumnStatistics = {
      name: 'alpha',
      dataType: DataType.Numeric,
      count: 10,
      missingCount: 0,
      missingPercentage: 0,
      uniqueCount: 10,
    };
    const config: ColumnConfig = {
      name: 'alpha',
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
    const dataProfile: DataProfile = {
      fileName: 'alpha.csv',
      fileSize: 100,
      totalRows: 10,
      totalColumns: 1,
      columns: [column],
      qualityScore: 100,
      duplicateCount: 0,
      previewRows: [],
    };
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      dataProfile,
      columnConfigs: new Map([['alpha', config]]),
    });
  }

  beforeEach(async () => {
    localStorage.clear();
    service = createTestPreprocessingService();
    await TestBed.configureTestingModule({
      imports: [PreprocessingWizardComponent],
      providers: [{ provide: PreprocessingService, useValue: service }],
    })
      .overrideComponent(PreprocessingWizardComponent, {
        set: {
          imports: [ProgressStepperComponent, Step1UploadComponent, Step2ColumnSelectionComponent],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = null;
    localStorage.clear();
  });

  it('is a modal dialog labelled by its h1', async () => {
    await open();
    const root = query('.preprocessing-wizard');
    expect(root.getAttribute('role')).toBe('dialog');
    expect(root.getAttribute('aria-modal')).toBe('true');
    const label = document.getElementById(root.getAttribute('aria-labelledby') ?? '');
    expect(label?.tagName).toBe('H1');
    expect(label?.textContent?.trim()).toBe('Data Preprocessing Wizard');
  });

  it('moves focus onto the dialog title when it opens', async () => {
    await open();
    expect(document.activeElement).toBe(query('h1'));
  });

  it('shows the current step as an h2 and renders two always-present live regions', async () => {
    await open();
    expect(stepTitleText()).toBe('Step 1 of 6: Upload Data');
    expect(query('[aria-live="polite"]').getAttribute('aria-atomic')).toBe('true');
    expect(query('[aria-live="assertive"]').getAttribute('aria-atomic')).toBe('true');
  });

  it('renders WizardAnnouncer messages into the polite live region', async () => {
    await open();
    TestBed.inject(WizardAnnouncer).announce('Hello there');
    await Promise.resolve();
    shell().detectChanges();
    expect(query('[aria-live="polite"]').textContent?.trim()).toBe('Hello there');
  });

  it('moves focus to the step title after a step change', async () => {
    seedProfile();
    await open();

    service.goToStep('columns');
    await settle();

    expect(document.activeElement).toBe(query('h2.step-title'));
    expect(stepTitleText()).toBe('Step 2 of 6: Select Columns');
  });

  it('moves focus to the deep-link anchor after goToStepWithScroll', async () => {
    seedProfile();
    await open();

    service.goToStepWithScroll('columns', 'wizard-anchor-columns');
    await Promise.resolve();
    await settle();

    const anchor = query('#wizard-anchor-columns');
    expect(document.activeElement).toBe(anchor);
    expect(anchor.getAttribute('tabindex')).toBe('-1');
  });

  it('closes on Escape', async () => {
    await open();
    const closed = vi.spyOn(shell().componentInstance.wizardClose, 'emit').mockImplementation(() => undefined);
    keydown(query('h1'), 'Escape');
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('lets the first Escape close an open help tooltip only', async () => {
    await open();
    const closed = vi.spyOn(shell().componentInstance.wizardClose, 'emit').mockImplementation(() => undefined);
    const help = query<HTMLButtonElement>('.requirements .help-icon');
    help.click();
    shell().detectChanges();
    expect(help.getAttribute('aria-expanded')).toBe('true');

    keydown(help, 'Escape');
    shell().detectChanges();
    expect(closed).not.toHaveBeenCalled();
    expect(help.getAttribute('aria-expanded')).toBe('false');

    keydown(help, 'Escape');
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('keeps Tab inside the dialog (last -> first, first -> last)', async () => {
    await open();
    const edges = tabbableEdges(query('.preprocessing-wizard'));
    if (!edges) throw new Error('no tabbable elements');

    edges.last.focus();
    expect(keydown(edges.last, 'Tab').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(edges.first);

    keydown(edges.first, 'Tab', true);
    expect(document.activeElement).toBe(edges.last);
  });

  describe('Start over', () => {
    let dialog: HTMLDialogElement;

    beforeEach(async () => {
      await open();
      dialog = query<HTMLDialogElement>('dialog.confirm-dialog');
    });

    afterEach(() => {
      if (dialog.open) dialog.close();
    });

    function openStartOver(): void {
      query<HTMLButtonElement>('button[aria-label="Start over"]').click();
      shell().detectChanges();
    }

    it('asks in a modal dialog instead of window.confirm, with Cancel focused', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      openStartOver();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(dialog.open).toBe(true);
      expect(query('#start-over-title').textContent?.trim()).toBe('Start over?');
      expect(dialog.textContent).toContain('This clears the uploaded file and all settings.');
      expect(document.activeElement?.textContent?.trim()).toBe('Cancel');
    });

    it('Cancel closes the dialog and keeps everything', () => {
      const resetSpy = vi.spyOn(service, 'resetState').mockImplementation(() => undefined);
      openStartOver();

      query<HTMLButtonElement>('.confirm-actions .btn-secondary').click();

      expect(dialog.open).toBe(false);
      expect(resetSpy).not.toHaveBeenCalled();
    });

    it('"Start over" clears the wizard', () => {
      const resetSpy = vi.spyOn(service, 'resetState').mockImplementation(() => undefined);
      openStartOver();

      query<HTMLButtonElement>('.confirm-actions .btn-danger').click();

      expect(dialog.open).toBe(false);
      expect(resetSpy).toHaveBeenCalledTimes(1);
    });

    it('leaves Escape to the open dialog (the wizard stays open)', () => {
      const closed = vi.spyOn(shell().componentInstance.wizardClose, 'emit').mockImplementation(() => undefined);
      openStartOver();

      keydown(query('.confirm-actions .btn-secondary'), 'Escape');

      expect(closed).not.toHaveBeenCalled();
    });
  });
});
