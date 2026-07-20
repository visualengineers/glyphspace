import { Component, OnInit, AfterViewInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { WizardStep, WIZARD_STEP } from '../../shared/wizard-step';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import {
  DataType,
  MissingValueStrategy,
  getEncodingLabel as encodingLabelFn,
  getScalingLabel as scalingLabelFn,
} from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';
import { COLOR_SCALES, ColorScale, buildGroupedColorScales } from '../../../shared/interfaces/color-scale';
import { ColorScaleSelectorComponent } from '../../../shared/components/color-scale-selector/color-scale-selector.component';
import { ToastService } from '../../../services/toast.service';

/** A dataset column paired with its live configuration, used for projection column selection. */
interface ProjectionColumnState {
  column: ColumnStatistics;
  config: ColumnConfig;
}

/** Describes a tunable parameter for a projection method. */
interface ProjectionParam {
  label: string;
  helpKey: string;
  configKey: keyof ProjectionConfig;
  min: number;
  max: number;
  step?: number;
  /** Default value used by the per-method "reset parameters" action. */
  default: number;
}

/**
 * UI configuration for a projection method.
 * Not to be confused with ProjectionMethod type from shared/types/projection.types.ts
 * which is the string union type for method identifiers.
 */
interface ProjectionMethodUI {
  key: keyof Pick<
    ProjectionConfig,
    | 'enablePCA'
    | 'enableIsoMap'
    | 'enableMDS'
    | 'enableLLE'
    | 'enableLTSA'
    | 'enableTSNE'
    | 'enableUMAP'
    | 'enableTriMap'
    | 'enableTopoMap'
    | 'enableSammon'
  >;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  sizeHint?: string;
  disabled?: boolean;
  largeDatasetWarning?: boolean;
  params?: ProjectionParam[];
}

@Component({
  selector: 'app-step4-visualization-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent, DataTypeBadgeComponent, ColorScaleSelectorComponent],
  templateUrl: './step4-visualization-settings.component.html',
  styleUrl: './step4-visualization-settings.component.scss',
  providers: [{ provide: WIZARD_STEP, useExisting: forwardRef(() => Step4VisualizationSettingsComponent) }],
})
export class Step4VisualizationSettingsComponent implements OnInit, AfterViewInit, WizardStep {
  readonly primaryLabel = 'Continue to Review';
  readonly disabledHint = 'Select at least one projection column and 3-12 glyph features to continue.';

  // Projection column selection (which features feed the dimensionality reduction)
  projectionColumns: ProjectionColumnState[] = [];

  // Search + type filter for the projection column list (mirrors the glyph feature filter).
  projectionColumnSearch = '';
  projectionColumnTypeFilter: DataType | 'all' = 'all';
  // Names of columns whose per-column details (encoding/scaling/missing) are expanded.
  private expandedProjectionDetails = new Set<string>();

  // Label helpers for the per-column details toggle.
  readonly getEncodingLabel = encodingLabelFn;
  readonly getScalingLabel = scalingLabelFn;

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
  readonly MIN_GLYPH_FEATURES = 3;
  readonly MAX_GLYPH_FEATURES = 12;
  draggedFeature: string | null = null;
  draggedFromList: 'selected' | 'available' = 'available';
  draggedIndex = -1;
  // Index of the selected row currently under the drag cursor (insertion highlight).
  dragOverIndex = -1;

  // Search + type filter for the AVAILABLE feature list.
  featureSearch = '';
  featureTypeFilter: DataType | 'all' = 'all';
  readonly DataType = DataType;

  // Glyph preview
  selectedGlyphType: 'star' | 'flower' | 'whisker' = 'star';
  glyphPreviewData = new Map<string, number>();
  readonly PREVIEW_RADIUS = 90;
  readonly PREVIEW_CENTER = 120;

  // Projection parameter visibility
  expandedMethodParams = new Set<string>();

  // Projection configuration (FastMap is always primary, these are background options)
  projectionConfig: ProjectionConfig = {
    enablePCA: true,
    enableIsoMap: true,
    enableMDS: false,
    enableLLE: false,
    enableLTSA: false,
    enableTSNE: false,
    enableUMAP: false,
    enableTriMap: false,
    enableTopoMap: false,
    enableSammon: false,
    isomapNeighbors: 0,
    lleNeighbors: 0,
    ltsaNeighbors: 0,
    tsnePerplexity: 30,
    tsneIterations: 1000,
    umapNeighbors: 15,
    umapMinDist: 0.1,
    trimapWeightAdj: 500,
  };

  readonly TSNE_WARNING_THRESHOLD = 5000;
  readonly LARGE_DATASET_THRESHOLD = 10000;

  // Sorted by speed (fastest first)
  projectionMethods: ProjectionMethodUI[] = [
    {
      key: 'enablePCA',
      name: 'PCA',
      description: 'Linear projection via eigendecomposition',
      icon: 'analytics',
      badge: 'Very Fast',
      sizeHint: 'any size',
    },
    {
      key: 'enableTriMap',
      name: 'TriMap',
      description: 'Global structure preservation',
      icon: 'timeline',
      badge: 'Fast',
      sizeHint: 'up to 100K rows',
      params: [
        {
          label: 'Weight Adjustment',
          helpKey: 'trimapWeightAdj',
          configKey: 'trimapWeightAdj',
          min: 100,
          max: 2000,
          step: 50,
          default: 500,
        },
      ],
    },
    {
      key: 'enableMDS',
      name: 'MDS',
      description: 'Classical Multidimensional Scaling — distance preserving',
      icon: 'grid_on',
      badge: 'Medium',
      sizeHint: 'up to 5K rows',
      largeDatasetWarning: true,
    },
    {
      key: 'enableIsoMap',
      name: 'IsoMap',
      description: 'Manifold learning — preserves geodesic distances',
      icon: 'auto_graph',
      badge: 'Medium',
      sizeHint: 'up to 5K rows',
      largeDatasetWarning: true,
      params: [
        {
          label: 'Neighbors (0 = auto)',
          helpKey: 'isomapNeighbors',
          configKey: 'isomapNeighbors',
          min: 0,
          max: 200,
          default: 0,
        },
      ],
    },
    {
      key: 'enableLLE',
      name: 'LLE',
      description: 'Locally Linear Embedding — preserves local geometry',
      icon: 'blur_on',
      badge: 'Medium',
      sizeHint: 'up to 30K rows',
      largeDatasetWarning: true,
      params: [
        {
          label: 'Neighbors (0 = auto)',
          helpKey: 'lleNeighbors',
          configKey: 'lleNeighbors',
          min: 0,
          max: 200,
          default: 0,
        },
      ],
    },
    {
      key: 'enableLTSA',
      name: 'LTSA',
      description: 'Local Tangent Space Alignment — curved manifolds',
      icon: 'waves',
      badge: 'Medium',
      sizeHint: 'up to 20K rows',
      largeDatasetWarning: true,
      params: [
        {
          label: 'Neighbors (0 = auto)',
          helpKey: 'ltsaNeighbors',
          configKey: 'ltsaNeighbors',
          min: 0,
          max: 200,
          default: 0,
        },
      ],
    },
    {
      key: 'enableTopoMap',
      name: 'TopoMap',
      description: 'Topology preserving via MST',
      icon: 'terrain',
      badge: 'Medium',
      sizeHint: 'up to 8K rows',
      largeDatasetWarning: true,
    },
    {
      key: 'enableUMAP',
      name: 'UMAP',
      description: 'Balances local and global structure',
      icon: 'scatter_plot',
      badge: 'Slow',
      sizeHint: 'up to 100K rows',
      largeDatasetWarning: true,
      params: [
        { label: 'Number of Neighbors', helpKey: 'umapNeighbors', configKey: 'umapNeighbors', min: 2, max: 200, default: 15 },
        {
          label: 'Minimum Distance',
          helpKey: 'umapMinDist',
          configKey: 'umapMinDist',
          min: 0,
          max: 0.99,
          step: 0.01,
          default: 0.1,
        },
      ],
    },
    {
      key: 'enableSammon',
      name: 'Sammon',
      description: 'Sammon mapping — preserves small distances',
      icon: 'hub',
      badge: 'Slow',
      sizeHint: 'up to 5K rows',
      largeDatasetWarning: true,
    },
    {
      key: 'enableTSNE',
      name: 't-SNE',
      description: 'Preserves local clusters',
      icon: 'bubble_chart',
      badge: 'Very Slow',
      sizeHint: 'up to 15K rows',
      largeDatasetWarning: true,
      params: [
        { label: 'Perplexity', helpKey: 'tsnePerplexity', configKey: 'tsnePerplexity', min: 5, max: 50, default: 30 },
        {
          label: 'Iterations',
          helpKey: 'tsneIterations',
          configKey: 'tsneIterations',
          min: 250,
          max: 5000,
          step: 250,
          default: 1000,
        },
      ],
    },
  ];

  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[3]; // Step 4 (index 3)

  // A4: guards the history push in saveGlyphFeatures so glyph writes during the
  // initial load (ngOnInit) do not create spurious undo entries. Flipped true once
  // the step has finished loading.
  private historyReady = false;

  constructor(
    public preprocessingService: PreprocessingService,
    private toastService: ToastService
  ) {}

  // A6: if the review step requested a jump to a specific setting, scroll its
  // anchor into view once this step has rendered. The delay lets the shell's
  // scroll-to-top run first so it does not override this.
  ngAfterViewInit(): void {
    const target = this.preprocessingService.consumeScrollTarget();
    if (target) {
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Load columns
    if (state.dataProfile) {
      this.columns = state.dataProfile.columns.filter(col => {
        const config = state.columnConfigs.get(col.name);
        return config && config.enabled;
      });

      // Build projection column selection from the enabled columns
      this.projectionColumns = this.columns
        .map(col => {
          const config = state.columnConfigs.get(col.name);
          return config ? { column: col, config } : null;
        })
        .filter((entry): entry is ProjectionColumnState => entry !== null);
    }

    // Load color feature and scale
    const colorCol = Array.from(state.columnConfigs.values()).find(c => c.isColorFeature);
    if (colorCol) {
      this.colorFeature = colorCol.name;
    } else if (this.columns.length > 0) {
      this.colorFeature = this.columns[0].name;
      this.preprocessingService.setColorFeature(this.columns[0].name);
    } else {
      this.colorFeature = null;
    }
    this.selectedColorScaleId = state.colorScaleId;
    this.groupedColorScales = buildGroupedColorScales();

    // Load glyph features
    this.updateAvailableFeatures();
    this.calculateSmartSuggestions();
    if (state.glyphFeatures.length >= this.MIN_GLYPH_FEATURES) {
      this.selectedGlyphFeatures = [...state.glyphFeatures];
    } else {
      this.applySuggestedFeatures();
    }

    this.regeneratePreviewData();

    // Load projection config
    if (state.projectionConfig) {
      this.projectionConfig = { ...state.projectionConfig };
    }

    // A4: from here on, glyph-feature writes are genuine user actions and should
    // be recorded on the undo stack.
    this.historyReady = true;
  }

  // ============================================================================
  // Color Feature Selection
  // ============================================================================

  setColorFeature(columnName: string): void {
    this.colorFeature = columnName;
    this.preprocessingService.setColorFeature(columnName);
    // Sync selected scale ID after service auto-switches on type mismatch
    this.selectedColorScaleId = this.preprocessingService.currentState.colorScaleId;
  }

  getSelectedColorScale(): ColorScale {
    return COLOR_SCALES.find(s => s.id === this.selectedColorScaleId) ?? COLOR_SCALES[0];
  }

  selectColorScale(id: number): void {
    this.selectedColorScaleId = id;
    this.preprocessingService.setColorScaleId(id);
  }

  // ============================================================================
  // Glyph Feature Mapping
  // ============================================================================

  updateAvailableFeatures(): void {
    this.availableFeatures = this.preprocessingService.getPreviewFeatureNames();
  }

  calculateSmartSuggestions(): void {
    const state = this.preprocessingService.currentState;
    const profile = state.dataProfile;
    if (!profile) return;

    const featureScores: { name: string; score: number }[] = [];

    for (const feature of this.availableFeatures) {
      // Try exact match first, then fall back to prefix match for one-hot encoded features (e.g. city_NYC → city)
      const colStats =
        profile.columns.find(c => c.name === feature) || profile.columns.find(c => feature.startsWith(c.name + '_'));
      if (!colStats) continue;

      let score = 0;
      if (colStats.stdDev !== undefined && colStats.mean !== undefined && Math.abs(colStats.mean) > 0) {
        // Coefficient of variation (scale-independent)
        score = colStats.stdDev / Math.abs(colStats.mean);
      } else if (colStats.dataType === DataType.Categorical || colStats.dataType === DataType.Boolean) {
        score = colStats.uniqueCount / colStats.count;
      } else {
        score = colStats.uniqueCount / colStats.count;
      }
      this.featureVariances.set(feature, score);

      featureScores.push({ name: feature, score });
    }

    featureScores.sort((a, b) => b.score - a.score);
    this.suggestedFeatures = featureScores.slice(0, Math.min(5, featureScores.length)).map(f => f.name);
  }

  suggestionsWouldChange(): boolean {
    if (this.suggestedFeatures.length === 0) return false;
    const target = this.suggestedFeatures.slice(0, 5);
    if (target.length !== this.selectedGlyphFeatures.length) return true;
    return !target.every((f, i) => f === this.selectedGlyphFeatures[i]);
  }

  applySuggestedFeatures(): void {
    if (this.suggestedFeatures.length === 0) {
      this.calculateSmartSuggestions();
    }

    this.selectedGlyphFeatures = [...this.suggestedFeatures.slice(0, 5)];

    while (this.selectedGlyphFeatures.length < this.MIN_GLYPH_FEATURES && this.availableFeatures.length > 0) {
      const cycleIndex = this.selectedGlyphFeatures.length % this.availableFeatures.length;
      const nextFeature = this.availableFeatures[cycleIndex];
      if (!this.selectedGlyphFeatures.includes(nextFeature)) {
        this.selectedGlyphFeatures.push(nextFeature);
      } else {
        this.selectedGlyphFeatures.push(nextFeature);
      }
    }

    this.saveGlyphFeatures();
    this.regeneratePreviewData();
  }

  addGlyphFeature(feature: string): void {
    if (this.selectedGlyphFeatures.length >= this.MAX_GLYPH_FEATURES) return;
    if (!this.isFeatureSelected(feature)) {
      this.selectedGlyphFeatures.push(feature);
      this.saveGlyphFeatures();
      this.regeneratePreviewData();
    }
  }

  removeGlyphFeature(index: number): void {
    this.selectedGlyphFeatures.splice(index, 1);
    this.saveGlyphFeatures();
    this.regeneratePreviewData();
  }

  isFeatureSelected(feature: string): boolean {
    return this.selectedGlyphFeatures.includes(feature);
  }

  /** Data type of a feature, resolving one-hot columns (e.g. city_NYC → city). */
  getFeatureType(feature: string): DataType | null {
    const profile = this.preprocessingService.currentState.dataProfile;
    if (!profile) return null;
    const col =
      profile.columns.find(c => c.name === feature) || profile.columns.find(c => feature.startsWith(c.name + '_'));
    return col ? col.dataType : null;
  }

  /** Available features minus the already-selected ones, filtered by search + type. */
  get filteredAvailableFeatures(): string[] {
    const term = this.featureSearch.trim().toLowerCase();
    return this.availableFeatures.filter(feature => {
      if (this.isFeatureSelected(feature)) return false;
      if (term && !feature.toLowerCase().includes(term)) return false;
      if (this.featureTypeFilter !== 'all' && this.getFeatureType(feature) !== this.featureTypeFilter) return false;
      return true;
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

  saveGlyphFeatures(): void {
    if (
      this.selectedGlyphFeatures.length >= this.MIN_GLYPH_FEATURES &&
      this.selectedGlyphFeatures.length <= this.MAX_GLYPH_FEATURES
    ) {
      // A4: every completed glyph edit (add/remove/reorder/apply-suggestions)
      // funnels through here, so a single history push covers them all. Snapshot
      // the state before the write so undo restores the previous feature set.
      if (this.historyReady) {
        this.preprocessingService.pushHistory('Glyph-Merkmale geändert');
      }
      this.preprocessingService.setGlyphFeatures(this.selectedGlyphFeatures);
    }
  }

  /**
   * A4: user-triggered "apply recommended features" (Smart Defaults). Applies the
   * suggestions (which records a single history entry via saveGlyphFeatures) and
   * shows a confirmation toast with a one-click undo.
   */
  applySuggestedFeaturesByUser(): void {
    this.applySuggestedFeatures();
    this.toastService.showUndo('Empfohlene Merkmale angewendet', () => this.preprocessingService.undo());
  }

  // Drag & Drop
  onDragStart(event: DragEvent, feature: string, fromList: 'selected' | 'available', index: number): void {
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
    event.preventDefault();
    event.stopPropagation();
    this.dragOverIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /** Insert a feature into the selected list at a specific position. */
  private insertSelectedAt(feature: string, index: number): void {
    if (this.selectedGlyphFeatures.length >= this.MAX_GLYPH_FEATURES || this.isFeatureSelected(feature)) return;
    const clamped = Math.max(0, Math.min(index, this.selectedGlyphFeatures.length));
    this.selectedGlyphFeatures.splice(clamped, 0, feature);
    this.saveGlyphFeatures();
    this.regeneratePreviewData();
  }

  /** Move a selected feature to a new position (reordering — order drives the glyph). */
  private moveSelected(from: number, to: number): void {
    if (from < 0 || from >= this.selectedGlyphFeatures.length) return;
    const clampedTo = Math.max(0, Math.min(to, this.selectedGlyphFeatures.length - 1));
    if (from === clampedTo) return;
    const [moved] = this.selectedGlyphFeatures.splice(from, 1);
    this.selectedGlyphFeatures.splice(clampedTo, 0, moved);
    this.saveGlyphFeatures();
    this.regeneratePreviewData();
  }

  /** Drop onto a specific selected row: reorder (from selected) or insert (from available). */
  onDropOnSelectedItem(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.draggedFeature) {
      this.onDragEnd(event);
      return;
    }
    if (this.draggedFromList === 'selected') {
      this.moveSelected(this.draggedIndex, targetIndex);
    } else {
      this.insertSelectedAt(this.draggedFeature, targetIndex);
    }
    this.onDragEnd(event);
  }

  /** Drop on the selected list background: append (available) or move to end (selected). */
  onDropInSelected(event: DragEvent): void {
    event.preventDefault();
    if (!this.draggedFeature) return;

    if (this.draggedFromList === 'available') {
      if (this.selectedGlyphFeatures.length < this.MAX_GLYPH_FEATURES && !this.isFeatureSelected(this.draggedFeature)) {
        this.selectedGlyphFeatures.push(this.draggedFeature);
        this.saveGlyphFeatures();
        this.regeneratePreviewData();
      }
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
  // Projection Column Selection
  // ============================================================================

  toggleColumnProjection(columnName: string): void {
    const entry = this.projectionColumns.find(c => c.column.name === columnName);
    if (entry) {
      const newValue = !entry.config.includeInProjection;
      this.preprocessingService.updateColumnConfig(columnName, { includeInProjection: newValue });
      // Update local reference to trigger template re-render
      entry.config.includeInProjection = newValue;
    }
  }

  isColumnInProjection(columnName: string): boolean {
    return this.projectionColumns.find(c => c.column.name === columnName)?.config.includeInProjection ?? false;
  }

  /** Projection columns filtered by the search box and the type filter. */
  get filteredProjectionColumns(): ProjectionColumnState[] {
    const term = this.projectionColumnSearch.trim().toLowerCase();
    return this.projectionColumns.filter(entry => {
      if (term && !entry.column.name.toLowerCase().includes(term)) return false;
      if (this.projectionColumnTypeFilter !== 'all' && entry.column.dataType !== this.projectionColumnTypeFilter) {
        return false;
      }
      return true;
    });
  }

  hasProjectionColumnFilter(): boolean {
    return this.projectionColumnSearch.trim() !== '' || this.projectionColumnTypeFilter !== 'all';
  }

  clearProjectionColumnFilters(): void {
    this.projectionColumnSearch = '';
    this.projectionColumnTypeFilter = 'all';
  }

  /** Toggle the per-column details panel (encoding/scaling/missing) for progressive disclosure. */
  toggleProjectionDetails(columnName: string, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    if (this.expandedProjectionDetails.has(columnName)) {
      this.expandedProjectionDetails.delete(columnName);
    } else {
      this.expandedProjectionDetails.add(columnName);
    }
  }

  isProjectionDetailsExpanded(columnName: string): boolean {
    return this.expandedProjectionDetails.has(columnName);
  }

  /** Human-readable label for the configured missing-value strategy. */
  getMissingLabel(strategy: MissingValueStrategy): string {
    const labels: Record<MissingValueStrategy, string> = {
      [MissingValueStrategy.Keep]: 'Keep',
      [MissingValueStrategy.RemoveRows]: 'Remove rows',
      [MissingValueStrategy.FillMean]: 'Fill mean',
      [MissingValueStrategy.FillMedian]: 'Fill median',
      [MissingValueStrategy.FillMode]: 'Fill mode',
      [MissingValueStrategy.FillValue]: 'Fill value',
    };
    return labels[strategy] ?? 'Keep';
  }

  getProjectionCount(): number {
    return this.projectionColumns.filter(c => c.config.includeInProjection).length;
  }

  setAllProjectionColumns(included: boolean): void {
    for (const entry of this.projectionColumns) {
      if (entry.config.includeInProjection !== included) {
        this.preprocessingService.updateColumnConfig(entry.column.name, { includeInProjection: included });
        entry.config.includeInProjection = included;
      }
    }
  }

  /** True when every column is included (master checkbox checked). */
  allColumnsInProjection(): boolean {
    return this.projectionColumns.length > 0 && this.getProjectionCount() === this.projectionColumns.length;
  }

  /** True when only some columns are included (master checkbox indeterminate). */
  someColumnsInProjection(): boolean {
    const count = this.getProjectionCount();
    return count > 0 && count < this.projectionColumns.length;
  }

  /** Master checkbox: select all unless everything is already selected, in which case clear. */
  onToggleAllProjection(): void {
    this.setAllProjectionColumns(!this.allColumnsInProjection());
  }

  // ============================================================================
  // Projection Configuration
  // ============================================================================

  isMethodDisabled(method: ProjectionMethodUI): boolean {
    return method.disabled || false;
  }

  shouldShowLargeDatasetWarning(method: ProjectionMethodUI): boolean {
    return method.largeDatasetWarning === true && this.getDatasetRowCount() > this.LARGE_DATASET_THRESHOLD;
  }

  toggleProjectionMethod(method: ProjectionMethodUI): void {
    if (this.isMethodDisabled(method)) return;
    this.projectionConfig[method.key] = !this.projectionConfig[method.key];
    this.updateProjectionConfig();
  }

  onParamChange(configKey: keyof ProjectionConfig, value: number, min: number, max: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.projectionConfig as any)[configKey] = Math.max(min, Math.min(max, value));
    this.updateProjectionConfig();
  }

  private updateProjectionConfig(): void {
    const state = this.preprocessingService.currentState;
    state.projectionConfig = { ...this.projectionConfig };
  }

  hasEnabledMethod(): boolean {
    return true;
  }

  getDatasetRowCount(): number {
    return this.preprocessingService.currentState.dataProfile?.totalRows || 0;
  }

  shouldShowTSNEWarning(): boolean {
    return this.projectionConfig.enableTSNE && this.getDatasetRowCount() > this.TSNE_WARNING_THRESHOLD;
  }

  getTSNETimeEstimate(): string {
    const rowCount = this.getDatasetRowCount();
    if (rowCount > 20000) return 'Very large dataset - t-SNE may take 15-30 minutes';
    if (rowCount > 10000) return 'Large dataset - t-SNE may take 5-15 minutes';
    if (rowCount > 5000) return 'Medium-large dataset - t-SNE may take 2-5 minutes';
    if (rowCount > 2000) return 'Medium dataset - t-SNE may take 1-2 minutes';
    return 'Small dataset - t-SNE should complete in under 1 minute';
  }

  // ============================================================================
  // Glyph Preview (SVG)
  // ============================================================================

  private regeneratePreviewData(): void {
    this.glyphPreviewData.clear();
    for (const feature of this.selectedGlyphFeatures) {
      const hash = this.simpleHash(feature);
      const value = 0.3 + (hash % 70) / 100;
      this.glyphPreviewData.set(feature, value);
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  generateStarPath(): string {
    const segments = this.selectedGlyphFeatures.length;
    if (segments < 3) return '';
    const cx = this.PREVIEW_CENTER;
    const cy = this.PREVIEW_CENTER;
    const r = this.PREVIEW_RADIUS;

    const points: string[] = [];
    this.selectedGlyphFeatures.forEach((feature, i) => {
      const norm = this.glyphPreviewData.get(feature) ?? 0.5;
      const angle = (i / segments) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r * norm;
      const y = cy - Math.sin(angle) * r * norm;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });
    return `M${points.join('L')}Z`;
  }

  generateFlowerPetals(): { path: string; angleDeg: number }[] {
    const segments = this.selectedGlyphFeatures.length;
    if (segments < 3) return [];
    const r = this.PREVIEW_RADIUS;

    return this.selectedGlyphFeatures.map((feature, i) => {
      const norm = this.glyphPreviewData.get(feature) ?? 0.5;
      const petalLength = r * norm * 0.95;
      const petalWidth = petalLength * 0.4;
      const angleDeg = (i / segments) * 360;

      const d = [
        `M0,0`,
        `C${(petalWidth * 0.25).toFixed(1)},${(-petalLength * 0.3).toFixed(1)}`,
        `${(petalWidth * 0.6).toFixed(1)},${(-petalLength * 0.75).toFixed(1)}`,
        `0,${(-petalLength).toFixed(1)}`,
        `C${(-petalWidth * 0.6).toFixed(1)},${(-petalLength * 0.75).toFixed(1)}`,
        `${(-petalWidth * 0.25).toFixed(1)},${(-petalLength * 0.3).toFixed(1)}`,
        `0,0`,
      ].join(' ');

      return { path: d, angleDeg };
    });
  }

  generateWhiskerBars(): { length: number; angleDeg: number }[] {
    const segments = this.selectedGlyphFeatures.length;
    if (segments < 3) return [];
    const r = this.PREVIEW_RADIUS;

    return this.selectedGlyphFeatures.map((feature, i) => {
      const norm = this.glyphPreviewData.get(feature) ?? 0.5;
      const length = r * norm * 0.95;
      const angleDeg = (i / segments) * 360;
      return { length, angleDeg };
    });
  }

  getPreviewAxes(): { x: number; y: number }[] {
    const segments = this.selectedGlyphFeatures.length;
    if (segments < 3) return [];
    const cx = this.PREVIEW_CENTER;
    const cy = this.PREVIEW_CENTER;
    const r = this.PREVIEW_RADIUS;

    return this.selectedGlyphFeatures.map((_, i) => {
      const angle = (i / segments) * Math.PI * 2;
      return {
        x: cx + Math.cos(angle) * r,
        y: cy - Math.sin(angle) * r,
      };
    });
  }

  getPreviewAxisLabels(): { x: number; y: number; name: string; anchor: string }[] {
    const segments = this.selectedGlyphFeatures.length;
    if (segments < 3) return [];
    const cx = this.PREVIEW_CENTER;
    const cy = this.PREVIEW_CENTER;
    const labelR = this.PREVIEW_RADIUS + 14;

    return this.selectedGlyphFeatures.map((feature, i) => {
      const angle = (i / segments) * Math.PI * 2;
      const x = cx + Math.cos(angle) * labelR;
      const y = cy - Math.sin(angle) * labelR;
      const cos = Math.cos(angle);
      const anchor = cos > 0.1 ? 'start' : cos < -0.1 ? 'end' : 'middle';
      // Show the full feature name; the SVG is allowed to overflow so long
      // one-hot names (e.g. neighbourhood_group_Manhattan) are not clipped.
      return { x, y, name: feature, anchor };
    });
  }

  // ============================================================================
  // Projection Parameter Toggles
  // ============================================================================

  toggleMethodParams(methodKey: string): void {
    if (this.expandedMethodParams.has(methodKey)) {
      this.expandedMethodParams.delete(methodKey);
    } else {
      this.expandedMethodParams.add(methodKey);
    }
  }

  isMethodParamsExpanded(methodKey: string): boolean {
    return this.expandedMethodParams.has(methodKey);
  }

  methodHasParams(method: ProjectionMethodUI): boolean {
    return (method.params?.length ?? 0) > 0;
  }

  /** Resets all parameters of a method back to their default values. */
  resetMethodParams(method: ProjectionMethodUI): void {
    if (!method.params) return;
    for (const param of method.params) {
      this.onParamChange(param.configKey, param.default, param.min, param.max);
    }
  }

  /** True when at least one parameter of the method differs from its default. */
  methodParamsChanged(method: ProjectionMethodUI): boolean {
    if (!method.params) return false;
    return method.params.some(param => this.projectionConfig[param.configKey] !== param.default);
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  canProceed(): boolean {
    const glyphValid =
      this.selectedGlyphFeatures.length >= this.MIN_GLYPH_FEATURES &&
      this.selectedGlyphFeatures.length <= this.MAX_GLYPH_FEATURES;
    const projectionValid = this.hasEnabledMethod();
    const projectionColumnsValid = this.getProjectionCount() > 0;
    return glyphValid && projectionValid && projectionColumnsValid;
  }

  proceed(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
    }
  }
}
