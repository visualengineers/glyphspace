import { ChangeDetectorRef, Component, OnInit, forwardRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { WizardStep, WIZARD_STEP } from '../../shared/wizard-step';
import { WizardAnnouncer } from '../../shared/wizard-announcer.service';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataType } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { ColorScale, buildGroupedColorScales, getColorScaleById } from '../../../shared/interfaces/color-scale';
import { ColorScaleSelectorComponent } from '../../../shared/components/color-scale-selector/color-scale-selector.component';
import { ToastService } from '../../../services/toast.service';
import { GlyphPreview, PREVIEW_CENTER, PREVIEW_RADIUS, buildGlyphPreview } from './glyph-preview-geometry';

export const MIN_GLYPH_FEATURES = 3;
export const MAX_GLYPH_FEATURES = 12;
/** How many top-scored features the smart suggestion picks. */
const SUGGESTED_FEATURE_COUNT = 5;
/** Upper bound of distinct values for a categorical column to make a legible default color. */
const MAX_DEFAULT_COLOR_CATEGORIES = 12;

type FeatureList = 'selected' | 'available';
export type MoveDirection = 'up' | 'down';

/**
 * Step 5 – Glyphs & Color: color attribute + scale and the ordered glyph
 * features. This only configures the dashboard's initial view (it is written
 * into the schema's default context), so the step prefills recommended features
 * and lets the user continue as soon as the glyph selection is valid.
 */
@Component({
  selector: 'app-step5-glyph-color-settings',
  standalone: true,
  imports: [FormsModule, HelpTooltipComponent, ColorScaleSelectorComponent],
  templateUrl: './step5-glyph-color-settings.component.html',
  styleUrl: './step5-glyph-color-settings.component.scss',
  providers: [{ provide: WIZARD_STEP, useExisting: forwardRef(() => Step5GlyphColorSettingsComponent) }],
})
export class Step5GlyphColorSettingsComponent implements OnInit, WizardStep {
  readonly primaryLabel = 'Continue to Review';
  readonly disabledHint = `Select ${MIN_GLYPH_FEATURES}–${MAX_GLYPH_FEATURES} glyph features to continue.`;

  // Color feature selection
  columns: ColumnStatistics[] = [];
  colorFeature: string | null = null;
  selectedColorScaleId = 0;
  groupedColorScales: { group: string; scales: ColorScale[] }[] = [];

  // Glyph feature mapping
  availableFeatures: string[] = [];
  selectedGlyphFeatures: string[] = [];
  suggestedFeatures: string[] = [];
  featureVariances = new Map<string, number>();
  readonly MIN_GLYPH_FEATURES = MIN_GLYPH_FEATURES;
  readonly MAX_GLYPH_FEATURES = MAX_GLYPH_FEATURES;
  draggedFeature: string | null = null;
  draggedFromList: FeatureList = 'available';
  draggedIndex = -1;
  // Index of the selected row currently under the drag cursor (insertion highlight).
  dragOverIndex = -1;

  // Search + type filter for the AVAILABLE feature list.
  featureSearch = '';
  featureTypeFilter: DataType | 'all' = 'all';
  readonly DataType = DataType;

  // Glyph preview
  selectedGlyphType: 'star' | 'flower' | 'whisker' = 'star';
  preview: GlyphPreview = buildGlyphPreview([]);
  readonly PREVIEW_RADIUS = PREVIEW_RADIUS;
  readonly PREVIEW_CENTER = PREVIEW_CENTER;

  readonly HELP_TEXT = HELP_TEXT;

  // A4: guards the history pushes so writes during the initial load (the
  // prefill and the default color) do not create undo entries. Flipped true once
  // the step has finished loading.
  private historyReady = false;

