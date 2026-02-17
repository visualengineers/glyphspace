import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ProjectionConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataType } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';
import { COLOR_SCALES, ColorScale, buildGroupedColorScales } from '../../../shared/interfaces/color-scale';
import { ColorScaleSelectorComponent } from '../../../shared/components/color-scale-selector/color-scale-selector.component';

/** Describes a tunable parameter for a projection method. */
interface ProjectionParam {
  label: string;
  helpKey: string;
  configKey: keyof ProjectionConfig;
  min: number;
  max: number;
  step?: number;
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
  imports: [CommonModule, FormsModule, HelpTooltipComponent, ColorScaleSelectorComponent],
  templateUrl: './step4-visualization-settings.component.html',
  styleUrl: './step4-visualization-settings.component.scss',
})
export class Step4VisualizationSettingsComponent implements OnInit {
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
        { label: 'Neighbors (0 = auto)', helpKey: 'isomapNeighbors', configKey: 'isomapNeighbors', min: 0, max: 200 },
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
      params: [{ label: 'Neighbors (0 = auto)', helpKey: 'lleNeighbors', configKey: 'lleNeighbors', min: 0, max: 200 }],
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
        { label: 'Neighbors (0 = auto)', helpKey: 'ltsaNeighbors', configKey: 'ltsaNeighbors', min: 0, max: 200 },
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
        { label: 'Number of Neighbors', helpKey: 'umapNeighbors', configKey: 'umapNeighbors', min: 2, max: 200 },
        { label: 'Minimum Distance', helpKey: 'umapMinDist', configKey: 'umapMinDist', min: 0, max: 0.99, step: 0.01 },
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
        { label: 'Perplexity', helpKey: 'tsnePerplexity', configKey: 'tsnePerplexity', min: 5, max: 50 },
        { label: 'Iterations', helpKey: 'tsneIterations', configKey: 'tsneIterations', min: 250, max: 5000, step: 250 },
      ],
    },
  ];

  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[3]; // Step 4 (index 3)

  constructor(public preprocessingService: PreprocessingService) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Load columns
    if (state.dataProfile) {
      this.columns = state.dataProfile.columns.filter(col => {
        const config = state.columnConfigs.get(col.name);
        return config && config.enabled;
      });
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
      this.preprocessingService.setGlyphFeatures(this.selectedGlyphFeatures);
    }
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
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDropInSelected(event: DragEvent): void {
    event.preventDefault();
    if (!this.draggedFeature) return;

    if (this.draggedFromList === 'available') {
      if (this.selectedGlyphFeatures.length < this.MAX_GLYPH_FEATURES && !this.isFeatureSelected(this.draggedFeature)) {
        this.selectedGlyphFeatures.push(this.draggedFeature);
        this.saveGlyphFeatures();
        this.regeneratePreviewData();
      }
    }

    this.onDragEnd(event);
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
      const name = feature.length > 14 ? feature.substring(0, 13) + '\u2026' : feature;
      return { x, y, name, anchor };
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

  // ============================================================================
  // Navigation
  // ============================================================================

  canProceed(): boolean {
    const glyphValid =
      this.selectedGlyphFeatures.length >= this.MIN_GLYPH_FEATURES &&
      this.selectedGlyphFeatures.length <= this.MAX_GLYPH_FEATURES;
    const projectionValid = this.hasEnabledMethod();
    return glyphValid && projectionValid;
  }

  continue(): void {
    if (this.canProceed()) {
      this.preprocessingService.nextStep();
    }
  }

  goBack(): void {
    this.preprocessingService.previousStep();
  }
}
