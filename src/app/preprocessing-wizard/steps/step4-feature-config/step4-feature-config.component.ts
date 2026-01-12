import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ColumnConfig } from '../../models/column-config';
import { ColumnStatistics } from '../../models/column-statistics';
import { DataType, EncodingMethod, ScalingMethod } from '../../models/data-type.enum';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';

@Component({
  selector: 'app-step4-feature-config',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent],
  templateUrl: './step4-feature-config.component.html',
  styleUrl: './step4-feature-config.component.scss'
})
export class Step4FeatureConfigComponent implements OnInit {
  columns: ColumnStatistics[] = [];
  columnConfigs: Map<string, ColumnConfig> = new Map();
  colorFeature: string | null = null;

  // Glyph feature mapping
  availableFeatures: string[] = [];
  selectedGlyphFeatures: string[] = [];
  suggestedFeatures: string[] = [];
  featureVariances: Map<string, number> = new Map();

  // Drag & drop state
  draggedFeature: string | null = null;
  draggedFromList: 'selected' | 'available' = 'available';
  draggedIndex: number = -1;

  // Tooltip customization
  useCustomTooltip = false;
  selectedTooltipFeatures: string[] = [];

  // Expose enums and Array to template
  DataType = DataType;
  EncodingMethod = EncodingMethod;
  ScalingMethod = ScalingMethod;
  Array = Array;

  // Enum value arrays for dropdowns (Label encoding is now default for categorical)
  encodingMethods = [
    { value: EncodingMethod.None, label: 'None', description: 'Keep original values' },
    { value: EncodingMethod.Label, label: 'Label (Recommended)', description: 'Integer encoding (0, 1, 2...)' },
    { value: EncodingMethod.OneHot, label: 'One-Hot', description: 'Binary columns per category' },
    { value: EncodingMethod.Normalize, label: 'Normalize', description: 'Scale to [0, 1]' },
    { value: EncodingMethod.Standardize, label: 'Standardize', description: 'Z-score normalization' }
  ];

  scalingMethods = [
    { value: ScalingMethod.None, label: 'None', description: 'No scaling' },
    { value: ScalingMethod.Standard, label: 'Standard', description: 'Z-score (mean=0, std=1)' },
    { value: ScalingMethod.MinMax, label: 'Min-Max', description: 'Scale to [0, 1]' },
    { value: ScalingMethod.Robust, label: 'Robust', description: 'Use median and IQR' }
  ];

  // Expose help text and step info to template
  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[3]; // Step 4 (index 3)

  constructor(public preprocessingService: PreprocessingService) {}

  ngOnInit(): void {
    const state = this.preprocessingService.currentState;

    // Get columns from data profile
    if (state.dataProfile) {
      this.columns = state.dataProfile.columns.filter(col => {
        const config = state.columnConfigs.get(col.name);
        return config && config.enabled;
      });
    }

    this.columnConfigs = state.columnConfigs;
    // Color feature needs to be tracked separately - use first numeric column as default
    const numericCol = this.columns.find(c => c.dataType === DataType.Numeric);
    this.colorFeature = numericCol ? numericCol.name : (this.columns.length > 0 ? this.columns[0].name : null);

    // Initialize glyph feature mapping
    this.updateAvailableFeatures();
    this.calculateSmartSuggestions();

    // Load saved selections or apply suggestions
    if (state.glyphFeatures.length === 5) {
      this.selectedGlyphFeatures = [...state.glyphFeatures];
    } else {
      this.applySuggestedFeatures();
    }
  }

  /**
   * Get column config by column name
   */
  getConfig(columnName: string): ColumnConfig | undefined {
    return this.columnConfigs.get(columnName);
  }

