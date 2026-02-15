import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataProviderService } from '../../../services/dataprovider.service';
import { ProjectionService, ProjectionResult } from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { DataType, EncodingMethod, ScalingMethod, getDataTypeBadgeClass as badgeClassFn } from '../../models/data-type.enum';
import { STEP_INFO } from '../../shared/constants/step-info';

@Component({
  selector: 'app-step5-review-processing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step5-review-processing.component.html',
  styleUrl: './step5-review-processing.component.scss'
})
export class Step5ReviewProcessingComponent implements OnInit, OnDestroy {
  @Output() finish = new EventEmitter<void>();
  getDataTypeBadgeClass = badgeClassFn;

  // Review/Summary data
  totalColumns = 0;
  enabledColumns = 0;
  projectionColumns = 0;
  enabledMethods: string[] = [];
  columnConfigs: ColumnConfig[] = [];
  colorFeature: string | null = null;
  selectedGlyphFeatures: string[] = [];
  projectionConfig!: ProjectionConfig;

  // Processing state
  isProcessing = false;
  processingProgress = 0;
  processingStep = '';
  processingComplete = false;
  error: string | null = null;
  showProcessing = false;

  // Background projection status
  backgroundProjections = new Map<string, { status: string; progress: number; message: string }>();

  // Capture dataset info for background projections (survives wizard reset)
  private backgroundDatasetName: string = '';
  private backgroundTimestamp: string = '';

  // Expose enums
  DataType = DataType;

  readonly stepInfo = STEP_INFO[4]; // Step 5 (index 4)

  private progressSubscription?: Subscription;
  private backgroundStatusSubscription?: Subscription;

  constructor(
    public preprocessingService: PreprocessingService,
    private dataProvider: DataProviderService,
    private projectionService: ProjectionService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Load color feature
    const colorCol = Array.from(state.columnConfigs.values()).find(c => c.isColorFeature);
    this.colorFeature = colorCol?.name ?? null;

    // Load glyph features
    this.selectedGlyphFeatures = [...state.glyphFeatures];

    // Load projection config
    this.projectionConfig = { ...state.projectionConfig };

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
    if (this.projectionConfig.enableMDS) this.enabledMethods.push('MDS');
    if (this.projectionConfig.enableLLE) this.enabledMethods.push('LLE');
    if (this.projectionConfig.enableLTSA) this.enabledMethods.push('LTSA');
    if (this.projectionConfig.enableTSNE) this.enabledMethods.push('t-SNE');
    if (this.projectionConfig.enableUMAP) this.enabledMethods.push('UMAP');
    if (this.projectionConfig.enableTriMap) this.enabledMethods.push('TriMap');
    if (this.projectionConfig.enableTopoMap) this.enabledMethods.push('TopoMap');
    if (this.projectionConfig.enableSammon) this.enabledMethods.push('Sammon');
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
    this.showProcessing = true;
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

      // Use FastMap as the primary projection
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

    if (config.enablePCA) {
      this.runBackgroundProjection('PCA', () => this.projectionService.runPCABackground(features, ids));
    }

    if (config.enableIsoMap) {
      this.runBackgroundProjection('IsoMap', () => this.projectionService.runIsoMap(features, ids, {
        neighbors: config.isomapNeighbors
      }));
    }

    if (config.enableMDS) {
      this.runBackgroundProjection('MDS', () => this.projectionService.runMDS(features, ids));
    }

    if (config.enableLLE) {
      this.runBackgroundProjection('LLE', () => this.projectionService.runLLE(features, ids, {
        neighbors: config.lleNeighbors
      }));
    }

    if (config.enableLTSA) {
      this.runBackgroundProjection('LTSA', () => this.projectionService.runLTSA(features, ids, {
        neighbors: config.ltsaNeighbors
      }));
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

    if (config.enableTriMap) {
      this.runBackgroundProjection('TriMap', () => this.projectionService.runTriMap(features, ids, {
        weightAdj: config.trimapWeightAdj
      }));
    }

    if (config.enableTopoMap) {
      this.runBackgroundProjection('TopoMap', () => this.projectionService.runTopoMap(features, ids));
    }

    if (config.enableSammon) {
      this.runBackgroundProjection('Sammon', () => this.projectionService.runSammon(features, ids));
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
        this.dataProvider.addPositionsToLoadedDataset(
          this.backgroundDatasetName,
          this.backgroundTimestamp,
          result.method,
          positionsForProvider
        );
        // Re-save to IndexedDB with the new projection included
        this.dataProvider.saveDatasetToStorage(this.backgroundDatasetName, this.backgroundTimestamp);
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
        // Persist to IndexedDB for cross-session survival
        this.dataProvider.saveDatasetToStorage(state.datasetName, state.timestamp);
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
      // Terminate any running background projection workers
      this.projectionService.terminateAllWorkers();
      this.projectionService.clearBackgroundStatuses();

      // Clear local state
      this.backgroundProjections.clear();
      this.processingComplete = false;
      this.isProcessing = false;
      this.processingProgress = 0;
      this.processingStep = '';
      this.error = null;
      this.showProcessing = false;

      // Reset wizard state
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
