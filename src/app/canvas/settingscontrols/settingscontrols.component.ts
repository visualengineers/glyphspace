import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';
import { FeaturesData } from '../../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../../shared/interfaces/glyph-schema';
import { DataProviderService } from '../../services/dataprovider.service';
import { ProjectionService } from '../../services/projection.service';
import { COLOR_SCALES, ColorScale } from '../../shared/interfaces/color-scale';
import { GlyphConfiguration } from '../../glyph/glyph-configuration';
import { GlyphType } from '../../shared/enum/glyph-type';
import { Subscription } from 'rxjs';

export type SettingMode = 'position' | 'color' | 'glyph' | null;

@Component({
  selector: 'app-settingscontrols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settingscontrols.component.html',
  styleUrls: ['./settingscontrols.component.scss'],
})
export class SettingsControlPanelComponent implements OnDestroy {
  @Input() visible = false; // controls fade in/out

  colorScales: ColorScale[] = COLOR_SCALES;

  groupedColorScales: {
    group: string;
    scales: any[];
  }[] = [];

  panelActive = false;
  activeSetting: SettingMode = null;
  animationSpeed = 10;
  paused = true;
  applyColorToAll = true;

  features: FeaturesData = {};
  featureIds: string[] = [];
  schema?: GlyphSchema;
  selectedColorAttribute: string = '';
  colorScaleDropdownOpen = false;
  selectedColorScaleId = COLOR_SCALES[0].id;

  glyphConfig = new GlyphConfiguration();
  GlyphType = GlyphType;
  applyGlyphSettingsToAll = true;

  // Background projection status
  backgroundProjections: Array<{ method: string; status: string; progress: number; message: string; fading?: boolean }> = [];
  private backgroundStatusSubscription?: Subscription;
  private completedProjectionTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private fadingTimers = new Map<string, ReturnType<typeof setTimeout>>();  // Timers for fade-out animation
  private dismissedProjections = new Set<string>();  // Track projections that have been dismissed after completion

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
  @Output() takeScreenshot = new EventEmitter<void>();
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

  constructor(
    private config: ConfigService,
    private dataProvider: DataProviderService,
    private projectionService: ProjectionService
  ) {
    this.ngZone = inject(NgZone);
  }