  constructor(
    public preprocessingService: PreprocessingService,
    private toastService: ToastService,
    private announcer: WizardAnnouncer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;
    this.columns = (state.dataProfile?.columns ?? []).filter(col => state.columnConfigs.get(col.name)?.enabled);

    this.initColorFeature();
    this.groupedColorScales = buildGroupedColorScales();

    this.updateAvailableFeatures();
    this.calculateSmartSuggestions();
    // Prefill: an empty (or too small) selection gets the recommended features.
    // historyReady is still false, so this records no undo entry.
    if (state.glyphFeatures.length >= MIN_GLYPH_FEATURES) {
      this.selectedGlyphFeatures = [...state.glyphFeatures];
      this.regeneratePreviewData();
    } else {
      this.applySuggestedFeatures();
    }

    this.historyReady = true;
  }

  // ============================================================================
  // Color Feature Selection
  // ============================================================================

  /** Adopt the stored color attribute, or assign a smart default (no undo entry). */
  private initColorFeature(): void {
    const stored = Array.from(this.preprocessingService.currentState.columnConfigs.values()).find(
      c => c.isColorFeature
    );
    this.colorFeature = stored?.name ?? this.pickDefaultColorFeature();
    if (!stored && this.colorFeature) {
      this.preprocessingService.setColorFeature(this.colorFeature);
    }
    // Read after setColorFeature, which may auto-switch the scale to match the type.
    this.selectedColorScaleId = this.preprocessingService.currentState.colorScaleId;
  }

  setColorFeature(columnName: string): void {
    // A4: record the color change so undo reverts the color feature (and any
    // auto-switched scale) as one action.
    if (this.historyReady) {
      this.preprocessingService.pushHistory('Color attribute changed');
    }
    this.colorFeature = columnName;
    this.preprocessingService.setColorFeature(columnName);
    // Sync selected scale ID after service auto-switches on type mismatch
    this.selectedColorScaleId = this.preprocessingService.currentState.colorScaleId;
  }

  /**
   * Smart default for the color attribute. Prefers a low-cardinality
   * categorical/boolean column (distinct, legible color groups), then falls
   * back to the numeric column with the most spread (a meaningful gradient),
   * and only as a last resort to the first column. Returns null if there are
   * no columns.
   */
  private pickDefaultColorFeature(): string | null {
    if (this.columns.length === 0) return null;

    const lowCardCategorical = this.columns
      .filter(
        c =>
          (c.dataType === DataType.Categorical || c.dataType === DataType.Boolean) &&
          c.uniqueCount >= 2 &&
          c.uniqueCount <= MAX_DEFAULT_COLOR_CATEGORIES
      )
      .sort((a, b) => a.uniqueCount - b.uniqueCount)[0];
    if (lowCardCategorical) return lowCardCategorical.name;

    const variance = (c: ColumnStatistics): number => c.variance ?? (c.stdDev ?? 0) ** 2;
    const numericBySpread = this.columns
      .filter(c => c.dataType === DataType.Numeric && variance(c) > 0)
      .sort((a, b) => variance(b) - variance(a))[0];
    if (numericBySpread) return numericBySpread.name;

    return this.columns[0].name;
  }

  getSelectedColorScale(): ColorScale {
    return getColorScaleById(this.selectedColorScaleId);
  }

  selectColorScale(id: number): void {
    // A4: same as the color feature — record so a scale change is undoable.
    if (this.historyReady) {
      this.preprocessingService.pushHistory('Color scale changed');
    }
    this.selectedColorScaleId = id;
    this.preprocessingService.setColorScaleId(id);
  }

  // ============================================================================
  // Glyph Feature Mapping
  // ============================================================================

  updateAvailableFeatures(): void {
    this.availableFeatures = this.preprocessingService.getPreviewFeatureNames();
  }

  /** Score features by relative spread and keep the top ones as suggestions. */
  calculateSmartSuggestions(): void {
    const profile = this.preprocessingService.currentState.dataProfile;
    if (!profile) return;

    const scores = this.availableFeatures.flatMap(feature => {
      const colStats = this.findColumnStats(feature);
      return colStats ? [{ name: feature, score: variationScore(colStats) }] : [];
    });

    this.featureVariances = new Map(scores.map(({ name, score }) => [name, score]));
    this.suggestedFeatures = [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, SUGGESTED_FEATURE_COUNT)
      .map(f => f.name);
  }

