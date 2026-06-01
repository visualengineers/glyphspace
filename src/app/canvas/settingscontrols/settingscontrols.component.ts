import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, NgZone, OnDestroy, Output, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import { ProjectionService } from '../../services/projection.service';
import { Subscription } from 'rxjs';
import { COLOR_SCALES, getContinuousGradient, getCategoricalColors } from '../../shared/interfaces/color-scale';
import { getGlyphTypeName } from '../../shared/enum/glyph-type';

export type SettingMode = 'position' | null;

@Component({
  selector: 'app-settingscontrols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settingscontrols.component.html',
  styleUrls: ['./settingscontrols.component.scss'],
})
export class SettingsControlPanelComponent implements OnDestroy, OnInit {
  @Input() visible = false;

  private readonly MAX_ANIMATION_SPEED = 10;
  private readonly MIN_ANIMATION_SPEED = 1;
  private readonly PROJECTION_FADE_DELAY_MS = 4500;
  private readonly PROJECTION_REMOVE_DELAY_MS = 5000;

  panelActive = false;
  activeSetting: SettingMode = null;
  animationSpeed = this.MAX_ANIMATION_SPEED;
  paused = true;

  // Color info
  colorFeatureLabel = '';
  colorGradientStyle = '';

  // Glyph type
  glyphTypeName = '';

  // Background projection status
  backgroundProjections: {
    method: string;
    status: string;
    progress: number;
    message: string;
    fading?: boolean;
  }[] = [];
  private backgroundStatusSubscription?: Subscription;
  private completedProjectionTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private fadingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private dismissedProjections = new Set<string>();

  private ngZone!: NgZone;
  private subs = new Subscription();

  @Input() parentId!: number;
  @Input() totalCells = 0;

  @Input() collisionAvoidance!: boolean;
  @Input() aggregated!: boolean;

  @Input() algorithms: string[] = [];
  @Input() selectedAlgorithm!: string;

  @Input() timestamps: string[] = [];
  @Input() selectedTimestamp!: string;

  @Input() contexts: string[] = [];
  @Input() selectedContext!: string;

  @Input() maximized = false;

  @Output() fitToView = new EventEmitter<void>();
  @Output() takeScreenshot = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleCollision = new EventEmitter<void>();
  @Output() toggleAggregation = new EventEmitter<void>();
  @Output() changeAnimationSpeed = new EventEmitter<number>();
  @Output() togglePlayback = new EventEmitter<void>();
  @Output() toggleMaximize = new EventEmitter<void>();

  @Output() settingsChanged = new EventEmitter<{
    timestamp: string;
    algorithm: string;
    context: string;
  }>();

  constructor(
    private config: ConfigService,
    private filterService: FilterService,
    private projectionService: ProjectionService
  ) {
    this.ngZone = inject(NgZone);
  }

  ngOnInit(): void {
    // Color info: update when data loads or config changes
    this.subs.add(
      this.config.loadedDataSubject$.subscribe(data => {
        if (data === '') return;
        this.updateColorInfo();
      })
    );

    this.subs.add(
      this.config.glyphConfigSubject$.subscribe(() => {
        this.updateColorInfo();
        this.updateGlyphTypeName();
      })
    );

    // Subscribe to background projection status updates
    this.backgroundStatusSubscription = this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
      this.ngZone.run(() => {
        const newProjections: {
          method: string;
          status: string;
          progress: number;
          message: string;
          fading?: boolean;
        }[] = [];

        statusMap.forEach((status, method) => {
          if (status.status === 'running' || status.status === 'pending') {
            if (this.completedProjectionTimers.has(method)) {
              clearTimeout(this.completedProjectionTimers.get(method));
              this.completedProjectionTimers.delete(method);
            }
            if (this.fadingTimers.has(method)) {
              clearTimeout(this.fadingTimers.get(method));
              this.fadingTimers.delete(method);
            }
            this.dismissedProjections.delete(method);
            newProjections.push({
              method,
              status: status.status,
              progress: status.progress,
              message: status.message,
            });
          } else if (status.status === 'complete') {
            if (!this.completedProjectionTimers.has(method)) {
              const fadeTimer = setTimeout(() => {
                this.ngZone.run(() => {
                  const proj = this.backgroundProjections.find(p => p.method === method);
                  if (proj) {
                    proj.fading = true;
                  }
                });
              }, this.PROJECTION_FADE_DELAY_MS);

              const removeTimer = setTimeout(() => {
                this.ngZone.run(() => {
                  this.completedProjectionTimers.delete(method);
                  this.fadingTimers.delete(method);
                  this.dismissedProjections.add(method);
                  this.backgroundProjections = this.backgroundProjections.filter(p => p.method !== method);
                });
              }, this.PROJECTION_REMOVE_DELAY_MS);

              this.completedProjectionTimers.set(method, removeTimer);
              this.fadingTimers.set(method, fadeTimer);
            }
            if (!this.dismissedProjections.has(method)) {
              newProjections.push({
                method,
                status: status.status,
                progress: 100,
                message: status.message,
                fading: false,
              });
            }
          }
        });

        this.backgroundProjections = newProjections;
      });
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.backgroundStatusSubscription) {
      this.backgroundStatusSubscription.unsubscribe();
    }
    this.completedProjectionTimers.forEach(timer => clearTimeout(timer));
    this.completedProjectionTimers.clear();
    this.fadingTimers.forEach(timer => clearTimeout(timer));
    this.fadingTimers.clear();
  }

  private updateColorInfo(): void {
    const colorFeature = this.config.colorFeature;
    const colorRange = this.config.colorRange;
    const featureLabels = this.config.featureLabels;

    if (!colorFeature) {
      this.colorFeatureLabel = '';
      this.colorGradientStyle = '';
      return;
    }

    const colorScale = COLOR_SCALES.find(cs => cs.id === colorRange) || COLOR_SCALES[0];

    let gradient: string;
    if (colorScale.type === 'categorical') {
      const colors = getCategoricalColors(colorScale);
      gradient = `linear-gradient(to right, ${colors.map((c, i) => `${c} ${(i / colors.length) * 100}%, ${c} ${((i + 1) / colors.length) * 100}%`).join(', ')})`;
    } else {
      gradient = getContinuousGradient(colorScale);
    }

    this.colorFeatureLabel = featureLabels[colorFeature] || colorFeature;
    this.colorGradientStyle = gradient;
  }

  private updateGlyphTypeName(): void {
    this.glyphTypeName = getGlyphTypeName(this.config.getConfiguration().glyphType);
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
    this.filterService.clearFilters();
    this.config.clearSelection();
  }

  emitSettingsChange() {
    this.settingsChanged.emit({
      timestamp: this.selectedTimestamp,
      algorithm: this.selectedAlgorithm,
      context: this.selectedContext,
    });
    this.paused = false;
  }

  increaseSpeed() {
    if (this.animationSpeed < this.MAX_ANIMATION_SPEED) {
      this.animationSpeed++;
      this.changeAnimationSpeed.emit(this.animationSpeed / 1000);
    }
  }

  decreaseSpeed() {
    if (this.animationSpeed > this.MIN_ANIMATION_SPEED) {
      this.animationSpeed--;
      this.changeAnimationSpeed.emit(this.animationSpeed / 1000);
    }
  }

  togglePaused() {
    this.paused = !this.paused;
    this.togglePlayback.emit();
  }
}
