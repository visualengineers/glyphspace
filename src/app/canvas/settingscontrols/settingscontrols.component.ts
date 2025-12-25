import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, NgZone, Output } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';
import { FeaturesData } from '../../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../../shared/interfaces/glyph-schema';
import { DataProviderService } from '../../services/dataprovider.service';
import { COLOR_SCALES, ColorScale } from '../../shared/interfaces/color-scale';

export type SettingMode = 'position' | 'color' | 'glyph' | null;

@Component({
  selector: 'app-settingscontrols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settingscontrols.component.html',
  styleUrls: ['./settingscontrols.component.scss'],
})
export class SettingsControlPanelComponent {
  colorScales: ColorScale[] = COLOR_SCALES;

  panelVisible = false;          // toggled by parent click
  activeSetting: SettingMode = null;
  animationSpeed = 10;
  paused = true;
  applyColorToAll = false;
  features: FeaturesData = {};
  featureIds: string[] = [];
  schema?: GlyphSchema;
  selectedColorAttribute: string = '';
  colorScaleDropdownOpen = false;
  selectedColorScaleId = COLOR_SCALES[0].id;
  private ngZone!: NgZone;

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

  constructor(private config: ConfigService, private dataProvider: DataProviderService) {
    this.ngZone = inject(NgZone);

    this.config.loadedDataSubject$.subscribe(async data => {
      if (data == "") return;

      const metaData = await this.dataProvider.getMetaData();
      this.schema = await this.dataProvider.getSchema();
      if (metaData?.features) {
        this.ngZone.run(() => {
          this.features = metaData.features;
          this.featureIds = Object.keys(this.features);
          this.selectedColorAttribute = this.config.colorFeature;
        });
      }
    });
  }

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

  getFeatureName(id: string) {
    return this.schema?.label[id] || "";
  }

  getSelectedScaleColors() {
    return this.colorScales.find(s => s.id === this.selectedColorScaleId)?.representativeColors ?? [];
  }

  selectColorScale(id: number) {
    this.selectedColorScaleId = id;
    this.colorScaleDropdownOpen = false;
    this.config.colorRange = id;
    this.config.updateConfiguration();
  }

  toggleColorScaleDropdown() {
    this.colorScaleDropdownOpen = !this.colorScaleDropdownOpen;
  }

  getSelectedScale(): ColorScale {
    return this.colorScales.find(s => s.id === this.selectedColorScaleId)!;
  }

  selectColor(): void {
    this.config.colorFeature = this.selectedColorAttribute;
    this.config.updateConfiguration();
  }
}
