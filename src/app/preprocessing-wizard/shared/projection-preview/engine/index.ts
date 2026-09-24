/**
 * Framework-free animation engine of the projection previews (no Angular
 * imports): deterministic geometry per method, per-frame drawing and loop
 * timing. Ported from the ClaudeDesign "Projection Previews" template.
 */
export * from './preview-types';
export { buildEngine, PREVIEW_HEIGHT, PREVIEW_WIDTH } from './preview-geometry';
export { cycleDuration, phaseAt, phaseOf, stillPhase } from './preview-math';
export { gridLayer } from './preview-primitives';
export { MAX_PREVIEW_DPR, renderFrame, sizeCanvas } from './preview-renderer';
