import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  PreprocessingState,
  ProcessingProgress,
  DEFAULT_CLEANING_CONFIG,
  DEFAULT_PROJECTION_CONFIG,
} from '../models/preprocessing-state';
import { DataProfile, ColumnStatistics } from '../models/column-statistics';
import { ColumnConfig, CleaningConfig, ProjectionConfig } from '../models/column-config';
import {
  DataType,
  EncodingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod,
  DATA_TYPE_CONFIG,
} from '../models/data-type.enum';
import { DataProcessorService } from '../../services/data-processor';
import { DataLoaderService } from '../../services/data-loader.service';

@Injectable({
  providedIn: 'root',
})
export class PreprocessingService {
  private stateSubject = new BehaviorSubject<PreprocessingState>(this.getInitialState());
  public state$ = this.stateSubject.asObservable();

  private progressSubject = new Subject<ProcessingProgress>();
  public progress$ = this.progressSubject.asObservable();

  constructor(
    private dataProcessor: DataProcessorService,
    private dataLoader: DataLoaderService
  ) {
    // Load saved state from localStorage if available
    this.loadStateFromStorage();
  }

  /**
   * Generate a unique dataset name by appending (1), (2), etc. if name already exists
   */
  private getUniqueDatasetName(baseName: string): string {
    const existingNames = this.dataLoader.getDataSetNames();
    if (!existingNames.includes(baseName)) {
      return baseName;
    }

    // Find the next available number
    let counter = 1;
    let uniqueName = `${baseName} (${counter})`;
    while (existingNames.includes(uniqueName)) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }
    return uniqueName;
  }

  /**
   * Get processing progress updates from worker
   */
  get processingProgress(): Observable<{ step: string; progress: number; message: string }> {
    return this.dataProcessor.processingProgress;
  }

  private getInitialState(): PreprocessingState {
    return {
      currentStep: 0,
      rawFileName: null,
      dataProfile: null,
      columnConfigs: new Map(),
      cleaningConfig: { ...DEFAULT_CLEANING_CONFIG },
      projectionConfig: { ...DEFAULT_PROJECTION_CONFIG },
      cleaningResult: null,
      processedDataset: null,
      datasetName: '',
      timestamp: '',
      glyphFeatures: [],
      tooltipFeatures: [],
      colorScaleMode: 'continuous',
      colorScaleId: 0,
      isProcessing: false,
      processingProgress: 0,
      processingStep: '',
      error: null,
    };
  }

  get currentState(): PreprocessingState {
    return this.stateSubject.getValue();
  }

  // Step navigation (5 steps: 0-4)
  public goToStep(step: number): void {
    if (step >= 0 && step <= 4) {
      this.updateState({ currentStep: step });
    }
  }

  public nextStep(): void {
    const current = this.currentState.currentStep;
    if (current < 4) {
      this.goToStep(current + 1);
    }
  }

  public previousStep(): void {
    const current = this.currentState.currentStep;
    if (current > 0) {
      this.goToStep(current - 1);
    }
  }

  // Data loading and profiling
  public async loadCSV(file: File): Promise<DataProfile> {
    this.updateState({ isProcessing: true, error: null });

    try {
      // Load CSV file directly
      const buffer = await file.arrayBuffer();
      const fileName = file.name;

      // Send file to worker for profiling
      const profile = await this.dataProcessor.profileData(fileName, buffer);

      // Initialize column configurations
      const columnConfigs = new Map<string, ColumnConfig>();
      profile.columns.forEach((col: ColumnStatistics) => {
        columnConfigs.set(col.name, this.createDefaultColumnConfig(col));
      });

      // Generate unique dataset name and timestamp
      const baseName = file.name.replace(/\.csv$/i, '');
      const datasetName = this.getUniqueDatasetName(baseName);
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

      this.updateState({
        dataProfile: profile,
        rawFileName: fileName,
        columnConfigs,
        datasetName,
        timestamp,
        isProcessing: false,
      });

      this.saveStateToStorage();
      return profile;
    } catch (error: unknown) {
      this.updateState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to load data file',
      });
      throw error;
    }
  }

  private createDefaultColumnConfig(col: ColumnStatistics): ColumnConfig {
    const capabilities = DATA_TYPE_CONFIG[col.dataType] ?? DATA_TYPE_CONFIG[DataType.Unknown];

    return {
      name: col.name,
      originalType: col.dataType,
      targetType: col.dataType,
      encodingMethod: capabilities.defaultEncoding,
      scalingMethod: capabilities.defaultScaling,
      includeInProjection: capabilities.defaultIncludeInProjection,
      isColorFeature: false,
      missingValueStrategy: MissingValueStrategy.Keep,
      outlierMethod: OutlierMethod.IQR_1_5,
      outlierStrategy: OutlierStrategy.Keep,
      enabled: true,
      hasIssues: col.missingPercentage > 50 || col.uniqueCount === 1,
    };
  }

  // Column configuration
  public updateColumnConfig(columnName: string, updates: Partial<ColumnConfig>): void {
    const configs = this.currentState.columnConfigs;
    const existing = configs.get(columnName);

    if (existing) {
      configs.set(columnName, { ...existing, ...updates });
      this.updateState({ columnConfigs: new Map(configs) });
      this.saveStateToStorage();
    }
  }

  public setColorFeature(columnName: string): void {
    const configs = this.currentState.columnConfigs;

    // Clear previous color feature
    configs.forEach((config, name) => {
      config.isColorFeature = name === columnName;
    });

    // Auto-detect color scale mode based on data type
    const colorConfig = configs.get(columnName);
    let colorScaleMode: 'continuous' | 'categorical' = 'continuous';

    if (colorConfig) {
      // Categorical or Text data types should use categorical color scale
      if (
        colorConfig.originalType === DataType.Categorical ||
        colorConfig.originalType === DataType.Text ||
        colorConfig.targetType === DataType.Categorical ||
        colorConfig.targetType === DataType.Text
      ) {
        colorScaleMode = 'categorical';
      }
      // Numeric data types use continuous color scale
      else if (colorConfig.originalType === DataType.Numeric || colorConfig.targetType === DataType.Numeric) {
        colorScaleMode = 'continuous';
      }
    }

    // Auto-select matching default scale if current scale type doesn't match
    const currentScaleId = this.currentState.colorScaleId;
    let colorScaleId = currentScaleId;
    const isCategorical = colorScaleMode === 'categorical';
    // Default numeric scales: 0-3, categorical scales: 4-5
    const currentIsCategorical = currentScaleId >= 4;
    if (isCategorical !== currentIsCategorical) {
      colorScaleId = isCategorical ? 4 : 0;
    }

    this.updateState({
      columnConfigs: new Map(configs),
      colorScaleMode: colorScaleMode,
      colorScaleId: colorScaleId,
    });
    this.saveStateToStorage();
  }

  public setColorScaleId(id: number): void {
    this.updateState({ colorScaleId: id });
    this.saveStateToStorage();
  }

  // Glyph feature mapping
  public setGlyphFeatures(features: string[]): void {
    // Validate 3-12 features
    if (features.length < 3 || features.length > 12) {
      throw new Error('3-12 glyph features required');
    }
    this.updateState({ glyphFeatures: features });
    this.saveStateToStorage();
  }

  public getPreviewFeatureNames(): string[] {
    // Returns predicted feature names after encoding
    return this.predictEncodedFeatureNames();
  }

  private predictEncodedFeatureNames(): string[] {
    const state = this.currentState;
    const featureNames: string[] = [];

    const enabledCols = Array.from(state.columnConfigs.values()).filter(
      config => config.enabled && config.originalType !== DataType.ID
    );

    for (const col of enabledCols) {
      if (col.encodingMethod === EncodingMethod.OneHot) {
        // Predict one-hot expansion based on unique values from data profile
        const colStats = state.dataProfile?.columns.find(c => c.name === col.name);
        if (colStats && colStats.topValues) {
          // Generate predicted column names: columnName_value
          colStats.topValues.forEach(item => {
            featureNames.push(`${col.name}_${item.value}`);
          });
        }
      } else {
        // Label encoding, numeric, or no encoding - keeps column name
        featureNames.push(col.name);
      }
    }

    return featureNames;
  }

  public toggleColumnEnabled(columnName: string): void {
    const config = this.currentState.columnConfigs.get(columnName);
    if (config) {
      this.updateColumnConfig(columnName, { enabled: !config.enabled });
    }
  }

  public selectAllColumns(): void {
    const configs = this.currentState.columnConfigs;
    configs.forEach(config => (config.enabled = true));
    this.updateState({ columnConfigs: new Map(configs) });
    this.saveStateToStorage();
  }

  public deselectAllColumns(): void {
    const configs = this.currentState.columnConfigs;
    configs.forEach(config => {
      if (config.originalType !== DataType.ID) {
        config.enabled = false;
      }
    });
    this.updateState({ columnConfigs: new Map(configs) });
    this.saveStateToStorage();
  }

  // Cleaning configuration
  public updateCleaningConfig(updates: Partial<CleaningConfig>): void {
    this.updateState({
      cleaningConfig: { ...this.currentState.cleaningConfig, ...updates },
    });
    this.saveStateToStorage();
  }

  // Projection configuration
  public updateProjectionConfig(updates: Partial<ProjectionConfig>): void {
    this.updateState({
      projectionConfig: { ...this.currentState.projectionConfig, ...updates },
    });
    this.saveStateToStorage();
  }

  // Outlier detection
  public async detectOutliers(
    columnName: string,
    method: OutlierMethod
  ): Promise<{ outlierCount: number; outlierIndices: number[] }> {
    if (!this.currentState.rawFileName) {
      throw new Error('No data file loaded');
    }

    const result = await this.dataProcessor.detectOutliers(this.currentState.rawFileName, columnName, method);

    return {
      outlierCount: result.outlier_count,
      outlierIndices: result.outlier_indices,
    };
  }

  // Duplicate detection
  public async detectDuplicates(subsetColumns?: string[]): Promise<{
    duplicateCount: number;
    duplicateIndices: number[];
    percentage: number;
    sampleDuplicates: Record<string, unknown>[];
  }> {
    if (!this.currentState.rawFileName) {
      throw new Error('No data file loaded');
    }

    const result = await this.dataProcessor.detectDuplicates(this.currentState.rawFileName, subsetColumns);

    return {
      duplicateCount: result.duplicateCount,
      duplicateIndices: result.duplicateIndices,
      percentage: result.percentage,
      sampleDuplicates: result.sampleDuplicates,
    };
  }

  // Processing
  public async processData(): Promise<void> {
    // Validate that we have the necessary metadata
    if (!this.currentState.rawFileName || !this.currentState.dataProfile) {
      throw new Error('No data file loaded. Please upload a file first.');
    }

    this.updateState({
      isProcessing: true,
      processingProgress: 0,
      error: null,
    });

    try {
      // Build configuration object
      const config = this.buildProcessingConfig();

      // File is already in Pyodide FS from loadCSV() - no need to re-upload
      // Send to worker for processing (use rawFileName which is the actual CSV file in Pyodide FS)
      const result = await this.dataProcessor.processWithConfig(this.currentState.rawFileName, config);

      this.updateState({
        processedDataset: result,
        isProcessing: false,
        processingProgress: 100,
      });

      this.saveStateToStorage();
    } catch (error: unknown) {
      this.updateState({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      });
      throw error;
    }
  }

  /**
   * Get processed features CSV exported by Python for JavaScript projections
   */
  public async getProcessedFeaturesCSV(): Promise<string> {
    return await this.dataProcessor.getProcessedFeatures();
  }

  /**
   * Add projection positions to the processed dataset
   * Silently returns if wizard was reset (user moved on)
   */
  public async addProjectionPositions(
    method: string,
    positions: { id: string | number; x: number; y: number }[]
  ): Promise<void> {
    const state = this.currentState;

    // If wizard was reset while background projection was running, silently skip
    // (user has already moved on to dashboard)
    if (!state.processedDataset) {
      return;
    }

    // The dataset structure from worker
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection = state.processedDataset as any;
    const datasetKey = collection.selectedDataset || (collection.datasets ? Object.keys(collection.datasets)[0] : null);

    if (!datasetKey || !collection.datasets) {
      throw new Error('Invalid dataset structure');
    }

    const dataset = collection.datasets[datasetKey];

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    // Initialize positions object if it doesn't exist
    if (!dataset.positions) {
      dataset.positions = {};
    }

    // Convert positions to the format expected by DataProvider
    // Format: [{id: x, position: {x: ..., y: ...}}]
    // Always normalize IDs to string for consistency
    dataset.positions[method] = positions.map(p => ({
      id: String(p.id),
      position: { x: p.x, y: p.y },
    }));

    // Update state to trigger any observers
    this.updateState({ processedDataset: collection });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildProcessingConfig(): any {
    const state = this.currentState;

    return {
      datasetName: state.datasetName,
      timestamp: state.timestamp,
      columns: Array.from(state.columnConfigs.values()).map(col => ({
        name: col.name,
        enabled: col.enabled,
        dataType: col.targetType,
        encoding: col.encodingMethod,
        scaling: col.scalingMethod,
        includeInProjection: col.includeInProjection,
        isColorFeature: col.isColorFeature,
        missingValueStrategy: col.missingValueStrategy,
        missingValueFillValue: col.missingValueFillValue,
        outlierMethod: col.outlierMethod,
        outlierStrategy: col.outlierStrategy,
      })),
      cleaning: state.cleaningConfig,
      projections: state.projectionConfig,
      // Glyph and tooltip feature mappings
      glyphFeatures: state.glyphFeatures,
      tooltipFeatures: state.tooltipFeatures.length > 0 ? state.tooltipFeatures : null,
      colorScaleMode: state.colorScaleMode,
      colorScaleId: state.colorScaleId,
    };
  }

  // State management
  private updateState(updates: Partial<PreprocessingState>): void {
    this.stateSubject.next({ ...this.currentState, ...updates });
  }

  public resetState(): void {
    this.stateSubject.next(this.getInitialState());
    this.clearStateFromStorage();
  }

  // Persistence
  private saveStateToStorage(): void {
    try {
      const state = this.currentState;
      const serializable = {
        currentStep: state.currentStep,
        dataProfile: state.dataProfile,
        rawFileName: state.rawFileName,
        columnConfigs: Array.from(state.columnConfigs.entries()),
        cleaningConfig: state.cleaningConfig,
        projectionConfig: state.projectionConfig,
        datasetName: state.datasetName,
        timestamp: state.timestamp,
        glyphFeatures: state.glyphFeatures,
        tooltipFeatures: state.tooltipFeatures,
      };

      localStorage.setItem('glyphspace_preprocessing_state', JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const saved = localStorage.getItem('glyphspace_preprocessing_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.updateState({
          currentStep: parsed.currentStep,
          dataProfile: parsed.dataProfile,
          rawFileName: parsed.rawFileName,
          columnConfigs: new Map(parsed.columnConfigs),
          cleaningConfig: parsed.cleaningConfig,
          projectionConfig: parsed.projectionConfig,
          datasetName: parsed.datasetName,
          timestamp: parsed.timestamp,
          glyphFeatures: parsed.glyphFeatures || [],
          tooltipFeatures: parsed.tooltipFeatures || [],
        });
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }

  private clearStateFromStorage(): void {
    localStorage.removeItem('glyphspace_preprocessing_state');
  }
}
