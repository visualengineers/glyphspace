import { drawIso, drawLle, drawLtsa } from './preview-draw-manifold';
import { drawTopo, drawTri, drawTsne, drawUmap } from './preview-draw-cluster';
import { drawFast, drawMds, drawPca, drawSammon } from './preview-draw-linear';
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from './preview-geometry';
import { FrameState, PreviewEngine } from './preview-types';

/** Highest device-pixel ratio the preview renders at (sharp but cheap). */
export const MAX_PREVIEW_DPR = 2;

/**
 * Sizes `canvas` for the preview at the given device-pixel ratio and returns
 * its 2-D context scaled to logical (CSS pixel) coordinates.
 */
export function sizeCanvas(canvas: HTMLCanvasElement, dpr: number): CanvasRenderingContext2D | null {
  canvas.width = PREVIEW_WIDTH * dpr;
  canvas.height = PREVIEW_HEIGHT * dpr;
  canvas.style.width = PREVIEW_WIDTH + 'px';
  canvas.style.height = PREVIEW_HEIGHT + 'px';
  const ctx = canvas.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/**
 * Draws one frame: clears the canvas, blits the static `background` (see
 * `gridLayer()`) and draws the method-specific animation state.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  engine: PreviewEngine,
  frame: FrameState,
  background: CanvasImageSource | null
): void {
  ctx.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
  if (background) ctx.drawImage(background, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
  switch (engine.kind) {
    case 'pca':
      return drawPca(ctx, engine, frame);
    case 'fast':
      return drawFast(ctx, engine, frame);
    case 'mds':
      return drawMds(ctx, engine, frame);
    case 'sammon':
      return drawSammon(ctx, engine, frame);
    case 'umap':
      return drawUmap(ctx, engine, frame);
    case 'tsne':
      return drawTsne(ctx, engine, frame);
    case 'tri':
      return drawTri(ctx, engine, frame);
    case 'topo':
      return drawTopo(ctx, engine, frame);
    case 'iso':
      return drawIso(ctx, engine, frame);
    case 'lle':
      return drawLle(ctx, engine, frame);
    case 'ltsa':
      return drawLtsa(ctx, engine, frame);
  }
}
