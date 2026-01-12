import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ProjectionConfig } from '../../models/column-config';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { HELP_TEXT } from '../../shared/constants/help-text';
import { STEP_INFO } from '../../shared/constants/step-info';

interface ProjectionMethod {
  key: keyof Pick<ProjectionConfig, 'enablePCA' | 'enableFastMap' | 'enableTSNE' | 'enableUMAP'>;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-step5-projection-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent],
  templateUrl: './step5-projection-settings.component.html',
  styleUrl: './step5-projection-settings.component.scss'
})
export class Step5ProjectionSettingsComponent implements OnInit {
  projectionConfig: ProjectionConfig = {
    enablePCA: true,
    enableFastMap: false,
    enableTSNE: false,
    enableUMAP: false,
    tsnePerplexity: 30,
    tsneIterations: 1000,
    umapNeighbors: 15,
    umapMinDist: 0.1
  };

  // Constants matching backend limits (public for template access)
  readonly TSNE_WARNING_THRESHOLD = 5000;

  // Expose help text and step info to template
  readonly HELP_TEXT = HELP_TEXT;
  readonly stepInfo = STEP_INFO[4]; // Step 5 (index 4)

  projectionMethods: ProjectionMethod[] = [
    {
      key: 'enablePCA',
      name: 'PCA (Immediate)',
      description: 'Principal Component Analysis - Fast linear projection, shows immediately after processing',
      icon: 'analytics',
      badge: 'Fast',
      disabled: false
    },
    {
      key: 'enableFastMap',
      name: 'FastMap (Background)',
      description: 'Fast distance-preserving projection - Computes in background after PCA',
      icon: 'map',
      badge: 'Medium'
    },
    {
      key: 'enableTSNE',
      name: 't-SNE (Background)',
      description: 'Preserves local structure - Computes in background, may take minutes for large datasets',
      icon: 'bubble_chart',
      badge: 'Slow'
    },
    {
      key: 'enableUMAP',
      name: 'UMAP (Background)',
      description: 'Balances local and global structure - Computes in background after PCA',
      icon: 'scatter_plot',
      badge: 'Slow'
    }
  ];

  constructor(public preprocessingService: PreprocessingService) {}

  ngOnInit(): void {
    // Load current projection config from service
    const state = this.preprocessingService.currentState;
    if (state.projectionConfig) {
      this.projectionConfig = { ...state.projectionConfig };
    }
  }

  /**
   * Check if a method is disabled
   */
  isMethodDisabled(method: ProjectionMethod): boolean {
    return method.disabled || false;
  }

  /**
   * Toggle a projection method on/off
   */
  toggleProjectionMethod(method: ProjectionMethod): void {
    if (this.isMethodDisabled(method)) {
      return;
    }
    this.projectionConfig[method.key] = !this.projectionConfig[method.key];
    this.updateProjectionConfig();
  }

  /**
   * Update t-SNE perplexity
   */
  onTSNEPerplexityChange(value: number): void {
    this.projectionConfig.tsnePerplexity = Math.max(5, Math.min(50, value));
    this.updateProjectionConfig();
  }

  /**
   * Update t-SNE iterations
   */
  onTSNEIterationsChange(value: number): void {
    this.projectionConfig.tsneIterations = Math.max(250, Math.min(5000, value));
    this.updateProjectionConfig();
  }

  /**
   * Update UMAP neighbors
   */
  onUMAPNeighborsChange(value: number): void {
    this.projectionConfig.umapNeighbors = Math.max(2, Math.min(200, value));
    this.updateProjectionConfig();
  }

  /**
   * Update UMAP minimum distance
   */
  onUMAPMinDistChange(value: number): void {
    this.projectionConfig.umapMinDist = Math.max(0.0, Math.min(0.99, value));
    this.updateProjectionConfig();
  }

  /**
   * Update projection config in service
   */
  private updateProjectionConfig(): void {
    // Update the service state by updating each property
    const state = this.preprocessingService.currentState;
    state.projectionConfig = { ...this.projectionConfig };
  }

  /**
   * Check if at least one projection method is enabled
   */
  hasEnabledMethod(): boolean {
    return this.projectionConfig.enablePCA ||
           this.projectionConfig.enableFastMap ||
           this.projectionConfig.enableTSNE ||
           this.projectionConfig.enableUMAP;
  }

  /**
   * Get count of enabled projection methods
   */
  getEnabledMethodsCount(): number {
    let count = 0;
    if (this.projectionConfig.enablePCA) count++;
    if (this.projectionConfig.enableFastMap) count++;
    if (this.projectionConfig.enableTSNE) count++;
    if (this.projectionConfig.enableUMAP) count++;
    return count;
  }

  /**
   * Get dataset row count
   */
  getDatasetRowCount(): number {
    return this.preprocessingService.currentState.dataProfile?.totalRows || 0;
  }

  /**
   * Check if t-SNE should show warning
   */
  shouldShowTSNEWarning(): boolean {
    return this.projectionConfig.enableTSNE &&
           this.getDatasetRowCount() > this.TSNE_WARNING_THRESHOLD;
  }

  /**
   * Get estimated t-SNE time message
   */
  getTSNETimeEstimate(): string {
    const rowCount = this.getDatasetRowCount();
    if (rowCount > 20000) {
      return 'Very large dataset - t-SNE may take 15-30 minutes';
    } else if (rowCount > 10000) {
      return 'Large dataset - t-SNE may take 5-15 minutes';
    } else if (rowCount > 5000) {
      return 'Medium-large dataset - t-SNE may take 2-5 minutes';
    } else if (rowCount > 2000) {
      return 'Medium dataset - t-SNE may take 1-2 minutes';
    }
    return 'Small dataset - t-SNE should complete in under 1 minute';
  }

  /**
   * Continue to next step
   */
  onContinue(): void {
    if (this.hasEnabledMethod()) {
      this.preprocessingService.nextStep();
    }
  }
}
