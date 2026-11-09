import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PARKED_POPUP_STYLE, PopupCoordinator, PopupPlacement, PopupTrigger, placePopup } from '../popup-coordinator';
import {
  MAX_PREVIEW_DPR,
  Phase,
  PreviewEngine,
  PreviewKey,
  buildEngine,
  gridLayer,
  phaseAt,
  renderFrame,
  sizeCanvas,
  stillPhase,
} from './engine';
import { CaptionStep, PREVIEW_CAPTIONS, PREVIEW_META, PreviewMeta, resolvePreviewKey } from './projection-preview.data';

let nextPreviewId = 0;

/** Gap between the preview icon and the popup. */
const POPUP_OFFSET_PX = 10;
/** Playback speed multiplier for the looping animation. */
const PLAYBACK_SPEED = 0.5;
/** Largest simulated time step per frame (seconds), so a stalled tab does not jump. */
const MAX_FRAME_DT_S = 0.05;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animated, looping canvas preview of a single dimensionality-reduction method,
 * shown in a popup next to a help icon.
 *
 * This component is only open/close/position glue around the framework-free
 * engine in `./engine` (texts live in `projection-preview.data.ts`). The popup
 * opens on hover, focus or click (see {@link PopupTrigger}); only one popup is
 * open at a time, and only the open one animates. The animation loop runs
 * outside Angular and stops on close and destroy. With
 * `prefers-reduced-motion: reduce` a single still frame is drawn instead.
 */
@Component({
  selector: 'app-projection-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projection-preview.component.html',
  styleUrl: './projection-preview.component.scss',
})
export class ProjectionPreviewComponent implements OnDestroy {
  /** Preview key: fast | pca | tri | mds | iso | lle | ltsa | topo | umap | sammon | tsne (unknown -> pca). */
  @Input({ required: true }) methodKey = '';
  @Input() position: PopupPlacement = 'left';

  @ViewChild('trigger', { static: true }) triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('popupEl', { static: true }) popupRef?: ElementRef<HTMLElement>;
  @ViewChild('cnv') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly popupId = `projection-preview-${nextPreviewId++}`;
  readonly popup: PopupTrigger;
  currentPhase = 0;
  popupStyle: Record<string, string> = { ...PARKED_POPUP_STYLE };

  private engine: PreviewEngine | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private background: HTMLCanvasElement | null = null;
  private clock = 0;
  private last = 0;
  private rafId: number | null = null;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    coordinator: PopupCoordinator
  ) {
    this.popup = coordinator.createTrigger({
      contains: target => target instanceof Node && this.elementRef.nativeElement.contains(target),
      opened: () => this.onOpened(),
      closed: () => this.onClosed(),
      reposition: () => this.reposition(),
    });
  }

  get isOpen(): boolean {
    return this.popup.isOpen;
  }

  get meta(): PreviewMeta {
    return PREVIEW_META[this.key];
  }

  get caps(): readonly CaptionStep[] {
    return PREVIEW_CAPTIONS[this.key];
  }

  /** Caption of the current animation phase. */
  get caption(): string {
    return this.caps[this.currentPhase]?.cap ?? '';
  }

  /** Accessible name of the trigger, e.g. "Preview: TriMap animation". */
  get ariaLabel(): string {
    return `Preview: ${this.meta.name} animation`;
  }

  private get key(): PreviewKey {
    return resolvePreviewKey(this.methodKey);
  }

  ngOnDestroy(): void {
    this.popup.destroy();
    this.stopAnimation();
  }

  private onOpened(): void {
    this.currentPhase = 0;
    // Render the canvas and caption first, so the popup measures at full size.
    this.cdr.detectChanges();
    this.reposition();
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_PREVIEW_DPR);
    this.ctx = sizeCanvas(canvas, dpr);
    this.background = gridLayer(dpr);
    if (this.engine?.kind !== this.key) this.engine = buildEngine(this.key);
    this.clock = 0;
    if (prefersReducedMotion()) {
      this.draw(stillPhase(this.caps));
    } else {
      this.draw(phaseAt(this.caps, this.clock));
      this.startAnimation();
    }
  }

  private onClosed(): void {
    this.stopAnimation();
    this.ctx = null;
    this.popupStyle = { ...PARKED_POPUP_STYLE };
    this.cdr.markForCheck();
  }

  private reposition(): void {
    const trigger = this.triggerRef?.nativeElement;
    const popup = this.popupRef?.nativeElement;
    if (!trigger || !popup) return;
    this.popupStyle = placePopup(trigger, popup, this.position, POPUP_OFFSET_PX);
    this.cdr.detectChanges();
  }

  private draw(phase: Phase): void {
    if (!this.ctx || !this.engine) return;
    renderFrame(this.ctx, this.engine, { ...phase, clock: this.clock }, this.background);
    if (this.currentPhase !== phase.idx) {
      this.currentPhase = phase.idx;
      this.cdr.detectChanges();
    }
  }

  private startAnimation(): void {
    if (this.rafId !== null) return;
    this.last = performance.now();
    // Frames must not trigger app-wide change detection; phase changes call
    // detectChanges() on this component only.
    this.zone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(this.tick);
    });
  }

  private stopAnimation(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private readonly tick = (): void => {
    this.rafId = null;
    if (!this.isOpen || !this.ctx) return;
    const now = performance.now();
    const dt = Math.min(MAX_FRAME_DT_S, (now - (this.last || now)) / 1000);
    this.last = now;
    this.clock += dt * PLAYBACK_SPEED;
    this.draw(phaseAt(this.caps, this.clock));
    this.rafId = requestAnimationFrame(this.tick);
  };
}
