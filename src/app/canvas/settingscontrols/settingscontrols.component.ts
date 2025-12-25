import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigService } from '../../services/config.service';

export type SettingMode = 'position' | 'color' | 'glyph' | null;

@Component({
  selector: 'app-settingscontrols',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settingscontrols.component.html',
  styleUrls: ['./settingscontrols.component.scss'],
})
export class SettingsControlPanelComponent {
  panelVisible = false;          // toggled by parent click
  activeSetting: SettingMode = null;

  @Input() parentId!: number;
  @Input() totalCells: number = 0;
  @Output() fitToView = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

constructor(private config: ConfigService) {}

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
}
