import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overlaycontrols',
  imports: [CommonModule, FormsModule],
  templateUrl: './overlaycontrols.component.html',
  styleUrls: ['./overlaycontrols.component.scss']
})
export class OverlayControlsComponent {
  @Input() collisionAvoidance!: boolean;
  @Input() aggregated!: boolean;
  @Input() selectionMode!: boolean;
  @Input() magicLenseStatus!: boolean;
  @Input() showSettings!: boolean;

  @Input() timestamps: string[] = [];
  @Input() selectedTimestamp!: string;

  @Input() algorithms: string[] = [];
  @Input() selectedAlgorithm!: string;

  @Input() contexts: string[] = [];
  @Input() selectedContext!: string;

  @Output() fitToView = new EventEmitter<void>();
  @Output() toggleCollision = new EventEmitter<void>();
  @Output() toggleAggregation = new EventEmitter<void>();
  @Output() toggleSelection = new EventEmitter<void>();
  @Output() toggleLens = new EventEmitter<void>();
  @Output() toggleSettingsPanel = new EventEmitter<void>();

  @Output() settingsChanged = new EventEmitter<{
    timestamp: string;
    algorithm: string;
    context: string;
  }>();

  emitSettingsChange() {
    this.settingsChanged.emit({
      timestamp: this.selectedTimestamp,
      algorithm: this.selectedAlgorithm,
      context: this.selectedContext
    });
  }
}