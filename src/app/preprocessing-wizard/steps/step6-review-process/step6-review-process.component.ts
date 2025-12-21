import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ColumnConfig } from '../../models/column-config';
import { DataType, EncodingMethod, ScalingMethod, MissingValueStrategy, OutlierStrategy } from '../../models/data-type.enum';
import { DataProviderService } from '../../../services/dataprovider.service';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { STEP_INFO } from '../../shared/constants/step-info';

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

  // Expose enums to template
  DataType = DataType;
  EncodingMethod = EncodingMethod;
  ScalingMethod = ScalingMethod;

  // Expose step info to template
  readonly stepInfo = STEP_INFO[5]; // Step 6 (index 5)

  private progressSubscription?: Subscription;

  constructor(
    public preprocessingService: PreprocessingService,
    private dataProvider: DataProviderService,
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
    if (proj.enableTSNE) this.enabledMethods.push('t-SNE');
    if (proj.enableUMAP) this.enabledMethods.push('UMAP');
  }

  ngOnDestroy(): void {
    // Clean up subscription on component destroy
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
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
   * Start data processing
   */
  async startProcessing(): Promise<void> {
    this.isProcessing = true;
    this.processingProgress = 0;
    this.processingStep = 'Initializing...';
    this.error = null;

    // Subscribe to progress updates from worker BEFORE starting processing
    this.progressSubscription = this.preprocessingService.processingProgress.subscribe({
      next: (progress) => {
        console.log('Progress update:', progress); // Debug log
        this.processingStep = progress.message || progress.step;
        this.processingProgress = progress.progress;
        this.cdr.detectChanges(); // Force UI update on progress
      },
      error: (err) => {
        console.error('Progress update error:', err);
      }
    });

    try {
      // Start actual processing
      await this.preprocessingService.processData();

      // Run completion inside Angular zone to ensure change detection
      this.ngZone.run(() => {
        // Processing complete - explicitly set flags
        this.processingProgress = 100;
        this.processingStep = 'Processing complete!';
        this.processingComplete = true;
        this.isProcessing = false;

        console.log('Processing flags set:', {
          isProcessing: this.isProcessing,
          processingComplete: this.processingComplete
        });

        // CRITICAL: Trigger change detection to update the template
        this.cdr.detectChanges();
      });

    } catch (error: any) {
      console.error('Processing failed:', error);
      this.ngZone.run(() => {
        this.error = error.message || 'Processing failed';
        this.isProcessing = false;
        this.cdr.detectChanges(); // Trigger change detection for error state
      });
    } finally {
      // Clean up subscription
      if (this.progressSubscription) {
        this.progressSubscription.unsubscribe();
        this.progressSubscription = undefined;
      }
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
}
