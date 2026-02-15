import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';
import { DataProviderService } from '../../services/dataprovider.service';
import { ProjectionService } from '../../services/projection.service';
import { Subscription } from 'rxjs';

export type SettingMode = 'position' | null;

@Component({
  selector: 'app-settingscontrols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settingscontrols.component.html',
  styleUrls: ['./settingscontrols.component.scss'],
})
export class SettingsControlPanelComponent implements OnDestroy {
  @Input() visible = false;

  panelActive = false;
  activeSetting: SettingMode = null;
  animationSpeed = 10;
  paused = true;

  // Background projection status
  backgroundProjections: Array<{ method: string; status: string; progress: number; message: string; fading?: boolean }> = [];
  private backgroundStatusSubscription?: Subscription;
  private completedProjectionTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private fadingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private dismissedProjections = new Set<string>();

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
    // Subscribe to background projection status updates
    this.backgroundStatusSubscription = this.projectionService.backgroundStatusObservable.subscribe(statusMap => {
      this.ngZone.run(() => {
        const newProjections: Array<{ method: string; status: string; progress: number; message: string; fading?: boolean }> = [];

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
              message: status.message
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
              }, 4500);

              const removeTimer = setTimeout(() => {
                this.ngZone.run(() => {
                  this.completedProjectionTimers.delete(method);
                  this.fadingTimers.delete(method);
                  this.dismissedProjections.add(method);
                  this.backgroundProjections = this.backgroundProjections.filter(p => p.method !== method);
                });
              }, 5000);

              this.completedProjectionTimers.set(method, removeTimer);
              this.fadingTimers.set(method, fadeTimer);
            }
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
        });

        this.backgroundProjections = newProjections;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.backgroundStatusSubscription) {
      this.backgroundStatusSubscription.unsubscribe();
    }
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
}