  suggestionsWouldChange(): boolean {
    if (this.suggestedFeatures.length === 0) return false;
    const target = this.suggestedFeatures.slice(0, SUGGESTED_FEATURE_COUNT);
    if (target.length !== this.selectedGlyphFeatures.length) return true;
    return !target.every((f, i) => f === this.selectedGlyphFeatures[i]);
  }

  /** Select the suggested features; returns the recorded undo entry id, or null. */
  applySuggestedFeatures(): number | null {
    if (this.suggestedFeatures.length === 0) {
      this.calculateSmartSuggestions();
    }
    const suggested = this.suggestedFeatures.slice(0, SUGGESTED_FEATURE_COUNT);
    // Top up to the minimum with other available features (never duplicates).
    const extras = this.availableFeatures.filter(feature => !suggested.includes(feature));
    const next = [...suggested, ...extras].slice(0, Math.max(suggested.length, MIN_GLYPH_FEATURES));
    return this.commitSelection(next);
  }

  /**
   * A4: user-triggered "apply recommended features" (Smart Defaults). Applies the
   * suggestions (which records a single history entry via saveGlyphFeatures) and
   * shows a confirmation toast whose undo reverts exactly that entry.
   */
  applySuggestedFeaturesByUser(): void {
    const entryId = this.applySuggestedFeatures();
    if (entryId !== null) {
      this.toastService.showUndo('Recommended features applied', () => this.preprocessingService.undoIfLatest(entryId));
    }
  }

  addGlyphFeature(feature: string): void {
    this.insertSelectedAt(feature, this.selectedGlyphFeatures.length);
  }

  removeGlyphFeature(index: number): void {
    // A glyph needs at least MIN_GLYPH_FEATURES rays. Removing below that is not a
    // persistable state (setGlyphFeatures rejects it), so block it here instead of
    // letting the local selection drift out of sync with the service and skipping
    // the history entry — that mismatch is what made undo restore several features.
    if (this.selectedGlyphFeatures.length <= MIN_GLYPH_FEATURES) {
      this.toastService.warning(`At least ${MIN_GLYPH_FEATURES} glyph features are required.`);
      return;
    }
    this.commitSelection(this.selectedGlyphFeatures.filter((_, i) => i !== index));
  }

  isFeatureSelected(feature: string): boolean {
    return this.selectedGlyphFeatures.includes(feature);
  }

  /** Data type of a feature, resolving one-hot columns (e.g. city_NYC → city). */
  getFeatureType(feature: string): DataType | null {
    return this.findColumnStats(feature)?.dataType ?? null;
  }

  /** Available features minus the already-selected ones, filtered by search + type. */
  get filteredAvailableFeatures(): string[] {
    const term = this.featureSearch.trim().toLowerCase();
    return this.availableFeatures.filter(feature => {
      if (this.isFeatureSelected(feature)) return false;
      if (term && !feature.toLowerCase().includes(term)) return false;
      return this.featureTypeFilter === 'all' || this.getFeatureType(feature) === this.featureTypeFilter;
    });
  }

  clearFeatureFilters(): void {
    this.featureSearch = '';
    this.featureTypeFilter = 'all';
  }

  getFeatureVariance(feature: string): number | null {
    return this.featureVariances.get(feature) ?? null;
  }

  getFeatureVariancePercent(feature: string): number {
    const val = this.featureVariances.get(feature);
    if (val === undefined) return 0;
    const maxVar = Math.max(...this.featureVariances.values());
    return maxVar > 0 ? (val / maxVar) * 100 : 0;
  }

  /** True while the glyph selection is in the valid 3–12 range. */
  get isGlyphSelectionValid(): boolean {
    const count = this.selectedGlyphFeatures.length;
    return count >= MIN_GLYPH_FEATURES && count <= MAX_GLYPH_FEATURES;
  }

