import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ProjectionConfig } from '../../models/column-config';

interface ProjectionMethod {
  key: keyof Pick<ProjectionConfig, 'enablePCA' | 'enableTSNE' | 'enableUMAP'>;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-step5-projection-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step5-projection-settings.component.html',
  styleUrl: './step5-projection-settings.component.scss'
})
export class Step5ProjectionSettingsComponent implements OnInit {
  projectionConfig: ProjectionConfig = {
    enablePCA: true,
    enableTSNE: false,
    enableUMAP: false,
    enableEPSG: false,
    tsnePerplexity: 30,
    tsneIterations: 1000,
    tsneLearningRate: 200,
    umapNeighbors: 15,
    umapMinDist: 0.1,
    umapMetric: 'euclidean'
  };

  // Constants matching backend limits (public for template access)
  readonly TSNE_WARNING_THRESHOLD = 5000;

  projectionMethods: ProjectionMethod[] = [
    {
      key: 'enablePCA',
      name: 'PCA',
      description: 'Principal Component Analysis - Fast, linear dimensionality reduction',
      icon: 'analytics'
    },
    {
      key: 'enableTSNE',
      name: 't-SNE',
      description: 't-Distributed Stochastic Neighbor Embedding - Preserves local structure',
      icon: 'bubble_chart'
    },
    {
      key: 'enableUMAP',
      name: 'UMAP (Not Available)',
      description: 'UMAP requires umap-learn package which is not available in the browser version. Use desktop version for UMAP support.',
      icon: 'scatter_plot'
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
   * Check if a method is disabled (UMAP not available in browser)
   */
  isMethodDisabled(method: ProjectionMethod): boolean {
    return method.key === 'enableUMAP';
  }

  /**
   * Toggle a projection method on/off
   */
  toggleProjectionMethod(method: ProjectionMethod): void {
    // UMAP is not available in browser version
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
           this.projectionConfig.enableTSNE ||
           this.projectionConfig.enableUMAP;
  }

  /**
   * Get count of enabled projection methods
   */
  getEnabledMethodsCount(): number {
    let count = 0;
    if (this.projectionConfig.enablePCA) count++;
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
