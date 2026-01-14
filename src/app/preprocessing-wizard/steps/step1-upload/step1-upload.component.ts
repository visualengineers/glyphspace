import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreprocessingService } from '../../services/preprocessing.service';
import { DataPreviewTableComponent } from '../../shared/data-preview-table/data-preview-table.component';
import { DataProfile } from '../../models/column-statistics';
import { HelpTooltipComponent } from '../../shared/help-tooltip/help-tooltip.component';
import { STEP_INFO } from '../../shared/constants/step-info';

@Component({
  selector: 'app-step1-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, DataPreviewTableComponent, HelpTooltipComponent],
  templateUrl: './step1-upload.component.html',
  styleUrl: './step1-upload.component.scss'
})
export class Step1UploadComponent {
  @Output() dataLoaded = new EventEmitter<DataProfile>();

  isDragOver = false;
  isLoading = false;
  error: string | null = null;
  profile: DataProfile | null = null;

  // Expose step info to template
  readonly stepInfo = STEP_INFO[0]; // Step 1 (index 0)

  constructor(private preprocessingService: PreprocessingService) {
    // Check if we already have data loaded
    const state = this.preprocessingService.currentState;
    if (state.dataProfile) {
      this.profile = state.dataProfile;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private async handleFile(file: File): Promise<void> {
    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      this.error = 'Please upload a CSV';
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      this.error = 'File size exceeds 50MB limit';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      this.profile = await this.preprocessingService.loadCSV(file);
      this.dataLoaded.emit(this.profile);
    } catch (err: any) {
      this.error = err.message || 'Failed to load data file';
      this.profile = null;
    } finally {
      this.isLoading = false;
    }
  }

  get qualityClass(): string {
    if (!this.profile) return '';
    if (this.profile.qualityScore >= 90) return 'quality-excellent';
    if (this.profile.qualityScore >= 70) return 'quality-good';
    if (this.profile.qualityScore >= 50) return 'quality-fair';
    return 'quality-poor';
  }

  get qualityLabel(): string {
    if (!this.profile) return '';
    if (this.profile.qualityScore >= 90) return 'Excellent';
    if (this.profile.qualityScore >= 70) return 'Good';
    if (this.profile.qualityScore >= 50) return 'Fair';
    return 'Poor';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

}
