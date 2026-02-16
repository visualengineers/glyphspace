import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataLoaderService } from '../../../services/data-loader.service';
import { ProjectionService, ProjectionResult } from '../../../services/projection.service';
import { ToastService } from '../../../services/toast.service';
import { ColumnConfig, ProjectionConfig } from '../../models/column-config';
import { DataType, getEncodingLabel as encLabelFn, getScalingLabel as scaleLabelFn } from '../../models/data-type.enum';
import { STEP_INFO } from '../../shared/constants/step-info';
import { DataTypeBadgeComponent } from '../../shared/data-type-badge/data-type-badge.component';

@Component({
  selector: 'app-step5-review-processing',
  standalone: true,
  imports: [DataTypeBadgeComponent],
  templateUrl: './step5-review-processing.component.html',
  styleUrl: './step5-review-processing.component.scss',
})
export class Step5ReviewProcessingComponent implements OnInit, OnDestroy {
  @Output() wizardFinish = new EventEmitter<void>();
  getEncodingLabel = encLabelFn;
  getScalingLabel = scaleLabelFn;

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
  private backgroundDatasetName = '';
  private backgroundTimestamp = '';

  // Expose enums
  DataType = DataType;

  readonly stepInfo = STEP_INFO[4]; // Step 5 (index 4)

  private progressSubscription?: Subscription;
  private backgroundStatusSubscription?: Subscription;

