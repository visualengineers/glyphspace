import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';

export type SettingMode = 'position' | 'color' | 'glyph' | null;

@Component({
  selector: 'app-settingscontrols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settingscontrols.component.html',
  styleUrls: ['./settingscontrols.component.scss'],
})
export class SettingsControlPanelComponent {
  panelVisible = false;          // toggled by parent click
  activeSetting: SettingMode = null;
  animationSpeed = 10;
  paused = true;

  @Input() parentId!: number;
  @Input() totalCells: number = 0;

  @Input() collisionAvoidance!: boolean;
  @Input() aggregated!: boolean;

  @Input() algorithms: string[] = [];
  @Input() selectedAlgorithm!: string;

  @Input() timestamps: string[] = [];
  @Input() selectedTimestamp!: string;

  @Input() contexts: string[] = [];
  @Input() selectedContext!: string;

  @Output() fitToView = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleCollision = new EventEmitter<void>();
  @Output() toggleAggregation = new EventEmitter<void>();
  @Output() changeAnimationSpeed = new EventEmitter<number>();
  @Output() togglePlayback = new EventEmitter<void>();

  @Output() settingsChanged = new EventEmitter<{
    timestamp: string;
    algorithm: string;
    context: string;
  }>();

  constructor(private config: ConfigService) { }

  showPanel() {
    this.panelVisible = true;
  }

  hidePanel() {
    this.panelVisible = false;
    this.activeSetting = null;
  }

  toggleSetting(setting: SettingMode) {
    if (this.activeSetting === setting) {
      this.activeSetting = null;
    } else {
      this.activeSetting = setting;
    }
  }

  triggerDelete() {
    this.config.removeCanvas(this.parentId);
  }

  emitSettingsChange() {
    this.settingsChanged.emit({
      timestamp: this.selectedTimestamp,
      algorithm: this.selectedAlgorithm,
      context: this.selectedContext
    });
    this.paused = false;
  }

  increaseSpeed() {
    if (this.animationSpeed < 10) {
      this.animationSpeed++;
      this.changeAnimationSpeed.emit(this.animationSpeed / 1000);
    }
  }

  decreaseSpeed() {
    if (this.animationSpeed > 1) {
      this.animationSpeed--;
      this.changeAnimationSpeed.emit(this.animationSpeed / 1000);
    }
  }

  togglePaused() {
    this.paused = !this.paused;
    this.togglePlayback.emit();
  }
}
