import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step4ProjectionSettingsComponent } from './step4-projection-settings.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DEFAULT_PROJECTION_CONFIG, PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierMethod,
  OutlierStrategy,
  ScalingMethod,
} from '../../models/data-type.enum';
import { createTestPreprocessingService } from '../../testing/preprocessing-test-helpers';

const NAMES = ['x', 'y'];

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

function makeColumn(name: string): ColumnStatistics {
  return { name, dataType: DataType.Numeric, count: 100, missingCount: 0, missingPercentage: 0, uniqueCount: 50 };
}

function makeProfile(): DataProfile {
  return {
    totalRows: 100,
    totalColumns: NAMES.length,
    fileSize: 1000,
    fileName: 'test.csv',
    columns: NAMES.map(makeColumn),
    qualityScore: 90,
    duplicateCount: 0,
    previewRows: [],
  };
}

/**
 * Step 4 template: the method card's checkbox is its single keyboard control,
 * every slider is named per method, collapsed parameter panels are inert, and
 * the parameter thumbnails highlight the one nearest to the current value.
 */
describe('Step4ProjectionSettingsComponent – accessibility', () => {
  let fixture: ComponentFixture<Step4ProjectionSettingsComponent>;
  let host: HTMLElement;
  let service: PreprocessingService;

  const undoDepth = (): number => (service as unknown as { undoStack: unknown[] }).undoStack.length;

  beforeEach(async () => {
    localStorage.clear();
    service = createTestPreprocessingService();
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      rawFileName: 'test.csv',
      dataProfile: makeProfile(),
      columnConfigs: new Map(NAMES.map(name => [name, makeConfig(name)])),
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
    fixture = TestBed.createComponent(Step4ProjectionSettingsComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  function el<T extends Element>(selector: string, root: ParentNode = host): T {
    const found = root.querySelector<T>(selector);
    if (!found) throw new Error(`${selector} not rendered`);
    return found;
  }

  const umapCard = (): HTMLElement =>
    el<HTMLInputElement>('#step4-method-enableUMAP').closest('.projection-card') as HTMLElement;
  const umapEnabled = (): boolean => service.currentState.projectionConfig.enableUMAP;
  const paramsButton = (): HTMLButtonElement => el('.btn-expand-params', umapCard());

  function expandUmapParams(): void {
    paramsButton().click();
    fixture.detectChanges();
  }

  describe('method card keyboard and pointer behaviour', () => {
    it('has no focusable card wrapper: the checkbox is the only keyboard control', () => {
      host.querySelectorAll('.projection-card').forEach(card => {
        expect(card.hasAttribute('tabindex')).toBe(false);
      });
    });

    it('Enter on "Configure parameters" does not switch the method off', () => {
      paramsButton().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      paramsButton().click(); // what the browser does for Enter on a button
      fixture.detectChanges();

      expect(umapEnabled()).toBe(true);
      expect(paramsButton().getAttribute('aria-expanded')).toBe('true');
    });

    it('clicking the checkbox toggles the method exactly once', () => {
      const before = undoDepth();
      el<HTMLInputElement>('#step4-method-enableUMAP').click();
      fixture.detectChanges();

      expect(umapEnabled()).toBe(false);
      expect(undoDepth()).toBe(before + 1);
    });

    it('clicking the method name toggles the method exactly once', () => {
      const before = undoDepth();
      el<HTMLElement>('.card-toggle .method-name', umapCard()).click();
      fixture.detectChanges();

      expect(umapEnabled()).toBe(false);
      expect(undoDepth()).toBe(before + 1);
    });

    it('clicking the description toggles the method exactly once', () => {
      const before = undoDepth();
      el<HTMLElement>('.card-desc', umapCard()).click();
      fixture.detectChanges();

      expect(umapEnabled()).toBe(false);
      expect(undoDepth()).toBe(before + 1);
    });

    it('clicking inside the expanded parameter panel does not toggle the method', () => {
      expandUmapParams();
      el<HTMLElement>('.inline-params', umapCard()).click();
      el<HTMLElement>('#step4-param-umapNeighbors').click();

      expect(umapEnabled()).toBe(true);
    });
  });

  describe('names, descriptions and state', () => {
    it('describes the enable checkbox with the badge, size hint and description', () => {
      const ids = (el('#step4-method-enableUMAP').getAttribute('aria-describedby') ?? '').split(' ');
      const text = ids.map(id => el(`#${id}`).textContent?.trim()).join(' | ');
      expect(text).toBe('Slow | up to 100K rows | Balances local and global structure');
    });

    it('links the parameter button to its panel, which is inert while collapsed', () => {
      const button = paramsButton();
      const panel = el<HTMLElement>(`#${button.getAttribute('aria-controls')}`);
      expect(button.getAttribute('aria-label')).toBe('Configure UMAP parameters');
      expect(panel.hasAttribute('inert')).toBe(true);

      expandUmapParams();
      expect(panel.hasAttribute('inert')).toBe(false);
    });

    it('names each slider and number field after its parameter and method', () => {
      const range = el<HTMLInputElement>('#step4-param-umapNeighbors');
      const number = el<HTMLInputElement>('input[type="number"]', range.parentElement ?? host);
      expect(range.getAttribute('aria-label')).toBe('Number of Neighbors for UMAP');
      expect(number.getAttribute('aria-label')).toBe('Number of Neighbors for UMAP');
    });

    it('keeps help tooltips out of labels', () => {
      expect(host.querySelectorAll('app-help-tooltip').length).toBeGreaterThan(0);
      expect(host.querySelectorAll('label app-help-tooltip').length).toBe(0);
    });

    it('names the two panels by their heading text only, not the help button in the heading', () => {
      const labels = Array.from(host.querySelectorAll('section[aria-labelledby]')).map(section =>
        el(`#${section.getAttribute('aria-labelledby')}`)
      );
      expect(labels.map(label => label.textContent?.trim())).toEqual(['Projection Columns', 'Projection Methods']);
      labels.forEach(label => expect(label.querySelector('app-help-tooltip')).toBeNull());
    });

    it('keeps the column details button out of the checkbox label', () => {
      expect(host.querySelectorAll('label button').length).toBe(0);
      const details = el<HTMLButtonElement>('.btn-details-toggle');
      details.click();
      fixture.detectChanges();
      expect(el(`#${details.getAttribute('aria-controls')}`).textContent).toContain('Encoding');
    });

    it('hides every Material icon ligature from assistive technology', () => {
      host.querySelectorAll('.material-icons').forEach(icon => {
        expect(icon.getAttribute('aria-hidden'), icon.outerHTML).toBe('true');
      });
    });
  });
});
