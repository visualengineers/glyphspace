import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ColumnConfig } from '../../models/column-config';
import { DataType, EncodingMethod, ScalingMethod, MissingValueStrategy, OutlierStrategy } from '../../models/data-type.enum';
import { DataProviderService } from '../../../services/dataprovider.service';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { STEP_INFO } from '../../shared/constants/step-info';
import { ProjectionService, ProjectionResult } from '../../../services/projection.service';

@Component({
  selector: 'app-step6-review-process',
  standalone: true,
  imports: [CommonModule, HelpTooltipComponent],
  templateUrl: './step6-review-process.component.html',
  styleUrl: './step6-review-process.component.scss'
})
export class Step6ReviewProcessComponent implements OnInit, OnDestroy {
  @Output() finish = new EventEmitter<void>();
  isProcessing = false;
  processingProgress = 0;
  processingStep = '';
  processingComplete = false;
  error: string | null = null;

  // Summary data
  totalColumns = 0;
  enabledColumns = 0;
  projectionColumns = 0;
  colorFeature = '';
  enabledMethods: string[] = [];

  // Configuration for display
  columnConfigs: ColumnConfig[] = [];

  // Background projection status
  backgroundProjections = new Map<string, { status: string; progress: number; message: string }>();

  // Expose enums to template
  DataType = DataType;
  EncodingMethod = EncodingMethod;
  ScalingMethod = ScalingMethod;

  // Expose step info to template
  readonly stepInfo = STEP_INFO[5]; // Step 6 (index 5)

  private progressSubscription?: Subscription;
  private backgroundStatusSubscription?: Subscription;

  constructor(
    public preprocessingService: PreprocessingService,
    private dataProvider: DataProviderService,
    private projectionService: ProjectionService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Calculate summary statistics
    this.totalColumns = state.dataProfile?.columns.length || 0;
    this.columnConfigs = Array.from(state.columnConfigs.values());
    this.enabledColumns = this.columnConfigs.filter(c => c.enabled).length;
    this.projectionColumns = this.columnConfigs.filter(c => c.enabled && c.includeInProjection).length;

    const colorCol = this.columnConfigs.find(c => c.isColorFeature);
    this.colorFeature = colorCol ? colorCol.name : 'None';

    // Get enabled projection methods
    const proj = state.projectionConfig;
    if (proj.enablePCA) this.enabledMethods.push('PCA');
    if (proj.enableFastMap) this.enabledMethods.push('FastMap');
    if (proj.enableTSNE) this.enabledMethods.push('t-SNE');
    if (proj.enableUMAP) this.enabledMethods.push('UMAP');
  }