  ngOnInit(): void {
    this.groupedColorScales = this.groupColorScales(this.colorScales);

    // Subscribe to background projection status updates
    // Show running/pending projections, and completed ones for 5 seconds before fading out
    this.backgroundStatusSubscription = this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
      this.ngZone.run(() => {
        const newProjections: Array<{ method: string; status: string; progress: number; message: string; fading?: boolean }> = [];

        statusMap.forEach((status, method) => {
          // Show running, pending, or complete projections
          if (status.status === 'running' || status.status === 'pending') {
            // Clear any existing timers for this method (it's running again)
            if (this.completedProjectionTimers.has(method)) {
              clearTimeout(this.completedProjectionTimers.get(method));
              this.completedProjectionTimers.delete(method);
            }
            if (this.fadingTimers.has(method)) {
              clearTimeout(this.fadingTimers.get(method));
              this.fadingTimers.delete(method);
            }
            // Clear dismissed status if projection is running again
            this.dismissedProjections.delete(method);
            newProjections.push({
              method,
              status: status.status,
              progress: status.progress,
              message: status.message
            });
          } else if (status.status === 'complete') {
            // Check if we already have a timer for this completed projection
            if (!this.completedProjectionTimers.has(method)) {
              // Start fade-out after 4.5 seconds, then remove after 5 seconds
              const fadeTimer = setTimeout(() => {
                this.ngZone.run(() => {
                  // Set fading flag to trigger CSS transition
                  const proj = this.backgroundProjections.find(p => p.method === method);
                  if (proj) {
                    proj.fading = true;
                  }
                });
              }, 4500);

              const removeTimer = setTimeout(() => {
                this.ngZone.run(() => {
                  this.completedProjectionTimers.delete(method);
                  this.fadingTimers.delete(method);
                  // Mark this method as dismissed so we don't show it again
                  this.dismissedProjections.add(method);
                  // Trigger a re-render by filtering out this method
                  this.backgroundProjections = this.backgroundProjections.filter(p => p.method !== method);
                });
              }, 5000);

              this.completedProjectionTimers.set(method, removeTimer);
              this.fadingTimers.set(method, fadeTimer);
            }
            // Only show completed projection if it hasn't been dismissed
            if (!this.dismissedProjections.has(method)) {
              newProjections.push({
                method,
                status: status.status,
                progress: 100,
                message: status.message,
                fading: false
              });
            }
          }
          // Don't show error projections (they disappear immediately)
        });

        this.backgroundProjections = newProjections;
      });
    });

    this.config.loadedDataSubject$.subscribe(async data => {
      if (data == "") return;

      const metaData = await this.dataProvider.getMetaData();
      this.schema = await this.dataProvider.getSchema();
      if (metaData?.features) {
        this.ngZone.run(() => {
          this.features = metaData.features;
          this.featureIds = Object.keys(this.features);
          this.selectedColorAttribute = this.config.colorFeature;
          // Sync color scale selection with config
          this.selectedColorScaleId = this.config.colorRange;
        });
      }
    });

    this.config.glyphConfigSubject$.subscribe(cfg => {
      this.glyphConfig = cfg;
    });
  }

  ngOnDestroy(): void {
    if (this.backgroundStatusSubscription) {
      this.backgroundStatusSubscription.unsubscribe();
    }
    // Clear all timers
    this.completedProjectionTimers.forEach(timer => clearTimeout(timer));
    this.completedProjectionTimers.clear();
    this.fadingTimers.forEach(timer => clearTimeout(timer));
    this.fadingTimers.clear();
  }

  hideMenus() {
    this.activeSetting = null;
  }

  activatePanel() {
    this.panelActive = true;
  }

  deactivatePanel() {
    this.panelActive = false;
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

  clearSelection() {
    this.dataProvider.clearFilters();
    this.config.clearSelection();
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

  getGlyphName(glyph: GlyphType): string {
    switch (glyph) {
      case GlyphType.Star: return "Star";
      case GlyphType.Flower: return "Flower";
      case GlyphType.Whisker: return "Whisker";
      case GlyphType.Dot: return "Dot";
      case GlyphType.Thumb: return "Thumbnail";
      default: return "Unknown";
    }
  }

  private groupColorScales(scales: any[]) {
    const map = new Map<string, any[]>();

    for (const scale of scales) {
      const group = scale.group ?? 'Other';
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(scale);
    }

    return Array.from(map.entries()).map(([group, scales]) => ({
      group,
      scales
    }));
  }

  getContinuousGradient(scale: any, steps = 10): string {
    const domain = scale.scale.domain();
    const min = domain[0];
    const max = domain[domain.length - 1];

    const colors: string[] = [];

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const value = min + t * (max - min);
      colors.push(scale.scale(value));
    }

    return `linear-gradient(to right, ${colors.join(', ')})`;
  }

  getCategoricalColors(scaleDef: any): string[] {
    const scale = scaleDef.scale;

    // Ordinal / Quantize / Quantile scales
    if (typeof scale.range === 'function') {
      return scale.range();
    }

    return [];
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

    const featureType = this.schema?.types[this.selectedColorAttribute];
    const colorScaleType = this.getSelectedScale().type;
    
    if ( featureType != colorScaleType ) {
      const matchingScale = this.colorScales.find(s => s.type == featureType)?.id;
      if (matchingScale != undefined) this.selectColorScale(matchingScale);
    }
    this.config.updateConfiguration();
  }

  setGlyphType(type: GlyphType) {
    this.glyphConfig.glyphType = type;
    this.config.updateConfiguration();
  }

  isOptionEnabled(prop: string): boolean {
    return (this.glyphConfig as any)[prop] === true;
  }

  toggleOption(property: string): void {
    (this.glyphConfig as any)[property] = !(this.glyphConfig as any)[property];
    this.config.updateConfiguration(); // emit change
  }
}
