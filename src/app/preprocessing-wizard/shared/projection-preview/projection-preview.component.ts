import { Component, Input, ViewChild, ElementRef, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Metadata for one projection method's preview.
 */
interface PreviewMeta {
  name: string;
  tag: string;
  /** Tag colour class suffix used for the badge styling. */
  tagClass: 'fast' | 'medium' | 'slow' | 'primary';
  rows: string;
  sub: string;
  desc: string;
}

interface CaptionStep {
  /** Relative duration of this step in the loop. */
  d: number;
  cap: string;
}

/**
 * Animated, looping canvas preview of a single dimensionality-reduction method.
 *
 * The drawing engine (geometry generators + per-method draw routines) is ported
 * from the ClaudeDesign "Projection Previews" template. Unlike the template,
 * which animates all methods at once, this component builds and animates exactly
 * one method — the one named by {@link methodKey} — so it is cheap enough to
 * mount inside a per-method tooltip and it only runs while it is on screen.
 */
@Component({
  selector: 'app-projection-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projection-preview.component.html',
  styleUrl: './projection-preview.component.scss',
})
export class ProjectionPreviewComponent implements OnDestroy {
  /** Preview key: fast | pca | tri | mds | iso | lle | ltsa | topo | umap | sammon | tsne */
  @Input({ required: true }) methodKey!: string;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'left';

  @ViewChild('cnv') canvasRef?: ElementRef<HTMLCanvasElement>;

  // Exposed to the template.
  meta!: PreviewMeta;
  caps: CaptionStep[] = [];
  currentPhase = 0;
  isOpen = false;
  popupStyle: Record<string, string> = {};

  readonly W = 340;
  readonly H = 200;
  private readonly cx = 170;
  private readonly cy = 100;
  private readonly accent = '#00bcd4';
  /** Playback speed multiplier for the looping animation. */
  private readonly speed = 0.5;

  private eng: any = null;
  private clock = 0;
  private last = 0;
  private rafId: number | null = null;

  // Grace period so the pointer can travel from the icon into the popup
  // (to read the description or watch the animation) without it closing.
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly HIDE_DELAY_MS = 180;

  private readonly META: Record<string, PreviewMeta> = {
    fast: {
      name: 'FastMap',
      tag: 'Always active',
      tagClass: 'primary',
      rows: '',
      sub: 'Pivot-based linear projection',
      desc: 'The default projection — always on, loads immediately, and is shown while slower methods compute in the background.',
    },
    pca: {
      name: 'PCA',
      tag: 'Very fast',
      tagClass: 'fast',
      rows: 'Any size',
      sub: 'Principal Component Analysis',
      desc: 'Fast and linear — captures the directions of greatest variance.',
    },
    tri: {
      name: 'TriMap',
      tag: 'Fast',
      tagClass: 'fast',
      rows: 'Up to 100K rows',
      sub: 'Triplet-based dimensionality reduction',
      desc: 'Learns from point triplets to keep the global layout honest.',
    },
    mds: {
      name: 'MDS',
      tag: 'Medium',
      tagClass: 'medium',
      rows: 'Up to 5K rows',
      sub: 'Classical Multidimensional Scaling',
      desc: 'Arranges points so pairwise distances match the original data.',
    },
    iso: {
      name: 'IsoMap',
      tag: 'Medium',
      tagClass: 'medium',
      rows: 'Up to 5K rows',
      sub: 'Isometric Mapping',
      desc: 'Measures distances along the manifold, then unrolls it flat.',
    },
    lle: {
      name: 'LLE',
      tag: 'Medium',
      tagClass: 'medium',
      rows: 'Up to 30K rows',
      sub: 'Locally Linear Embedding',
      desc: 'Rebuilds each point from its neighbors, keeping local geometry.',
    },
    ltsa: {
      name: 'LTSA',
      tag: 'Medium',
      tagClass: 'medium',
      rows: 'Up to 20K rows',
      sub: 'Local Tangent Space Alignment',
      desc: 'Aligns local tangent spaces to flatten curved manifolds.',
    },
    topo: {
      name: 'TopoMap',
      tag: 'Medium',
      tagClass: 'medium',
      rows: 'Up to 8K rows',
      sub: 'Topology-preserving mapping via MST',
      desc: 'Builds a minimum spanning tree and preserves its topology.',
    },
    umap: {
      name: 'UMAP',
      tag: 'Slow',
      tagClass: 'slow',
      rows: 'Up to 100K rows',
      sub: 'Uniform Manifold Approximation & Projection',
      desc: 'Balances local detail with the global layout of the data.',
    },
    sammon: {
      name: 'Sammon',
      tag: 'Slow',
      tagClass: 'slow',
      rows: 'Up to 5K rows',
      sub: 'Sammon Mapping',
      desc: 'Like MDS, but small distances count the most.',
    },
    tsne: {
      name: 't-SNE',
      tag: 'Very slow',
      tagClass: 'slow',
      rows: 'Up to 15K rows',
      sub: 't-Distributed Stochastic Neighbor Embedding',
      desc: 'Focuses on local neighborhoods to reveal tight clusters.',
    },
  };

  private readonly CAPS: Record<string, CaptionStep[]> = {
    fast: [
      { d: 1.1, cap: 'Your data — many variables at once' },
      { d: 1.7, cap: 'Pick two far-apart pivot points' },
      { d: 1.4, cap: 'The pivots define an axis' },
      { d: 1.9, cap: 'Place each point by its distance to the pivots' },
      { d: 1.7, cap: 'A fast linear layout — ready instantly' },
    ],
    pca: [
      { d: 1.1, cap: 'Your data — many variables at once' },
      { d: 1.9, cap: 'Finding the direction of greatest variance' },
      { d: 0.8, cap: 'Main axis locked in' },
      { d: 1.9, cap: 'Projecting every point onto that axis' },
      { d: 1.7, cap: 'Fewer dimensions — the spread is kept' },
    ],
    tri: [
      { d: 1.1, cap: 'Your data — many variables at once' },
      { d: 2.2, cap: 'Sample triplets: A is closer to B than to C' },
      { d: 2.0, cap: 'Move points to satisfy the triplets' },
      { d: 1.8, cap: 'Clusters — and the global layout — are kept' },
    ],
    mds: [
      { d: 1.1, cap: 'Your data — many variables at once' },
      { d: 2.2, cap: 'Measure every pairwise distance' },
      { d: 1.9, cap: 'Arrange points so distances still match' },
      { d: 1.6, cap: 'Relative distances are preserved' },
    ],
    iso: [
      { d: 1.2, cap: 'Data lying on a curved manifold' },
      { d: 1.6, cap: 'Connect each point to its neighbors' },
      { d: 2.2, cap: 'Distances follow the curve — not the shortcut' },
      { d: 1.8, cap: 'Unroll the manifold flat' },
      { d: 1.5, cap: 'Geodesic distances preserved' },
    ],
    lle: [
      { d: 1.2, cap: 'Data lying on a curved manifold' },
      { d: 2.0, cap: 'Describe each point by its neighbors' },
      { d: 1.9, cap: 'Unfold, keeping each patch intact' },
      { d: 1.5, cap: 'Local geometry preserved' },
    ],
    ltsa: [
      { d: 1.2, cap: 'Data lying on a curved manifold' },
      { d: 1.9, cap: 'Fit a tangent line to each neighborhood' },
      { d: 2.0, cap: 'Align the tangents into one flat space' },
      { d: 1.5, cap: 'Curved structure, flattened' },
    ],
    topo: [
      { d: 1.1, cap: 'Your data — many variables at once' },
      { d: 2.2, cap: 'Build the minimum spanning tree' },
      { d: 1.9, cap: 'Lay out points, keeping the tree intact' },
      { d: 1.5, cap: 'Topology preserved' },
    ],
    umap: [
      { d: 1.1, cap: 'High-dimensional data' },
      { d: 1.7, cap: 'Connect each point to its nearest neighbors' },
      { d: 2.2, cap: 'Neighbors pull together into groups' },
      { d: 1.8, cap: 'Clusters — and the gaps between them — stay meaningful' },
    ],
    sammon: [
      { d: 1.1, cap: 'Your data — many variables at once' },
      { d: 2.0, cap: 'Weigh distances — near pairs matter most' },
      { d: 1.9, cap: 'Arrange points, pinning close pairs first' },
      { d: 1.5, cap: 'Small distances preserved' },
    ],
    tsne: [
      { d: 1.1, cap: 'High-dimensional data' },
      { d: 1.6, cap: 'Measure who sits close to whom' },
      { d: 2.4, cap: 'Pull neighbors in, push the rest away' },
      { d: 1.8, cap: 'Tight clusters form — gaps aren’t to scale' },
    ],
  };

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.cancelScheduledHide();
    this.stopAnimation();
  }

  open(): void {
    this.cancelScheduledHide();
    if (this.isOpen) return;
    const key = this.methodKeyResolved();
    this.meta = this.META[key];
    this.caps = this.CAPS[key];
    if (!this.eng) this.eng = this.buildEngine(key);
    // Park off-screen until positioned, so the popup never briefly overflows the
    // viewport (which would flash a horizontal scrollbar) before clamping.
    this.popupStyle = { top: '-9999px', left: '-9999px' };
    this.isOpen = true;
    // Wait for the popup + canvas to render, then size, position and animate.
    setTimeout(() => {
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) return;
      this.sizeCanvas(canvas);
      this.updatePopupPosition();
      this.clock = 0;
      this.last = performance.now();
      this.startAnimation();
    }, 0);
  }

  close(): void {
    this.isOpen = false;
    this.stopAnimation();
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  /** Hide after a short grace period unless the pointer re-enters in time. */
  scheduleHide(): void {
    this.cancelScheduledHide();
    this.hideTimer = setTimeout(() => {
      this.close();
      this.hideTimer = null;
      this.cdr.detectChanges();
    }, ProjectionPreviewComponent.HIDE_DELAY_MS);
  }

  cancelScheduledHide(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.close();
  }

  private startAnimation(): void {
    if (this.rafId === null) this.rafId = requestAnimationFrame(this.tick);
  }

  private stopAnimation(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updatePopupPosition(): void {
    const icon = this.elementRef.nativeElement.querySelector('.preview-icon');
    const popup = this.elementRef.nativeElement.querySelector('.projection-preview');
    if (!icon || !popup) return;
    const rect = icon.getBoundingClientRect();
    const pRect = popup.getBoundingClientRect();
    const offset = 10;
    const padding = 10;
    let top = 0;
    let left = 0;
    switch (this.position) {
      case 'top':
        top = rect.top - pRect.height - offset;
        left = rect.left + rect.width / 2 - pRect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - pRect.width / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - pRect.height / 2;
        left = rect.right + offset;
        break;
      case 'left':
      default:
        top = rect.top + rect.height / 2 - pRect.height / 2;
        left = rect.left - pRect.width - offset;
        break;
    }
    const viewW = document.documentElement.clientWidth;
    const viewH = document.documentElement.clientHeight;
    if (left + pRect.width > viewW - padding) left = viewW - pRect.width - padding;
    if (left < padding) left = padding;
    if (top + pRect.height > viewH - padding) top = viewH - pRect.height - padding;
    if (top < padding) top = padding;
    this.popupStyle = { top: `${top}px`, left: `${left}px` };
    this.cdr.detectChanges();
  }

  // ---------- deterministic RNG helpers ----------
  private mulberry(a: number): () => number {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  private gaussOf(r: () => number): () => number {
    return () => {
      const u1 = r() || 1e-9;
      const u2 = r();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.283185 * u2);
    };
  }

  // ---------- colour helpers ----------
  private hx(h: string): number[] {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  private mix(a: string, b: string, t: number): number[] {
    const p = this.hx(a);
    const q = this.hx(b);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  }
  private rgb(c: number[]): string {
    return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
  }
  private rgba(c: number[], a: number): string {
    return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + a + ')';
  }
  private hexA(h: string, a: number): string {
    return this.rgba(this.hx(h), a);
  }
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  private sm(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }
  private grad(t: number): string {
    return this.rgb(this.mix('#1aa6bf', '#ff7043', Math.max(0, Math.min(1, t))));
  }

  // ---------- geometry ----------
  private buildEngine(key: string): any {
    const W = this.W;
    const H = this.H;
    const cx = this.cx;
    const cy = this.cy;
    const groupColors = ['#00bcd4', '#ff7043', '#7e57c2'];
    const mul = (s: number) => this.mulberry(s);
    const gaussOf = (r: () => number) => this.gaussOf(r);
    const grad = (t: number) => this.grad(t);

    const genClusters = (centers: any[], spread: number, seed: number, sizes: number[]) => {
      const r = mul(seed);
      const g2 = gaussOf(r);
      const pts: any[] = [];
      for (let gi = 0; gi < centers.length; gi++) {
        for (let k = 0; k < sizes[gi]; k++) {
          const ang = r() * 6.2832;
          let rad = Math.abs(g2()) * spread;
          rad = Math.min(rad, spread * 2.4);
          pts.push({
            g: gi,
            cx: cx + centers[gi].x + Math.cos(ang) * rad,
            cy: cy + centers[gi].y + Math.sin(ang) * rad,
            sx: cx + (r() * 2 - 1) * 150,
            sy: cy + (r() * 2 - 1) * 80,
            jp: r() * 6.283,
          });
        }
      }
      return pts;
    };

    const cloudTarget = (seed: number, n: number, rot: number, sy: number) => {
      const r = mul(seed);
      const g = gaussOf(r);
      const pts: any[] = [];
      for (let i = 0; i < n; i++) {
        let a = g() * 62;
        a = Math.max(-105, Math.min(105, a));
        let b = g() * 34;
        b = Math.max(-62, Math.min(62, b));
        const bx = cx + a;
        const by = cy + b * 0.9;
        const co = Math.cos(rot);
        const si = Math.sin(rot);
        const dx = bx - cx;
        const dy = by - cy;
        let px = cx + dx * co - dy * si;
        let py = cy + (dx * si + dy * co) * sy;
        px = Math.max(14, Math.min(W - 14, px));
        py = Math.max(14, Math.min(H - 14, py));
        pts.push({ bx, by, px, py, color: grad((a + 95) / 190) });
      }
      return pts;
    };

    const curve = (seed: number, n: number, amp: number, freq: number, phase: number) => {
      const r = mul(seed);
      const pts: any[] = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const jx = (r() * 2 - 1) * 4;
        const jy = (r() * 2 - 1) * 8;
        pts.push({
          t,
          bx: cx + (t - 0.5) * 252 + jx,
          by: cy + amp * Math.sin((t - 0.5) * freq + (phase || 0)) + jy,
          ux: cx + (t - 0.5) * 290 + jx,
          uy: cy + jy * 0.6,
          color: grad(t),
        });
      }
      return pts;
    };

    switch (key) {
      case 'pca': {
        const rng = mul(20260702);
        const gauss = gaussOf(rng);
        const th = -0.384;
        const ux = Math.cos(th);
        const uy = Math.sin(th);
        const vx = -Math.sin(th);
        const vy = Math.cos(th);
        const pts: any[] = [];
        for (let i = 0; i < 46; i++) {
          let a = gauss() * 58;
          a = Math.max(-92, Math.min(92, a));
          let b = gauss() * 15;
          b = Math.max(-30, Math.min(30, b));
          pts.push({
            bx: cx + ux * a + vx * b,
            by: cy + uy * a + vy * b,
            px: cx + ux * a,
            py: cy + uy * a,
            color: grad((a + 80) / 160),
          });
        }
        return { pts, theta: th };
      }
      case 'fast': {
        const rf = mul(99123);
        const gf = gaussOf(rf);
        const pts: any[] = [];
        for (let i = 0; i < 44; i++) {
          let a = gf() * 52;
          a = Math.max(-98, Math.min(98, a));
          let b = gf() * 30;
          b = Math.max(-58, Math.min(58, b));
          pts.push({ bx: cx + a, by: cy + b * 0.92 });
        }
        let pi = 0;
        let pj = 1;
        let best = -1;
        for (let i = 0; i < pts.length; i++)
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].bx - pts[j].bx;
            const dy = pts[i].by - pts[j].by;
            const d2 = dx * dx + dy * dy;
            if (d2 > best) {
              best = d2;
              pi = i;
              pj = j;
            }
          }
        const P = pts[pi];
        const Q = pts[pj];
        const fdx = Q.bx - P.bx;
        const fdy = Q.by - P.by;
        const flen2 = fdx * fdx + fdy * fdy;
        for (const p of pts) {
          const t = ((p.bx - P.bx) * fdx + (p.by - P.by) * fdy) / flen2;
          p.px = P.bx + fdx * t;
          p.py = P.by + fdy * t;
          p.color = grad(t);
        }
        return { pts, pi, pj, angle: Math.atan2(fdy, fdx) };
      }
      case 'umap': {
        const pts = genClusters(
          [
            { x: -92, y: -14 },
            { x: 80, y: -30 },
            { x: -4, y: 54 },
          ],
          15,
          777,
          [16, 15, 15]
        );
        const edges: number[][] = [];
        const seen = new Set<string>();
        for (let i = 0; i < pts.length; i++) {
          const cand: number[][] = [];
          for (let j = 0; j < pts.length; j++) {
            if (j === i || pts[j].g !== pts[i].g) continue;
            const dx = pts[i].cx - pts[j].cx;
            const dy = pts[i].cy - pts[j].cy;
            cand.push([dx * dx + dy * dy, j]);
          }
          cand.sort((a, b) => a[0] - b[0]);
          for (let m = 0; m < Math.min(2, cand.length); m++) {
            const j = cand[m][1];
            const keyE = i < j ? i + '-' + j : j + '-' + i;
            if (!seen.has(keyE)) {
              seen.add(keyE);
              edges.push([i, j]);
            }
          }
        }
        return { pts, edges, groupColors };
      }
      case 'tsne': {
        const pts = genClusters(
          [
            { x: -58, y: -34 },
            { x: 66, y: -2 },
            { x: -18, y: 52 },
          ],
          9,
          313,
          [16, 15, 15]
        );
        const cent = [
          { x: 0, y: 0, n: 0 },
          { x: 0, y: 0, n: 0 },
          { x: 0, y: 0, n: 0 },
        ];
        for (const p of pts) {
          cent[p.g].x += p.cx;
          cent[p.g].y += p.cy;
          cent[p.g].n++;
        }
        cent.forEach(c => {
          c.x /= c.n;
          c.y /= c.n;
        });
        return { pts, cent, groupColors };
      }
      case 'tri': {
        const pts = genClusters(
          [
            { x: -80, y: -20 },
            { x: 86, y: -18 },
            { x: 2, y: 52 },
          ],
          13,
          555,
          [16, 15, 15]
        );
        const rt = mul(1212);
        const triplets: number[][] = [];
        for (let t = 0; t < 5; t++) {
          const a = Math.floor(rt() * pts.length);
          let b = a;
          while (b === a || pts[b].g !== pts[a].g) b = Math.floor(rt() * pts.length);
          let c = a;
          while (pts[c].g === pts[a].g) c = Math.floor(rt() * pts.length);
          triplets.push([a, b, c]);
        }
        const cent = [
          { x: 0, y: 0, n: 0 },
          { x: 0, y: 0, n: 0 },
          { x: 0, y: 0, n: 0 },
        ];
        for (const p of pts) {
          cent[p.g].x += p.cx;
          cent[p.g].y += p.cy;
          cent[p.g].n++;
        }
        cent.forEach(c => {
          c.x /= c.n;
          c.y /= c.n;
        });
        return { pts, triplets, cent, groupColors };
      }
      case 'topo': {
        const pts = genClusters(
          [
            { x: -84, y: -8 },
            { x: 70, y: -34 },
            { x: 10, y: 50 },
          ],
          20,
          888,
          [12, 12, 12]
        );
        const used = new Set<number>([0]);
        const edges: number[][] = [];
        while (used.size < pts.length) {
          let bi = -1;
          let bj = -1;
          let bd = Infinity;
          for (const i of used)
            for (let j = 0; j < pts.length; j++) {
              if (used.has(j)) continue;
              const dx = pts[i].cx - pts[j].cx;
              const dy = pts[i].cy - pts[j].cy;
              const d = dx * dx + dy * dy;
              if (d < bd) {
                bd = d;
                bi = i;
                bj = j;
              }
            }
          used.add(bj);
          edges.push([bi, bj]);
        }
        return { pts, edges, groupColors };
      }
      case 'mds': {
        const pts = cloudTarget(246, 26, -0.45, 0.72);
        const edges: number[][] = [];
        const seen = new Set<string>();
        for (let i = 0; i < pts.length; i++) {
          const cand: number[][] = [];
          for (let j = 0; j < pts.length; j++) {
            if (j === i) continue;
            const dx = pts[i].bx - pts[j].bx;
            const dy = pts[i].by - pts[j].by;
            cand.push([dx * dx + dy * dy, j]);
          }
          cand.sort((a, b) => a[0] - b[0]);
          for (let m = 0; m < 2; m++) {
            const j = cand[m][1];
            const keyE = i < j ? i + '-' + j : j + '-' + i;
            if (!seen.has(keyE)) {
              seen.add(keyE);
              edges.push([i, j]);
            }
          }
        }
        return { pts, edges, anchors: [2, 9, 16, 22, 6, 13] };
      }
      case 'sammon': {
        const pts = cloudTarget(135, 26, 0.4, 0.7);
        const near: number[][] = [];
        const far: number[][] = [];
        for (let i = 0; i < pts.length; i++)
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].bx - pts[j].bx;
            const dy = pts[i].by - pts[j].by;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 40 && near.length < 24) near.push([i, j]);
            else if (d > 150 && far.length < 6) far.push([i, j]);
          }
        return { pts, near, far };
      }
      case 'iso':
        return { pts: curve(41, 34, 60, 4.6, 0) };
      case 'lle':
        return { pts: curve(42, 30, 56, 2.6, 0.6), samples: [3, 9, 15, 21, 27] };
      case 'ltsa':
        return { pts: curve(43, 30, 46, 5.6, 0), samples: [2, 6, 10, 14, 18, 22, 26] };
      default:
        return { pts: [], theta: 0 };
    }
  }

  private sizeCanvas(el: HTMLCanvasElement): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = this.W * dpr;
    el.height = this.H * dpr;
    el.style.width = this.W + 'px';
    el.style.height = this.H + 'px';
    el.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------- drawing primitives ----------
  private grid(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(120,140,160,0.06)';
    for (let gx = 16; gx < this.W; gx += 24) for (let gy = 18; gy < this.H; gy += 24) ctx.fillRect(gx, gy, 1.4, 1.4);
    ctx.restore();
  }
  private pt(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r?: number): void {
    r = r || 3.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.283);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
  }
  private arrow(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, size: number, color: string): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * 0.55);
    ctx.lineTo(-size, size * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  private axis(ctx: CanvasRenderingContext2D, angle: number, alpha: number, accent: string): void {
    const cx = this.cx;
    const cy = this.cy;
    const len = 150;
    const ex = Math.cos(angle);
    const ey = Math.sin(angle);
    ctx.save();
    ctx.strokeStyle = this.hexA(accent, 0.9 * alpha);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - ex * len, cy - ey * len);
    ctx.lineTo(cx + ex * len, cy + ey * len);
    ctx.stroke();
    const col = this.hexA(accent, 0.9 * alpha);
    this.arrow(ctx, cx + ex * len, cy + ey * len, angle, 7, col);
    this.arrow(ctx, cx - ex * len, cy - ey * len, angle + Math.PI, 7, col);
    ctx.restore();
  }
  private line(ctx: CanvasRenderingContext2D, a: any, b: any, style: string, w?: number, dash?: number[]): void {
    ctx.save();
    if (dash) ctx.setLineDash(dash);
    ctx.strokeStyle = style;
    ctx.lineWidth = w || 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- per-method draws ----------
  private draw_pca(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const th = eng.theta;
    const accent = this.accent;
    let axisAlpha = 0;
    let angle = th;
    let projT = 0;
    let expandT = 0;
    let showDrop = false;
    if (idx === 0) {
      expandT = this.sm(local / 0.55);
    } else if (idx === 1) {
      const sw = this.sm(local);
      angle = this.lerp(th - 0.85, th, sw);
      axisAlpha = this.sm(local / 0.3);
    } else if (idx === 2) {
      axisAlpha = 1;
    } else if (idx === 3) {
      axisAlpha = 1;
      projT = this.sm(local);
      showDrop = true;
    } else {
      axisAlpha = 1;
      projT = 1;
    }
    const pos = pts.map((p: any) => {
      if (idx === 0) return { x: this.lerp(p.px, p.bx, expandT), y: this.lerp(p.py, p.by, expandT), c: p.color };
      if (idx <= 2) return { x: p.bx, y: p.by, c: p.color };
      return { x: this.lerp(p.bx, p.px, projT), y: this.lerp(p.by, p.py, projT), c: p.color };
    });
    if (showDrop) {
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = this.hexA('#5a6672', 0.32 * Math.sin(projT * Math.PI));
      for (const p of pts) {
        ctx.beginPath();
        ctx.moveTo(p.bx, p.by);
        ctx.lineTo(p.px, p.py);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (axisAlpha > 0) this.axis(ctx, angle, axisAlpha, accent);
    for (const p of pos) this.pt(ctx, p.x, p.y, p.c);
  }

  private draw_fast(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const accent = this.accent;
    const P = pts[eng.pi];
    const Q = pts[eng.pj];
    let pivotA = 0;
    let axisT = 0;
    let projT = 0;
    let expandT = 1;
    let showDrop = false;
    if (idx === 0) {
      expandT = this.sm(local / 0.55);
    } else if (idx === 1) {
      pivotA = this.sm(local / 0.5);
    } else if (idx === 2) {
      pivotA = 1;
      axisT = this.sm(local);
    } else if (idx === 3) {
      pivotA = 1;
      axisT = 1;
      projT = this.sm(local);
      showDrop = true;
    } else {
      pivotA = 0.6;
      axisT = 1;
      projT = 1;
    }
    const pos = pts.map((p: any) => {
      if (idx === 0) return { x: this.lerp(p.px, p.bx, expandT), y: this.lerp(p.py, p.by, expandT), c: p.color };
      if (idx <= 2) return { x: p.bx, y: p.by, c: p.color };
      return { x: this.lerp(p.bx, p.px, projT), y: this.lerp(p.by, p.py, projT), c: p.color };
    });
    if (showDrop) {
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = this.hexA('#5a6672', 0.32 * Math.sin(projT * Math.PI));
      for (const p of pts) {
        ctx.beginPath();
        ctx.moveTo(p.bx, p.by);
        ctx.lineTo(p.px, p.py);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (axisT > 0) {
      const mx = (P.bx + Q.bx) / 2;
      const my = (P.by + Q.by) / 2;
      const ex = Math.cos(eng.angle);
      const ey = Math.sin(eng.angle);
      const half = (Math.hypot(Q.bx - P.bx, Q.by - P.by) / 2 + 16) * axisT;
      ctx.save();
      ctx.strokeStyle = this.hexA(accent, 0.9);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx - ex * half, my - ey * half);
      ctx.lineTo(mx + ex * half, my + ey * half);
      ctx.stroke();
      if (axisT > 0.95) {
        const col = this.hexA(accent, 0.9);
        this.arrow(ctx, mx + ex * half, my + ey * half, eng.angle, 7, col);
        this.arrow(ctx, mx - ex * half, my - ey * half, eng.angle + Math.PI, 7, col);
      }
      ctx.restore();
    }
    if (pivotA > 0) {
      const pulse = idx === 1 ? 1 + 0.18 * Math.sin(this.clock * 6) : 1;
      ctx.save();
      for (const pv of [P, Q]) {
        const x = idx >= 3 ? this.lerp(pv.bx, pv.px, projT) : pv.bx;
        const y = idx >= 3 ? this.lerp(pv.by, pv.py, projT) : pv.by;
        ctx.beginPath();
        ctx.arc(x, y, 9.5 * pulse, 0, 6.283);
        ctx.strokeStyle = this.hexA(accent, 0.85 * pivotA);
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 15 * pulse, 0, 6.283);
        ctx.strokeStyle = this.hexA(accent, 0.25 * pivotA);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = 0; i < pts.length; i++) {
      const big = (i === eng.pi || i === eng.pj) && pivotA > 0;
      this.pt(ctx, pos[i].x, pos[i].y, pos[i].c, big ? 4.6 : 3.4);
    }
  }

  private draw_umap(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const edges = eng.edges;
    const gc = eng.groupColors;
    let edgeA = 0;
    let mix = 0;
    let pos: any[];
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.cx, p.sx, re), y: this.lerp(p.cy, p.sy, re) }));
      mix = 1 - re;
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.sx, y: p.sy }));
      edgeA = this.sm(local);
      mix = 0;
    } else if (idx === 2) {
      const mT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.sx, p.cx, mT), y: this.lerp(p.sy, p.cy, mT) }));
      edgeA = 1;
      mix = mT;
    } else {
      pos = pts.map((p: any) => ({ x: p.cx, y: p.cy }));
      edgeA = 1;
      mix = 1;
    }
    if (edgeA > 0) {
      ctx.save();
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        ctx.strokeStyle = this.rgba(this.mix('#9aa9b6', gc[pts[i].g], mix), 0.3 * edgeA);
        ctx.beginPath();
        ctx.moveTo(pos[i].x, pos[i].y);
        ctx.lineTo(pos[j].x, pos[j].y);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = 0; i < pts.length; i++)
      this.pt(ctx, pos[i].x, pos[i].y, this.rgb(this.mix('#9aa9b6', gc[pts[i].g], mix)));
  }

  private draw_tsne(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const gc = eng.groupColors;
    const clock = this.clock;
    const accent = this.accent;
    let mix = 0;
    let halo = 0;
    let pos: any[];
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.cx, p.sx, re), y: this.lerp(p.cy, p.sy, re) }));
      mix = 1 - re;
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.sx, y: p.sy }));
      mix = 0;
      halo = this.sm(local);
    } else if (idx === 2) {
      const mT = this.sm(local);
      const amp = (1 - mT) * 7;
      pos = pts.map((p: any) => ({
        x: this.lerp(p.sx, p.cx, mT) + Math.cos(clock * 5.5 + p.jp) * amp,
        y: this.lerp(p.sy, p.cy, mT) + Math.sin(clock * 4.7 + p.jp * 1.4) * amp,
      }));
      mix = mT;
      halo = (1 - mT) * 0.5;
    } else {
      pos = pts.map((p: any) => ({ x: p.cx, y: p.cy }));
      mix = 1;
    }
    if (halo > 0) {
      ctx.save();
      for (const p of pos) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, 6.283);
        ctx.fillStyle = this.hexA(accent, 0.055 * halo);
        ctx.fill();
      }
      ctx.restore();
    }
    if (idx === 3) {
      const a = eng.cent[0];
      const b = eng.cent[1];
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(120,134,148,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.arc(mx, my, 8, 0, 6.283);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,134,148,0.6)';
      ctx.stroke();
      ctx.fillStyle = '#6b7680';
      ctx.font = 'italic bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', mx, my + 0.5);
      ctx.restore();
    }
    for (let i = 0; i < pts.length; i++)
      this.pt(ctx, pos[i].x, pos[i].y, this.rgb(this.mix('#9aa9b6', gc[pts[i].g], mix)));
  }

  private draw_tri(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const gc = eng.groupColors;
    const accent = this.accent;
    let mix = 0;
    let pos: any[];
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.cx, p.sx, re), y: this.lerp(p.cy, p.sy, re) }));
      mix = 1 - re;
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.sx, y: p.sy }));
      mix = 0;
    } else if (idx === 2) {
      const mT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.sx, p.cx, mT), y: this.lerp(p.sy, p.cy, mT) }));
      mix = mT;
    } else {
      pos = pts.map((p: any) => ({ x: p.cx, y: p.cy }));
      mix = 1;
    }
    if (idx === 1) {
      const T = eng.triplets.length;
      const k = Math.min(T - 1, Math.floor(local * T));
      const frac = local * T - k;
      const fade = Math.sin(Math.min(1, frac) * Math.PI);
      const [a, b, c] = eng.triplets[k];
      this.line(ctx, pos[a], pos[b], this.hexA(accent, 0.85 * fade), 1.8);
      this.line(ctx, pos[a], pos[c], this.rgba([154, 169, 182], 0.7 * fade), 1.2, [3, 3]);
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos[a].x, pos[a].y, 8.5, 0, 6.283);
      ctx.strokeStyle = this.hexA(accent, 0.8 * fade);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }
    if (idx === 3) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(120,134,148,0.35)';
      const c = eng.cent;
      ctx.beginPath();
      ctx.moveTo(c[0].x, c[0].y);
      ctx.lineTo(c[1].x, c[1].y);
      ctx.lineTo(c[2].x, c[2].y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < pts.length; i++)
      this.pt(ctx, pos[i].x, pos[i].y, this.rgb(this.mix('#9aa9b6', gc[pts[i].g], mix)));
  }

  private draw_mds(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const accent = this.accent;
    let pos: any[];
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.px, p.bx, re), y: this.lerp(p.py, p.by, re) }));
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.bx, y: p.by }));
    } else if (idx === 2) {
      const mT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.bx, p.px, mT), y: this.lerp(p.by, p.py, mT) }));
    } else {
      pos = pts.map((p: any) => ({ x: p.px, y: p.py }));
    }
    if (idx === 1) {
      const A = eng.anchors;
      const k = Math.min(A.length - 1, Math.floor(local * A.length));
      const frac = local * A.length - k;
      const fade = Math.sin(Math.min(1, frac) * Math.PI);
      const a = A[k];
      ctx.save();
      ctx.lineWidth = 0.9;
      for (let j = 0; j < pts.length; j++) {
        if (j === a) continue;
        ctx.strokeStyle = this.hexA(accent, 0.22 * fade);
        ctx.beginPath();
        ctx.moveTo(pos[a].x, pos[a].y);
        ctx.lineTo(pos[j].x, pos[j].y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(pos[a].x, pos[a].y, 8, 0, 6.283);
      ctx.strokeStyle = this.hexA(accent, 0.85 * fade);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }
    if (idx >= 2) {
      const ea = idx === 2 ? 0.3 : 0.2;
      for (const [i, j] of eng.edges) this.line(ctx, pos[i], pos[j], this.rgba([154, 169, 182], ea), 1);
    }
    for (let i = 0; i < pts.length; i++) this.pt(ctx, pos[i].x, pos[i].y, pts[i].color);
  }

  private draw_sammon(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const accent = this.accent;
    let pos: any[];
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.px, p.bx, re), y: this.lerp(p.py, p.by, re) }));
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.bx, y: p.by }));
    } else if (idx === 2) {
      const mT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.bx, p.px, mT), y: this.lerp(p.by, p.py, mT) }));
    } else {
      pos = pts.map((p: any) => ({ x: p.px, y: p.py }));
    }
    if (idx === 1) {
      const inA = this.sm(local / 0.6);
      const farA = Math.sin(Math.min(1, local) * Math.PI) * 0.4;
      for (const [i, j] of eng.far) this.line(ctx, pos[i], pos[j], this.rgba([154, 169, 182], farA), 1, [3, 4]);
      for (const [i, j] of eng.near) this.line(ctx, pos[i], pos[j], this.hexA(accent, 0.55 * inA), 1.6);
    }
    if (idx >= 2) {
      const ea = idx === 2 ? 0.4 : 0.25;
      for (const [i, j] of eng.near) this.line(ctx, pos[i], pos[j], this.hexA(accent, ea), 1.3);
    }
    for (let i = 0; i < pts.length; i++) this.pt(ctx, pos[i].x, pos[i].y, pts[i].color);
  }

  private draw_iso(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const n = pts.length;
    const accent = this.accent;
    let pos: any[];
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.ux, p.bx, re), y: this.lerp(p.uy, p.by, re) }));
    } else if (idx <= 2) {
      pos = pts.map((p: any) => ({ x: p.bx, y: p.by }));
    } else if (idx === 3) {
      const uT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.bx, p.ux, uT), y: this.lerp(p.by, p.uy, uT) }));
    } else {
      pos = pts.map((p: any) => ({ x: p.ux, y: p.uy }));
    }
    if (idx === 1) {
      const m = Math.floor(this.sm(local) * (n - 1));
      for (let i = 0; i < m; i++) this.line(ctx, pos[i], pos[i + 1], this.rgba([154, 169, 182], 0.45), 1.1);
    }
    if (idx === 2) {
      for (let i = 0; i < n - 1; i++) this.line(ctx, pos[i], pos[i + 1], this.rgba([154, 169, 182], 0.3), 1);
      this.line(ctx, pos[0], pos[n - 1], 'rgba(120,134,148,0.5)', 1, [4, 4]);
      const m = Math.floor(this.sm(local) * (n - 1));
      ctx.save();
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = this.hexA(accent, 0.9);
      ctx.beginPath();
      ctx.moveTo(pos[0].x, pos[0].y);
      for (let i = 1; i <= m; i++) ctx.lineTo(pos[i].x, pos[i].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pos[m].x, pos[m].y, 6, 0, 6.283);
      ctx.fillStyle = this.hexA(accent, 0.9);
      ctx.fill();
      ctx.restore();
    }
    if (idx >= 3) {
      const ea = idx === 3 ? 0.3 : 0.18;
      for (let i = 0; i < n - 1; i++) this.line(ctx, pos[i], pos[i + 1], this.rgba([154, 169, 182], ea), 1);
    }
    for (let i = 0; i < n; i++) this.pt(ctx, pos[i].x, pos[i].y, pts[i].color);
  }

  private draw_lle(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const n = pts.length;
    const accent = this.accent;
    let pos: any[];
    let webA = 0;
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.ux, p.bx, re), y: this.lerp(p.uy, p.by, re) }));
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.bx, y: p.by }));
      webA = this.sm(local);
    } else if (idx === 2) {
      const uT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.bx, p.ux, uT), y: this.lerp(p.by, p.uy, uT) }));
      webA = 0.8;
    } else {
      pos = pts.map((p: any) => ({ x: p.ux, y: p.uy }));
      webA = 0.5 * (1 - this.sm(local));
    }
    if (webA > 0) {
      ctx.save();
      for (const s of eng.samples) {
        for (let dj = -2; dj <= 2; dj++) {
          const j = s + dj;
          if (dj === 0 || j < 0 || j >= n) continue;
          this.line(ctx, pos[s], pos[j], this.hexA(accent, 0.5 * webA), 1.2);
        }
        ctx.beginPath();
        ctx.arc(pos[s].x, pos[s].y, 8, 0, 6.283);
        ctx.strokeStyle = this.hexA(accent, 0.65 * webA);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = 0; i < n; i++) this.pt(ctx, pos[i].x, pos[i].y, pts[i].color);
  }

  private draw_ltsa(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const n = pts.length;
    const accent = this.accent;
    let pos: any[];
    let tanA = 0;
    let tanLen = 15;
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.ux, p.bx, re), y: this.lerp(p.uy, p.by, re) }));
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.bx, y: p.by }));
      tanA = 0.85;
      tanLen = 15 * this.sm(local);
    } else if (idx === 2) {
      const uT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.bx, p.ux, uT), y: this.lerp(p.by, p.uy, uT) }));
      tanA = 0.75;
    } else {
      pos = pts.map((p: any) => ({ x: p.ux, y: p.uy }));
      tanA = 0.4 * (1 - this.sm(local));
    }
    if (tanA > 0 && tanLen > 0.5) {
      ctx.save();
      ctx.lineCap = 'round';
      for (const s of eng.samples) {
        const a = pos[Math.max(0, s - 1)];
        const b = pos[Math.min(n - 1, s + 1)];
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const ex = Math.cos(ang) * tanLen;
        const ey = Math.sin(ang) * tanLen;
        ctx.strokeStyle = this.hexA(accent, tanA);
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(pos[s].x - ex, pos[s].y - ey);
        ctx.lineTo(pos[s].x + ex, pos[s].y + ey);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = 0; i < n; i++) this.pt(ctx, pos[i].x, pos[i].y, pts[i].color);
  }

  private draw_topo(ctx: CanvasRenderingContext2D, idx: number, local: number, eng: any): void {
    this.grid(ctx);
    const pts = eng.pts;
    const edges = eng.edges;
    const gc = eng.groupColors;
    const accent = this.accent;
    let mix = 0;
    let pos: any[];
    let edgeCount = 0;
    let edgeA = 0;
    if (idx === 0) {
      const re = this.sm(local / 0.55);
      pos = pts.map((p: any) => ({ x: this.lerp(p.cx, p.sx, re), y: this.lerp(p.cy, p.sy, re) }));
      mix = 1 - re;
    } else if (idx === 1) {
      pos = pts.map((p: any) => ({ x: p.sx, y: p.sy }));
      edgeCount = Math.floor(this.sm(local) * edges.length);
      edgeA = 0.5;
    } else if (idx === 2) {
      const mT = this.sm(local);
      pos = pts.map((p: any) => ({ x: this.lerp(p.sx, p.cx, mT), y: this.lerp(p.sy, p.cy, mT) }));
      mix = mT;
      edgeCount = edges.length;
      edgeA = 0.45;
    } else {
      pos = pts.map((p: any) => ({ x: p.cx, y: p.cy }));
      mix = 1;
      edgeCount = edges.length;
      edgeA = 0.3;
    }
    for (let e = 0; e < edgeCount; e++) {
      const [i, j] = edges[e];
      this.line(
        ctx,
        pos[i],
        pos[j],
        idx === 1 ? this.hexA(accent, edgeA) : this.rgba(this.mix('#9aa9b6', '#7e8f9c', mix), edgeA),
        1.2
      );
    }
    if (idx === 1 && edgeCount > 0 && edgeCount <= edges.length) {
      const [, j] = edges[Math.min(edgeCount - 1, edges.length - 1)];
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos[j].x, pos[j].y, 7.5, 0, 6.283);
      ctx.strokeStyle = this.hexA(accent, 0.8);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < pts.length; i++)
      this.pt(ctx, pos[i].x, pos[i].y, this.rgb(this.mix('#9aa9b6', gc[pts[i].g], mix)));
  }

  // ---------- loop ----------
  private phaseOf(caps: CaptionStep[], t: number): { i: number; local: number } {
    let acc = 0;
    for (let i = 0; i < caps.length; i++) {
      if (t < acc + caps[i].d) return { i, local: (t - acc) / caps[i].d };
      acc += caps[i].d;
    }
    return { i: caps.length - 1, local: 1 };
  }

  private tick = (): void => {
    this.rafId = null;
    const canvas = this.canvasRef?.nativeElement;
    if (!this.isOpen || !canvas || !this.eng) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.clock += dt * this.speed;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.W, this.H);
    const total = this.caps.reduce((s, c) => s + c.d, 0);
    const { i, local } = this.phaseOf(this.caps, this.clock % total);
    (this as any)['draw_' + this.methodKeyResolved()](ctx, i, local, this.eng);

    if (this.currentPhase !== i) {
      this.currentPhase = i;
      this.cdr.detectChanges();
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  private methodKeyResolved(): string {
    return this.META[this.methodKey] ? this.methodKey : 'pca';
  }
}