  ngOnDestroy(): void {
    // Clean up subscriptions on component destroy
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.backgroundStatusSubscription) {
      this.backgroundStatusSubscription.unsubscribe();
    }
  }

  /**
   * Get display label for encoding method
   */
  getEncodingLabel(method: EncodingMethod): string {
    switch (method) {
      case EncodingMethod.None: return 'None';
      case EncodingMethod.OneHot: return 'One-Hot';
      case EncodingMethod.Label: return 'Label';
      case EncodingMethod.Normalize: return 'Normalize';
      case EncodingMethod.Standardize: return 'Standardize';
      default: return 'Unknown';
    }
  }

  /**
   * Get display label for scaling method
   */
  getScalingLabel(method: ScalingMethod): string {
    switch (method) {
      case ScalingMethod.None: return 'None';
      case ScalingMethod.Standard: return 'Standard';
      case ScalingMethod.MinMax: return 'Min-Max';
      case ScalingMethod.Robust: return 'Robust';
      default: return 'Unknown';
    }
  }

  /**
   * Get display label for data type
   */
  getDataTypeLabel(type: DataType): string {
    switch (type) {
      case DataType.Numeric: return 'Numeric';
      case DataType.Categorical: return 'Categorical';
      case DataType.Text: return 'Text';
      case DataType.Date: return 'Date';
      case DataType.Boolean: return 'Boolean';
      case DataType.ID: return 'ID';
      default: return 'Unknown';
    }
  }

  /**
   * Get data type badge CSS class
   */
  getDataTypeBadgeClass(dataType: DataType): string {
    switch (dataType) {
      case DataType.Numeric: return 'badge-numeric';
      case DataType.Categorical: return 'badge-categorical';
      case DataType.Text: return 'badge-text';
      case DataType.Date: return 'badge-date';
      case DataType.Boolean: return 'badge-boolean';
      case DataType.ID: return 'badge-id';
      default: return 'badge-unknown';
    }
  }

  /**
   * Download configuration as JSON
   */
  downloadConfiguration(): void {
    try {
      const config = this.preprocessingService.exportConfiguration();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.preprocessingService.currentState.datasetName}_config.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download configuration:', error);
      this.error = 'Failed to download configuration';
    }
  }

  /**
   * Import configuration from JSON file
   */
  importConfiguration(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = e.target.result;
          this.preprocessingService.importConfiguration(json);

          // Reload the component data
          this.ngOnInit();

          // Show success message (could be enhanced with a toast notification)
          alert('Configuration imported successfully!');
        } catch (error: any) {
          console.error('Failed to import configuration:', error);
          this.error = error.message || 'Failed to import configuration. Please check the file format.';
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Start data processing with two-phase approach:
   * Phase 1 (Foreground): Python processing + PCA
   * Phase 2 (Background): FastMap, t-SNE, UMAP (if enabled)
   */
  async startProcessing(): Promise<void> {
    this.isProcessing = true;
    this.processingProgress = 0;
    this.processingStep = 'Initializing...';
    this.error = null;

    // Subscribe to progress updates from worker BEFORE starting processing
    this.progressSubscription = this.preprocessingService.processingProgress.subscribe({
      next: (progress) => {
        console.log('Progress update:', progress);
        this.processingStep = progress.message || progress.step;
        this.processingProgress = Math.min(progress.progress, 70); // Cap at 70% for Python phase
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Progress update error:', err);
      }
    });

    try {
      // ==== PHASE 1: FOREGROUND (Blocking) ====
      // Step 1: Python processing (0-70%)
      await this.preprocessingService.processData();

      // Step 2: Load features (70-75%)
      this.ngZone.run(() => {
        this.processingStep = 'Loading features for projections...';
        this.processingProgress = 70;
        this.cdr.detectChanges();
      });

      const csvText = await this.preprocessingService.getProcessedFeaturesCSV();
      const { features, ids } = this.projectionService.parseCSVFeatures(csvText);

      // Step 3: Run PCA (fast!) (75-90%)
      this.ngZone.run(() => {
        this.processingStep = 'Computing PCA projection...';
        this.processingProgress = 75;
        this.cdr.detectChanges();
      });

      const pcaResult = await this.projectionService.runPCA(features, ids);

      // Step 4: Load dataset with PCA (90-100%)
      this.ngZone.run(() => {
        this.processingStep = 'Loading dataset with PCA...';
        this.processingProgress = 90;
        this.cdr.detectChanges();
      });

      await this.preprocessingService.addProjectionPositions('pca', pcaResult.positions);

      // Run completion inside Angular zone
      this.ngZone.run(() => {
        this.processingProgress = 100;
        this.processingStep = `Dataset loaded with PCA (${pcaResult.computeTime}ms)`;
        this.processingComplete = true;
        this.isProcessing = false;
        this.cdr.detectChanges();
      });

      // ==== PHASE 2: BACKGROUND (Non-blocking) ====
      // Start background projections (don't await - user can now go to dashboard)
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

  /**
   * Start background projection computations
   */
  private async startBackgroundProjections(features: number[][], ids: (string|number)[]): Promise<void> {
    const config = this.preprocessingService.currentState.projectionConfig;

    // Subscribe to background projection status updates
    this.backgroundStatusSubscription = this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
      this.ngZone.run(() => {
        this.backgroundProjections.clear();
        statusMap.forEach((status, method) => {
          console.log(`[Step6] Background status update - ${method}:`, status);
          this.backgroundProjections.set(method, {
            status: status.status,
            progress: status.progress,
            message: status.message
          });
        });
        this.cdr.detectChanges();
      });
    });

    // Run background projections (if enabled)
    if (config.enableFastMap) {
      this.runBackgroundProjection('FastMap', () =>
        this.projectionService.runFastMap(features, ids)
      );
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

  /**
   * Run a single background projection and update dataset when complete
   */
  private async runBackgroundProjection(
    name: string,
    computeFn: () => Promise<ProjectionResult>
  ): Promise<void> {
    try {
      console.log(`Starting background projection: ${name}`);
      const result = await computeFn();

      // Add projection to dataset
      await this.preprocessingService.addProjectionPositions(
        result.method,
        result.positions
      );

      // Update both the collection AND reload the dataset to trigger UI refresh
      const state = this.preprocessingService.currentState;
      if (state.processedDataset) {
        const collection = state.processedDataset as any;
        const datasetKey = collection.selectedDataset ||
          (collection.datasets ? Object.keys(collection.datasets)[0] : null);

        if (datasetKey && collection.datasets) {
          const dataset = collection.datasets[datasetKey];
          if (dataset) {
            // Update the collection entry with the new projection
            this.dataProvider.addProcessedDatasetToCollection(
              state.datasetName,
              state.timestamp,
              dataset
            );

            // Force reload to trigger Canvas refresh
            this.dataProvider.loadProcessedDataset(
              dataset,
              state.datasetName,
              state.timestamp
            );
          }
        }
      }

      console.log(`${name} projection complete in ${(result.computeTime / 1000).toFixed(1)}s`);

      // TODO: Show toast notification when implemented
      // this.showToast(
      //   `${name} projection ready! (${(result.computeTime / 1000).toFixed(1)}s)`,
      //   'success'
      // );

    } catch (error: any) {
      console.error(`${name} projection failed:`, error);
      // TODO: Show error toast when implemented
      // this.showToast(`${name} projection failed: ${error.message}`, 'error');
    }
  }

  /**
   * Navigate to dashboard with processed data
   */
  goToDashboard(): void {
    const state = this.preprocessingService.currentState;

    // Load the processed dataset into the data provider and add to collection
    if (state.processedDataset) {
      // The worker returns a structure that differs from the strict DatasetCollection interface
      // It returns { datasets: { key: data }, selectedDataset: key }
      // We cast to any to handle this runtime structure
      const collection = state.processedDataset as any;

      const datasetKey = collection.selectedDataset ||
        (collection.datasets ? Object.keys(collection.datasets)[0] : null);

      if (!datasetKey || !collection.datasets) {
        console.error('Invalid dataset structure:', collection);
        this.error = 'Invalid dataset structure. Please try processing again.';
        return;
      }

      const dataset = collection.datasets[datasetKey];

      if (dataset) {
        // CRITICAL: Add to collection FIRST so the entry exists when loadProcessedDataset triggers canvas reload
        this.dataProvider.addProcessedDatasetToCollection(
          state.datasetName,
          state.timestamp,
          dataset
        );

        // Then load the dataset (this will trigger canvas to reload and call getGlyphData)
        this.dataProvider.loadProcessedDataset(
          dataset,
          state.datasetName,
          state.timestamp
        );
      } else {
        console.error('Dataset not found for key:', datasetKey);
        this.error = 'Failed to load processed dataset';
      }
    }

    // Emit finish event to close the wizard
    this.finish.emit();
  }

  /**
   * Go back to edit configuration
   */
  goBack(): void {
    this.preprocessingService.previousStep();
  }

  /**
   * Start over with new data
   */
  startOver(): void {
    if (confirm('Are you sure you want to start over? All current configuration will be lost.')) {
      this.preprocessingService.resetState();
      this.preprocessingService.goToStep(0);
    }
  }

  /**
   * Get background projections as array for template iteration
   */
  getBackgroundProjectionsArray(): Array<{ method: string; status: string; progress: number; message: string }> {
    const result: Array<{ method: string; status: string; progress: number; message: string }> = [];
    this.backgroundProjections.forEach((value, key) => {
      result.push({ method: key, ...value });
    });
    return result;
  }
}
