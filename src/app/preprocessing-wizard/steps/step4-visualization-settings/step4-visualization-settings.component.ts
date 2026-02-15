import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ProjectionConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataType } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';

/**
 * UI configuration for a projection method.
 * Not to be confused with ProjectionMethod type from shared/types/projection.types.ts
 * which is the string union type for method identifiers.
 */
interface ProjectionMethodUI {
  key: keyof Pick<ProjectionConfig, 'enablePCA' | 'enableIsoMap' | 'enableMDS' | 'enableLLE' | 'enableLTSA' | 'enableTSNE' | 'enableUMAP' | 'enableTriMap' | 'enableTopoMap' | 'enableSammon'>;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
  largeDatasetWarning?: boolean;
}

@Component({
  selector: 'app-step4-visualization-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent],
  templateUrl: './step4-visualization-settings.component.html',
  styleUrl: './step4-visualization-settings.component.scss'
})
export class Step4VisualizationSettingsComponent implements OnInit, OnDestroy {
  // Color feature selection
  columns: ColumnStatistics[] = [];
  colorFeature: string | null = null;

  // Glyph feature mapping
  availableFeatures: string[] = [];
  selectedGlyphFeatures: string[] = [];
  suggestedFeatures: string[] = [];
  featureVariances: Map<string, number> = new Map();
  readonly MIN_GLYPH_FEATURES = 3;
  readonly MAX_GLYPH_FEATURES = 12;
  draggedFeature: string | null = null;
  draggedFromList: 'selected' | 'available' = 'available';
  draggedIndex: number = -1;

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
    trimapWeightAdj: 500
  };

  readonly TSNE_WARNING_THRESHOLD = 5000;
  readonly LARGE_DATASET_THRESHOLD = 10000;

  projectionMethods: ProjectionMethodUI[] = [
    {
      key: 'enablePCA',
      name: 'PCA',
      description: 'Principal Component Analysis - Fast linear projection',
      icon: 'analytics',
      badge: 'Very Fast'
    },
    {
      key: 'enableIsoMap',
      name: 'IsoMap',
      description: 'Non-linear manifold learning - Preserves geodesic distances',
      icon: 'auto_graph',
      badge: 'Fast',
      largeDatasetWarning: true
    },
    {
      key: 'enableMDS',
      name: 'MDS',
      description: 'Classical Multidimensional Scaling - Distance preserving',
      icon: 'grid_on',
      badge: 'Fast',
      largeDatasetWarning: true
    },
    {
      key: 'enableLLE',
      name: 'LLE',
      description: 'Locally Linear Embedding - Preserves local geometry',
      icon: 'blur_on',
      badge: 'Medium',
      largeDatasetWarning: true
    },
    {
      key: 'enableLTSA',
      name: 'LTSA',
      description: 'Local Tangent Space Alignment - Good for curved manifolds',
      icon: 'waves',
      badge: 'Medium',
      largeDatasetWarning: true
    },
    {
      key: 'enableTSNE',
      name: 't-SNE',
      description: 'Preserves local structure - Good for clusters',
      icon: 'bubble_chart',
      badge: 'Slow',
      largeDatasetWarning: true
    },
    {
      key: 'enableUMAP',
      name: 'UMAP',
      description: 'Balances local and global structure',
      icon: 'scatter_plot',
      badge: 'Slow',
      largeDatasetWarning: true
    },
    {
      key: 'enableTriMap',
      name: 'TriMap',
      description: 'Global structure preservation - Good for large datasets',
      icon: 'timeline',
      badge: 'Medium'
    },
    {
      key: 'enableTopoMap',
      name: 'TopoMap',
      description: 'Topology preserving projection',
      icon: 'terrain',
      badge: 'Medium',
      largeDatasetWarning: true
    },
    {
      key: 'enableSammon',
      name: 'Sammon',
      description: 'Sammon mapping - Preserves small distances',
      icon: 'hub',
      badge: 'Medium',
      largeDatasetWarning: true
    }
  ];

  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[3]; // Step 4 (index 3)

  constructor(
    public preprocessingService: PreprocessingService
  ) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Load columns
    if (state.dataProfile) {
      this.columns = state.dataProfile.columns.filter(col => {
        const config = state.columnConfigs.get(col.name);
        return config && config.enabled;
      });
    }

    // Load color feature
    const colorCol = Array.from(state.columnConfigs.values()).find(c => c.isColorFeature);
    if (colorCol) {
      this.colorFeature = colorCol.name;
    } else if (this.columns.length > 0) {
      this.colorFeature = this.columns[0].name;
      this.preprocessingService.setColorFeature(this.columns[0].name);
    } else {
      this.colorFeature = null;
    }

    // Load glyph features
    this.updateAvailableFeatures();
    this.calculateSmartSuggestions();
    if (state.glyphFeatures.length >= this.MIN_GLYPH_FEATURES) {
      this.selectedGlyphFeatures = [...state.glyphFeatures];
    } else {
      this.applySuggestedFeatures();
    }

    // Load projection config
    if (state.projectionConfig) {
      this.projectionConfig = { ...state.projectionConfig };
    }
  }

  ngOnDestroy(): void {}

  // ============================================================================
  // Color Feature Selection
  // ============================================================================

  setColorFeature(columnName: string): void {
    this.colorFeature = columnName;
    this.preprocessingService.setColorFeature(columnName);
  }

  getDataTypeBadgeClass(dataType: DataType | undefined): string {
    return `badge-${dataType}`;
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

    const featureScores: Array<{name: string; score: number}> = [];

    for (const feature of this.availableFeatures) {
      const baseColName = feature.split('_')[0];
      const colStats = profile.columns.find(c => c.name === baseColName);
      if (!colStats) continue;

      let score = 0;
      if (colStats.dataType === DataType.Numeric && colStats.variance !== undefined) {
        score = colStats.variance;
        this.featureVariances.set(feature, score);
      } else if (colStats.dataType === DataType.Categorical) {
        score = colStats.uniqueCount / colStats.count;
        this.featureVariances.set(feature, score);
      } else {
        score = colStats.uniqueCount;
        this.featureVariances.set(feature, score);
      }

      featureScores.push({ name: feature, score });
    }

    featureScores.sort((a, b) => b.score - a.score);
    this.suggestedFeatures = featureScores.slice(0, Math.min(5, featureScores.length)).map(f => f.name);
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
  }

  addGlyphFeature(feature: string): void {
    if (this.selectedGlyphFeatures.length >= this.MAX_GLYPH_FEATURES) return;
    if (!this.isFeatureSelected(feature)) {
      this.selectedGlyphFeatures.push(feature);
      this.saveGlyphFeatures();
    }
  }

  removeGlyphFeature(index: number): void {
    this.selectedGlyphFeatures.splice(index, 1);
    this.saveGlyphFeatures();
  }

  isFeatureSelected(feature: string): boolean {
    return this.selectedGlyphFeatures.includes(feature);
  }

  getFeatureVariance(feature: string): number | null {
    return this.featureVariances.get(feature) ?? null;
  }

  saveGlyphFeatures(): void {
    if (this.selectedGlyphFeatures.length >= this.MIN_GLYPH_FEATURES &&
        this.selectedGlyphFeatures.length <= this.MAX_GLYPH_FEATURES) {
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

  onDragEnd(event: DragEvent): void {
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

  onTSNEPerplexityChange(value: number): void {
    this.projectionConfig.tsnePerplexity = Math.max(5, Math.min(50, value));
    this.updateProjectionConfig();
  }

  onTSNEIterationsChange(value: number): void {
    this.projectionConfig.tsneIterations = Math.max(250, Math.min(5000, value));
    this.updateProjectionConfig();
  }

  onUMAPNeighborsChange(value: number): void {
    this.projectionConfig.umapNeighbors = Math.max(2, Math.min(200, value));
    this.updateProjectionConfig();
  }

  onUMAPMinDistChange(value: number): void {
    this.projectionConfig.umapMinDist = Math.max(0.0, Math.min(0.99, value));
    this.updateProjectionConfig();
  }

  onIsoMapNeighborsChange(value: number): void {
    this.projectionConfig.isomapNeighbors = Math.max(0, Math.min(200, value));
    this.updateProjectionConfig();
  }

  onLLENeighborsChange(value: number): void {
    this.projectionConfig.lleNeighbors = Math.max(0, Math.min(200, value));
    this.updateProjectionConfig();
  }

  onLTSANeighborsChange(value: number): void {
    this.projectionConfig.ltsaNeighbors = Math.max(0, Math.min(200, value));
    this.updateProjectionConfig();
  }

  onTriMapWeightAdjChange(value: number): void {
    this.projectionConfig.trimapWeightAdj = Math.max(100, Math.min(2000, value));
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
  // Navigation
  // ============================================================================

  canProceed(): boolean {
    const glyphValid = this.selectedGlyphFeatures.length >= this.MIN_GLYPH_FEATURES &&
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