  /**
   * Persist the local glyph selection. Returns the id of the recorded undo entry,
   * or null when nothing was recorded (invalid count or still loading).
   */
  saveGlyphFeatures(): number | null {
    if (!this.isGlyphSelectionValid) {
      return null;
    }
    // A4: every completed glyph edit (add/remove/reorder/apply-suggestions)
    // funnels through here, so a single history push covers them all. Snapshot
    // the state before the write so undo restores the previous feature set.
    const entryId = this.historyReady ? this.preprocessingService.pushHistory('Glyph features changed') : null;
    this.preprocessingService.setGlyphFeatures(this.selectedGlyphFeatures);
    return entryId;
  }

  /** Adopt a new selection, persist it (one undo entry) and refresh the preview. */
  private commitSelection(next: string[]): number | null {
    this.selectedGlyphFeatures = next;
    const entryId = this.saveGlyphFeatures();
    this.regeneratePreviewData();
    return entryId;
  }

  private findColumnStats(feature: string): ColumnStatistics | undefined {
    const columns = this.preprocessingService.currentState.dataProfile?.columns ?? [];
    // Exact match first, then the source column of a one-hot feature (city_NYC → city).
    return columns.find(c => c.name === feature) ?? columns.find(c => feature.startsWith(c.name + '_'));
  }

  // ============================================================================
  // Drag & Drop
  // ============================================================================