  constructor(
    public preprocessingService: PreprocessingService,
    private dataLoader: DataLoaderService,
    private projectionService: ProjectionService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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

  // ============================================================================
  // Processing
  // ============================================================================

  private resetProcessingState(): void {
    this.processingComplete = false;
    this.isProcessing = false;
    this.processingProgress = 0;
    this.processingStep = '';
    this.error = null;
    this.showProcessing = false;
  }

  private updateProcessingUI(step: string, progress: number): void {
    this.ngZone.run(() => {
      this.processingStep = step;
      this.processingProgress = progress;
      this.cdr.detectChanges();
    });
  }

  async startProcessing(): Promise<void> {
    this.resetProcessingState();
    this.showProcessing = true;
    this.isProcessing = true;
    this.processingStep = 'Initializing...';

    this.progressSubscription = this.preprocessingService.processingProgress.subscribe({
      next: progress => {
        this.processingStep = progress.message || progress.step;
        this.processingProgress = Math.min(progress.progress, 70);
        this.cdr.detectChanges();
      },
    });

    try {
      await this.preprocessingService.processData();

      this.updateProcessingUI('Loading features for projections...', 70);

      const csvText = await this.preprocessingService.getProcessedFeaturesCSV();
      const { features, ids } = this.projectionService.parseCSVFeatures(csvText);

      this.updateProcessingUI('Computing FastMap projection...', 75);

      // Use FastMap as the primary projection
      const fastmapResult = await this.projectionService.runFastMapSync(features, ids);

      this.updateProcessingUI('Loading dataset with FastMap...', 90);

      await this.preprocessingService.addProjectionPositions('fastmap', fastmapResult.positions);

      this.ngZone.run(() => {
        this.processingProgress = 100;
        this.processingStep = `Dataset loaded with FastMap (${fastmapResult.computeTime}ms)`;
        this.processingComplete = true;
        this.isProcessing = false;
        this.cdr.detectChanges();
      });

      this.startBackgroundProjections(features, ids);
    } catch (error: unknown) {
      console.error('Processing failed:', error);
      this.ngZone.run(() => {
        this.error = error instanceof Error ? error.message : 'Processing failed';
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

  private async startBackgroundProjections(features: number[][], ids: (string | number)[]): Promise<void> {
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
            message: status.message,
          });
        });
        this.cdr.detectChanges();
      });
    });

    // Data-driven projection registry: each entry maps a config flag to its runner
    const projections: { enabled: boolean; name: string; run: () => Promise<ProjectionResult> }[] = [
      { enabled: config.enablePCA, name: 'PCA', run: () => this.projectionService.runPCABackground(features, ids) },
      {
        enabled: config.enableIsoMap,
        name: 'IsoMap',
        run: () => this.projectionService.runIsoMap(features, ids, { neighbors: config.isomapNeighbors }),
      },
      { enabled: config.enableMDS, name: 'MDS', run: () => this.projectionService.runMDS(features, ids) },
      {
        enabled: config.enableLLE,
        name: 'LLE',
        run: () => this.projectionService.runLLE(features, ids, { neighbors: config.lleNeighbors }),
      },
      {
        enabled: config.enableLTSA,
        name: 'LTSA',
        run: () => this.projectionService.runLTSA(features, ids, { neighbors: config.ltsaNeighbors }),
      },
      {
        enabled: config.enableTSNE,
        name: 't-SNE',
        run: () =>
          this.projectionService.runTSNE(features, ids, {
            perplexity: config.tsnePerplexity,
            iterations: config.tsneIterations,
          }),
      },
      {
        enabled: config.enableUMAP,
        name: 'UMAP',
        run: () =>
          this.projectionService.runUMAP(features, ids, {
            neighbors: config.umapNeighbors,
            minDist: config.umapMinDist,
          }),
      },
      {
        enabled: config.enableTriMap,
        name: 'TriMap',
        run: () => this.projectionService.runTriMap(features, ids, { weightAdj: config.trimapWeightAdj }),
      },
      { enabled: config.enableTopoMap, name: 'TopoMap', run: () => this.projectionService.runTopoMap(features, ids) },
      { enabled: config.enableSammon, name: 'Sammon', run: () => this.projectionService.runSammon(features, ids) },
    ];

    for (const proj of projections) {
      if (proj.enabled) {
        this.runBackgroundProjection(proj.name, proj.run);
      }
    }
  }

  private async runBackgroundProjection(name: string, computeFn: () => Promise<ProjectionResult>): Promise<void> {
    try {
      const result = await computeFn();

      // Convert positions to the format expected by DataProvider
      const positionsForProvider = result.positions.map(p => ({
        id: p.id,
        position: { x: p.x, y: p.y },
      }));

      // Try to add to wizard state first (if still active)
      await this.preprocessingService.addProjectionPositions(result.method, result.positions);

      const state = this.preprocessingService.currentState;
      if (state.processedDataset) {
        // Wizard still active - update via normal flow
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- processedDataset is an opaque structure from Python processing
        const collection = state.processedDataset as any;
        const datasetKey =
          collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

        if (datasetKey && collection.datasets) {
          const dataset = collection.datasets[datasetKey];
          if (dataset) {
            this.dataLoader.addProcessedDatasetToCollection(state.datasetName, state.timestamp, dataset);
            this.dataLoader.loadProcessedDataset(dataset, state.datasetName, state.timestamp);
          }
        }
      } else if (this.backgroundDatasetName && this.backgroundTimestamp) {
        // Wizard was reset but dataset is already loaded in dashboard
        this.dataLoader.addPositionsToLoadedDataset(
          this.backgroundDatasetName,
          this.backgroundTimestamp,
          result.method,
          positionsForProvider
        );
        // Re-save to IndexedDB with the new projection included
        this.dataLoader.saveDatasetToStorage(this.backgroundDatasetName, this.backgroundTimestamp);
      }

      this.ngZone.run(() => {
        this.toastService.success(`${name} projection ready! (${(result.computeTime / 1000).toFixed(1)}s)`, 4000);
      });
    } catch (error: unknown) {
      console.error(`${name} projection failed:`, error);
      this.ngZone.run(() => {
        this.toastService.error(
          `${name} projection failed: ${error instanceof Error ? error.message : String(error)}`,
          6000
        );
      });
    }
  }

  goToDashboard(): void {
    const state = this.preprocessingService.currentState;

    if (state.processedDataset) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- processedDataset is an opaque structure from Python processing
      const collection = state.processedDataset as any;
      const datasetKey =
        collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

      if (!datasetKey || !collection.datasets) {
        this.error = 'Invalid dataset structure. Please try processing again.';
        return;
      }

      const dataset = collection.datasets[datasetKey];

      if (dataset) {
        this.dataLoader.addProcessedDatasetToCollection(state.datasetName, state.timestamp, dataset);
        this.dataLoader.loadProcessedDataset(dataset, state.datasetName, state.timestamp);
        // Persist to IndexedDB for cross-session survival
        this.dataLoader.saveDatasetToStorage(state.datasetName, state.timestamp);
      } else {
        this.error = 'Failed to load processed dataset';
        return;
      }
    }

    // Reset wizard state so it's ready for a new upload
    this.preprocessingService.resetState();

    this.wizardFinish.emit();
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
      this.resetProcessingState();

      // Reset wizard state
      this.preprocessingService.resetState();
      this.preprocessingService.goToStep(0);
    }
  }

  getBackgroundProjectionsArray(): { method: string; status: string; progress: number; message: string }[] {
    const result: { method: string; status: string; progress: number; message: string }[] = [];
    this.backgroundProjections.forEach((value, key) => {
      result.push({ method: key, ...value });
    });
    return result;
  }
}