  /**
   * Get available encoding methods for a column based on its data type
   */
  getAvailableEncodingMethods(column: ColumnStatistics) {
    const dataType = column.dataType;

    switch (dataType) {
      case DataType.Numeric:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Normalize, EncodingMethod.Standardize].includes(m.value)
        );
      case DataType.Categorical:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.OneHot, EncodingMethod.Label].includes(m.value)
        );
      case DataType.Text:
        // Allow One-Hot encoding for Text columns to see distribution
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.OneHot, EncodingMethod.Label].includes(m.value)
        );
      case DataType.Boolean:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Label].includes(m.value)
        );
      case DataType.Date:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Normalize].includes(m.value)
        );
      default:
        return this.encodingMethods.filter(m =>
          [EncodingMethod.None, EncodingMethod.Label].includes(m.value)
        );
    }
  }

  /**
   * Check if scaling methods should be shown for this column
   */
  shouldShowScaling(column: ColumnStatistics): boolean {
    const dataType = column.dataType;
    return dataType === DataType.Numeric || dataType === DataType.Date;
  }

  /**
   * Update encoding method for a column
   */
  onEncodingChange(columnName: string, method: EncodingMethod): void {
    this.preprocessingService.updateColumnConfig(columnName, { encodingMethod: method });

    // Refresh available features after encoding change
    this.updateAvailableFeatures();
    this.calculateSmartSuggestions();

    // Validate current selection - remove features that no longer exist
    this.selectedGlyphFeatures = this.selectedGlyphFeatures.filter(
      f => this.availableFeatures.includes(f)
    );

    // Re-suggest if selection is now invalid
    if (this.selectedGlyphFeatures.length < 5) {
      this.applySuggestedFeatures();
    }
  }

  /**
   * Update scaling method for a column
   */
  onScalingChange(columnName: string, method: ScalingMethod): void {
    this.preprocessingService.updateColumnConfig(columnName, { scalingMethod: method });
  }

  /**
   * Toggle whether a column should be included in projection
   */
  toggleProjection(columnName: string): void {
    const config = this.columnConfigs.get(columnName);
    if (config) {
      this.preprocessingService.updateColumnConfig(columnName, { includeInProjection: !config.includeInProjection });
    }
  }

  /**
   * Set color feature for visualization
   */
  setColorFeature(columnName: string): void {
    this.colorFeature = columnName;
    this.preprocessingService.setColorFeature(columnName);
  }

  /**
   * Get data type badge CSS class
   */
  getDataTypeBadgeClass(dataType: DataType | undefined): string {
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
   * Get count of columns included in projection
   */
  getProjectionCount(): number {
    return Array.from(this.columnConfigs.values()).filter(c => c.enabled && c.includeInProjection).length;
  }

  /**
   * Check if configuration is valid to continue
   */
  canContinue(): boolean {
    // At least one column must be included in projection AND exactly 5 glyph features selected
    return this.getProjectionCount() > 0 && this.selectedGlyphFeatures.length === 5;
  }

  /**
   * Continue to next step
   */
  onContinue(): void {
    if (this.canContinue()) {
      this.preprocessingService.nextStep();
    }
  }

  // ============================================================================
  // Glyph Feature Mapping Methods
  // ============================================================================

  /**
   * Update available features based on encoding configuration
   */
  updateAvailableFeatures(): void {
    this.availableFeatures = this.preprocessingService.getPreviewFeatureNames();
  }

  /**
   * Calculate variance-based smart suggestions
   */
  calculateSmartSuggestions(): void {
    const state = this.preprocessingService.currentState;
    const profile = state.dataProfile;

    if (!profile) return;

    const featureScores: Array<{name: string; score: number}> = [];

    for (const feature of this.availableFeatures) {
      // Get base column name (before one-hot suffix)
      const baseColName = feature.split('_')[0];
      const colStats = profile.columns.find(c => c.name === baseColName);

      if (!colStats) continue;

      let score = 0;

      if (colStats.dataType === DataType.Numeric && colStats.variance !== undefined) {
        // Use actual variance for numeric columns
        score = colStats.variance;
        this.featureVariances.set(feature, score);
      } else if (colStats.dataType === DataType.Categorical) {
        // Use normalized entropy as score for categorical
        const maxPossible = colStats.count;
        score = colStats.uniqueCount / maxPossible;
        this.featureVariances.set(feature, score);
      } else {
        // Other types: use uniqueCount as proxy
        score = colStats.uniqueCount;
        this.featureVariances.set(feature, score);
      }

      featureScores.push({ name: feature, score });
    }

    // Sort by score descending
    featureScores.sort((a, b) => b.score - a.score);

    // Take top 5 (or all if < 5)
    this.suggestedFeatures = featureScores
      .slice(0, Math.min(5, featureScores.length))
      .map(f => f.name);
  }

  /**
   * Apply smart suggestions to selection
   */
  applySuggestedFeatures(): void {
    if (this.suggestedFeatures.length === 0) {
      this.calculateSmartSuggestions();
    }

    this.selectedGlyphFeatures = [...this.suggestedFeatures.slice(0, 5)];

    // Pad with cycling through available features if < 5
    while (this.selectedGlyphFeatures.length < 5 && this.availableFeatures.length > 0) {
      const cycleIndex = this.selectedGlyphFeatures.length % this.availableFeatures.length;
      const nextFeature = this.availableFeatures[cycleIndex];

      if (!this.selectedGlyphFeatures.includes(nextFeature)) {
        this.selectedGlyphFeatures.push(nextFeature);
      } else {
        // Already selected - allow duplicates for padding
        this.selectedGlyphFeatures.push(nextFeature);
      }
    }

    this.saveGlyphFeatures();
  }

  /**
   * Drag & Drop Handlers (Native HTML5)
   */
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
      // Add to selection if < 5
      if (this.selectedGlyphFeatures.length < 5 && !this.isFeatureSelected(this.draggedFeature)) {
        this.selectedGlyphFeatures.push(this.draggedFeature);
        this.saveGlyphFeatures();
      }
    } else if (this.draggedFromList === 'selected') {
      // Reorder within selection
      // TODO: implement reordering based on drop position
    }

    this.onDragEnd(event);
  }

  /**
   * Add/Remove features
   */
  addGlyphFeature(feature: string): void {
    if (this.selectedGlyphFeatures.length >= 5) {
      return; // Already at max
    }

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

  getFeatureDisplayName(feature: string): string {
    // Optionally use feature labels from config
    return feature;
  }

  /**
   * Save to service
   */
  saveGlyphFeatures(): void {
    if (this.selectedGlyphFeatures.length === 5) {
      this.preprocessingService.setGlyphFeatures(this.selectedGlyphFeatures);
    }
  }

  /**
   * Tooltip customization toggle
   */
  onTooltipCustomizationToggle(): void {
    if (!this.useCustomTooltip) {
      // Reset to all features
      this.selectedTooltipFeatures = [];
      this.preprocessingService.setTooltipFeatures([]);
    }
  }
}