  onDragStart(event: DragEvent, feature: string, fromList: FeatureList, index: number): void {
    this.draggedFeature = feature;
    this.draggedFromList = fromList;
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', feature);
    }
  }

  onDragEnd(_event: DragEvent): void {
    this.draggedFeature = null;
    this.draggedFromList = 'available';
    this.draggedIndex = -1;
    this.dragOverIndex = -1;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /** Hovering a specific selected row while dragging — shows the insertion point. */
  onItemDragOver(event: DragEvent, index: number): void {
    event.stopPropagation();
    this.onDragOver(event);
    this.dragOverIndex = index;
  }

  /** Insert a feature into the selected list at a specific position. */
  private insertSelectedAt(feature: string, index: number): void {
    if (this.selectedGlyphFeatures.length >= MAX_GLYPH_FEATURES || this.isFeatureSelected(feature)) return;
    const at = Math.max(0, Math.min(index, this.selectedGlyphFeatures.length));
    this.commitSelection([
      ...this.selectedGlyphFeatures.slice(0, at),
      feature,
      ...this.selectedGlyphFeatures.slice(at),
    ]);
  }

  /** Move a selected feature to a new position (reordering — order drives the glyph). */
  private moveSelected(from: number, to: number): void {
    const current = this.selectedGlyphFeatures;
    if (from < 0 || from >= current.length) return;
    const target = Math.max(0, Math.min(to, current.length - 1));
    if (from === target) return;
    const rest = current.filter((_, i) => i !== from);
    this.commitSelection([...rest.slice(0, target), current[from], ...rest.slice(target)]);
  }

  /** Drop onto a specific selected row: reorder (from selected) or insert (from available). */
  onDropOnSelectedItem(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.draggedFeature && this.draggedFromList === 'selected') {
      this.moveSelected(this.draggedIndex, targetIndex);
    } else if (this.draggedFeature) {
      this.insertSelectedAt(this.draggedFeature, targetIndex);
    }
    this.onDragEnd(event);
  }

  /** Drop on the selected list background: append (available) or move to end (selected). */
  onDropInSelected(event: DragEvent): void {
    event.preventDefault();
    if (!this.draggedFeature) return;

    if (this.draggedFromList === 'available') {
      this.addGlyphFeature(this.draggedFeature);
    } else {
      this.moveSelected(this.draggedIndex, this.selectedGlyphFeatures.length - 1);
    }
    this.onDragEnd(event);
  }

  /** Drop a selected feature onto the available area to remove it from the glyph. */
  onDropInAvailable(event: DragEvent): void {
    event.preventDefault();
    if (this.draggedFeature && this.draggedFromList === 'selected') {
      const idx = this.selectedGlyphFeatures.indexOf(this.draggedFeature);
      if (idx !== -1) {
        this.removeGlyphFeature(idx);
      }
    }
    this.onDragEnd(event);
  }

  // ============================================================================
  // Keyboard / button alternatives to drag & drop (WCAG 2.1.1, 2.5.7)
  // ============================================================================

  moveButtonId(direction: MoveDirection, index: number): string {
    return `step5-move-${direction}-${index}`;
  }

  removeButtonId(index: number): string {
    return `step5-remove-${index}`;
  }

  availableButtonId(index: number): string {
    return `step5-available-${index}`;
  }

  /**
   * Move a selected feature one position up or down — one undo entry, like a
   * drag. Focus follows the feature to its new row; once it reaches an end, the
   * button that still works there (the other direction) takes focus.
   */
  moveGlyphFeature(index: number, direction: MoveDirection): void {
    const feature = this.selectedGlyphFeatures[index];
    const target = direction === 'up' ? index - 1 : index + 1;
    const total = this.selectedGlyphFeatures.length;
    if (feature === undefined || target < 0 || target >= total) return;

    this.moveSelected(index, target);
    this.announcer.announce(`${feature} moved to position ${target + 1} of ${total}.`);

    const atEnd = direction === 'up' ? target === 0 : target === total - 1;
    const opposite: MoveDirection = direction === 'up' ? 'down' : 'up';
    this.focusElement(this.moveButtonId(atEnd ? opposite : direction, target));
  }

  /** Add a feature from the available list; focus stays in that list. */
  addAvailableFeature(feature: string, index: number): void {
    if (this.selectedGlyphFeatures.length >= MAX_GLYPH_FEATURES) {
      this.toastService.warning(`A glyph takes at most ${MAX_GLYPH_FEATURES} features. Remove one first.`);
      return;
    }
    this.addGlyphFeature(feature);
    const total = this.selectedGlyphFeatures.length;
    this.announcer.announce(`${feature} added. ${total} glyph features selected.`);

    const remaining = this.filteredAvailableFeatures.length;
    this.focusElement(
      remaining > 0 ? this.availableButtonId(Math.min(index, remaining - 1)) : this.removeButtonId(total - 1)
    );
  }

  /** Remove a selected feature; focus moves to the row that takes its place. */
  removeSelectedFeature(index: number): void {
    const feature = this.selectedGlyphFeatures[index];
    const before = this.selectedGlyphFeatures.length;
    this.removeGlyphFeature(index);
    const total = this.selectedGlyphFeatures.length;
    // Blocked at the minimum: the warning toast explains why, focus stays put.
    if (feature === undefined || total === before) return;

    this.announcer.announce(`${feature} removed. ${total} glyph features selected.`);
    this.focusElement(this.removeButtonId(Math.min(index, total - 1)));
  }

  /** Render the new order first, then move focus (the pressed button may have moved or gone). */
  private focusElement(id: string): void {
    this.cdr.detectChanges();
    document.getElementById(id)?.focus();
  }

  // ============================================================================
  // Glyph Preview (SVG)
  // ============================================================================

  /** Text alternative of the preview: glyph type and its axes in order. */
  get previewDescription(): string {
    return `${this.selectedGlyphType} glyph preview with axes: ${this.selectedGlyphFeatures.join(', ')}`;
  }

  private regeneratePreviewData(): void {
    this.preview = buildGlyphPreview(this.selectedGlyphFeatures);
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  canProceed(): boolean {
    return this.isGlyphSelectionValid;
  }

  proceed(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
    }
  }
}

/** Relative spread of a column: coefficient of variation, else the share of unique values. */
function variationScore(stats: ColumnStatistics): number {
  if (stats.stdDev !== undefined && stats.mean !== undefined && Math.abs(stats.mean) > 0) {
    return stats.stdDev / Math.abs(stats.mean);
  }
  return stats.uniqueCount / stats.count;
}
