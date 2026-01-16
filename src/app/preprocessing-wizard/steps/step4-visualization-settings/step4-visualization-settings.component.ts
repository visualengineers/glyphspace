import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataProviderService } from '../../../services/dataprovider.service';
import { ProjectionService, ProjectionResult } from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataType, EncodingMethod, ScalingMethod } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';

interface ProjectionMethod {
  key: keyof Pick<ProjectionConfig, 'enablePCA' | 'enableIsoMap' | 'enableTSNE' | 'enableUMAP'>;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-step4-visualization-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent],
  templateUrl: './step4-visualization-settings.component.html',
  styleUrl: './step4-visualization-settings.component.scss'
})
export class Step4VisualizationSettingsComponent implements OnInit, OnDestroy {
  @Output() finish = new EventEmitter<void>();

  // Tab control
  activeSection: 'configure' | 'review' | 'processing' = 'configure';

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
    enableIsoMap: false,
    enableTSNE: false,
    enableUMAP: false,
    tsnePerplexity: 30,
    tsneIterations: 1000,
    umapNeighbors: 15,
    umapMinDist: 0.1
  };

  readonly TSNE_WARNING_THRESHOLD = 5000;

  // FastMap is always the primary projection (runs immediately, not toggleable)
  // These are optional background projections the user can enable
  projectionMethods: ProjectionMethod[] = [
    {
      key: 'enablePCA',
      name: 'PCA',
      description: 'Principal Component Analysis - Fast linear projection',
      icon: 'analytics',
      badge: 'Fast'
    },
    {
      key: 'enableIsoMap',
      name: 'IsoMap',
      description: 'Non-linear manifold learning - Preserves geodesic distances',
      icon: 'map',
      badge: 'Medium'
    },
    {
      key: 'enableTSNE',
      name: 't-SNE',
      description: 'Preserves local structure - Good for clusters',
      icon: 'bubble_chart',
      badge: 'Slow'
    },
    {
      key: 'enableUMAP',
      name: 'UMAP',
      description: 'Balances local and global structure',
      icon: 'scatter_plot',
      badge: 'Slow'
    }
  ];

  // Processing state
  isProcessing = false;
  processingProgress = 0;
  processingStep = '';
  processingComplete = false;
  error: string | null = null;

  // Review/Summary data
  totalColumns = 0;
  enabledColumns = 0;
  projectionColumns = 0;
  enabledMethods: string[] = [];
  columnConfigs: ColumnConfig[] = [];

  // Background projection status
  backgroundProjections = new Map<string, { status: string; progress: number; message: string }>();

  // Capture dataset info for background projections (survives wizard reset)
  private backgroundDatasetName: string = '';
  private backgroundTimestamp: string = '';

  // Expose enums
  DataType = DataType;
  EncodingMethod = EncodingMethod;
  ScalingMethod = ScalingMethod;

  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[3]; // Step 4 (index 3)

  private progressSubscription?: Subscription;
  private backgroundStatusSubscription?: Subscription;

  constructor(
    public preprocessingService: PreprocessingService,
    private dataProvider: DataProviderService,
    private projectionService: ProjectionService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
      // Default to first column and persist to service
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

    // Prepare review data
    this.prepareReviewData();
  }

  ngOnDestroy(): void {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.backgroundStatusSubscription) {
      this.backgroundStatusSubscription.unsubscribe();
    }
  }

  // ============================================================================
  // Section Navigation
  // ============================================================================

  goToSection(section: 'configure' | 'review' | 'processing'): void {
    if (section === 'review' && !this.canProceedToReview()) {
      return;
    }
    this.activeSection = section;
    if (section === 'review') {
      this.prepareReviewData();
    }
  }

  canProceedToReview(): boolean {
    const glyphValid = this.selectedGlyphFeatures.length >= this.MIN_GLYPH_FEATURES &&
                      this.selectedGlyphFeatures.length <= this.MAX_GLYPH_FEATURES;
    const projectionValid = this.hasEnabledMethod();
    return glyphValid && projectionValid;
  }

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

  isMethodDisabled(method: ProjectionMethod): boolean {
    return method.disabled || false;
  }

  toggleProjectionMethod(method: ProjectionMethod): void {
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

  private updateProjectionConfig(): void {
    const state = this.preprocessingService.currentState;
    state.projectionConfig = { ...this.projectionConfig };
  }

  hasEnabledMethod(): boolean {
    // FastMap is always enabled as the primary projection
    return true;
  }

  getEnabledMethodsCount(): number {
    // Start with 1 for FastMap (always enabled)
    let count = 1;
    if (this.projectionConfig.enablePCA) count++;
    if (this.projectionConfig.enableTSNE) count++;
    if (this.projectionConfig.enableUMAP) count++;
    return count;
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
  // Review/Summary
  // ============================================================================

  prepareReviewData(): void {
    const state = this.preprocessingService.currentState;

    this.totalColumns = state.dataProfile?.columns.length || 0;
    this.columnConfigs = Array.from(state.columnConfigs.values());
    this.enabledColumns = this.columnConfigs.filter(c => c.enabled).length;
    this.projectionColumns = this.columnConfigs.filter(c => c.enabled && c.includeInProjection).length;

    // FastMap is always the primary projection
    this.enabledMethods = ['FastMap (Primary)'];
    if (this.projectionConfig.enablePCA) this.enabledMethods.push('PCA');
    if (this.projectionConfig.enableIsoMap) this.enabledMethods.push('IsoMap');
    if (this.projectionConfig.enableTSNE) this.enabledMethods.push('t-SNE');
    if (this.projectionConfig.enableUMAP) this.enabledMethods.push('UMAP');
  }

  getEncodingLabel(method: EncodingMethod): string {
    const labels = {
      [EncodingMethod.None]: 'None',
      [EncodingMethod.OneHot]: 'One-Hot',
      [EncodingMethod.Label]: 'Label',
      [EncodingMethod.Normalize]: 'Normalize',
      [EncodingMethod.Standardize]: 'Standardize'
    };
    return labels[method] || 'Unknown';
  }

  getScalingLabel(method: ScalingMethod): string {
    const labels = {
      [ScalingMethod.None]: 'None',
      [ScalingMethod.Standard]: 'Standard',
      [ScalingMethod.MinMax]: 'Min-Max',
      [ScalingMethod.Robust]: 'Robust'
    };
    return labels[method] || 'Unknown';
  }

  getDataTypeLabel(type: DataType): string {
    const labels: Record<DataType, string> = {
      [DataType.Numeric]: 'Numeric',
      [DataType.Categorical]: 'Categorical',
      [DataType.Text]: 'Text',
      [DataType.Date]: 'Date',
      [DataType.Boolean]: 'Boolean',
      [DataType.ID]: 'ID',
      [DataType.Coordinate]: 'Coordinate',
      [DataType.Unknown]: 'Unknown'
    };
    return labels[type] || 'Unknown';
  }

  // ============================================================================
  // Processing
  // ============================================================================

  async startProcessing(): Promise<void> {
    this.activeSection = 'processing';
    this.isProcessing = true;
    this.processingProgress = 0;
    this.processingStep = 'Initializing...';
    this.error = null;

    this.progressSubscription = this.preprocessingService.processingProgress.subscribe({
      next: (progress) => {
        this.processingStep = progress.message || progress.step;
        this.processingProgress = Math.min(progress.progress, 70);
        this.cdr.detectChanges();
      }
    });

    try {
      await this.preprocessingService.processData();

      this.ngZone.run(() => {
        this.processingStep = 'Loading features for projections...';
        this.processingProgress = 70;
        this.cdr.detectChanges();
      });

      const csvText = await this.preprocessingService.getProcessedFeaturesCSV();
      const { features, ids } = this.projectionService.parseCSVFeatures(csvText);

      this.ngZone.run(() => {
        this.processingStep = 'Computing FastMap projection...';
        this.processingProgress = 75;
        this.cdr.detectChanges();
      });

      // Use FastMap as the primary projection (fast, O(n) complexity, ideal for large datasets)
      const fastmapResult = await this.projectionService.runFastMapSync(features, ids);

      this.ngZone.run(() => {
        this.processingStep = 'Loading dataset with FastMap...';
        this.processingProgress = 90;
        this.cdr.detectChanges();
      });

      await this.preprocessingService.addProjectionPositions('fastmap', fastmapResult.positions);

      this.ngZone.run(() => {
        this.processingProgress = 100;
        this.processingStep = `Dataset loaded with FastMap (${fastmapResult.computeTime}ms)`;
        this.processingComplete = true;
        this.isProcessing = false;
        this.cdr.detectChanges();
      });

      this.startBackgroundProjections(features, ids);

    } catch (error: any) {
      console.error('Processing failed:', error);
      this.ngZone.run(() => {
        this.error = error.message || 'Processing failed';
        this.isProcessing = false;
        this.cdr.detectChanges();
      });
    } finally {
      if (this.progressSubscription) {
        this.progressSubscription.unsubscribe();
        this.progressSubscription = undefined;
      }
    }
  }

  private async startBackgroundProjections(features: number[][], ids: (string|number)[]): Promise<void> {
    const config = this.projectionConfig;

    // Capture dataset info so background projections can add positions even after wizard reset
    const state = this.preprocessingService.currentState;
    this.backgroundDatasetName = state.datasetName;
    this.backgroundTimestamp = state.timestamp;

    this.backgroundStatusSubscription = this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
      this.ngZone.run(() => {
        this.backgroundProjections.clear();
        statusMap.forEach((status, method) => {
          this.backgroundProjections.set(method, {
            status: status.status,
            progress: status.progress,
            message: status.message
          });
        });
        this.cdr.detectChanges();
      });
    });

    // Run PCA in background (FastMap is now primary)
    if (config.enablePCA) {
      this.runBackgroundProjection('PCA', () => this.projectionService.runPCABackground(features, ids));
    }

    // Run IsoMap in background (non-linear manifold learning)
    if (config.enableIsoMap) {
      this.runBackgroundProjection('IsoMap', () => this.projectionService.runIsoMap(features, ids));
    }

    if (config.enableTSNE) {
      this.runBackgroundProjection('t-SNE', () =>
        this.projectionService.runTSNE(features, ids, {
          perplexity: config.tsnePerplexity,
          iterations: config.tsneIterations
        })
      );
    }

    if (config.enableUMAP) {
      this.runBackgroundProjection('UMAP', () =>
        this.projectionService.runUMAP(features, ids, {
          neighbors: config.umapNeighbors,
          minDist: config.umapMinDist
        })
      );
    }
  }

  private async runBackgroundProjection(name: string, computeFn: () => Promise<ProjectionResult>): Promise<void> {
    try {
      const result = await computeFn();

      // Convert positions to the format expected by DataProvider
      const positionsForProvider = result.positions.map(p => ({
        id: p.id,
        position: { x: p.x, y: p.y }
      }));

      // Try to add to wizard state first (if still active)
      await this.preprocessingService.addProjectionPositions(result.method, result.positions);

      const state = this.preprocessingService.currentState;
      if (state.processedDataset) {
        // Wizard still active - update via normal flow
        const collection = state.processedDataset as any;
        const datasetKey = collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

        if (datasetKey && collection.datasets) {
          const dataset = collection.datasets[datasetKey];
          if (dataset) {
            this.dataProvider.addProcessedDatasetToCollection(state.datasetName, state.timestamp, dataset);
            this.dataProvider.loadProcessedDataset(dataset, state.datasetName, state.timestamp);
          }
        }
      } else if (this.backgroundDatasetName && this.backgroundTimestamp) {
        // Wizard was reset but dataset is already loaded in dashboard
        // Add positions directly to the loaded dataset
        this.dataProvider.addPositionsToLoadedDataset(
          this.backgroundDatasetName,
          this.backgroundTimestamp,
          result.method,
          positionsForProvider
        );
      }

      this.ngZone.run(() => {
        this.toastService.success(`${name} projection ready! (${(result.computeTime / 1000).toFixed(1)}s)`, 4000);
      });

    } catch (error: any) {
      console.error(`${name} projection failed:`, error);
      this.ngZone.run(() => {
        this.toastService.error(`${name} projection failed: ${error.message}`, 6000);
      });
    }
  }

  goToDashboard(): void {
    const state = this.preprocessingService.currentState;

    if (state.processedDataset) {
      const collection = state.processedDataset as any;
      const datasetKey = collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

      if (!datasetKey || !collection.datasets) {
        this.error = 'Invalid dataset structure. Please try processing again.';
        return;
      }

      const dataset = collection.datasets[datasetKey];

      if (dataset) {
        this.dataProvider.addProcessedDatasetToCollection(state.datasetName, state.timestamp, dataset);
        this.dataProvider.loadProcessedDataset(dataset, state.datasetName, state.timestamp);
      } else {
        this.error = 'Failed to load processed dataset';
        return;
      }
    }

    // Reset wizard state so it's ready for a new upload
    this.preprocessingService.resetState();

    this.finish.emit();
  }

  goBack(): void {
    this.preprocessingService.previousStep();
  }

  startOver(): void {
    if (confirm('Are you sure you want to start over? All current configuration will be lost.')) {
      this.preprocessingService.resetState();
      this.preprocessingService.goToStep(0);
    }
  }

  getBackgroundProjectionsArray(): Array<{ method: string; status: string; progress: number; message: string }> {
    const result: Array<{ method: string; status: string; progress: number; message: string }> = [];
    this.backgroundProjections.forEach((value, key) => {
      result.push({ method: key, ...value });
    });
    return result;
  }
}
