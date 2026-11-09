import { ZoomLevel } from '../shared/enum/zoom-level';

/**
 * Point size: diameter of a point in px at 100 % zoom. Positions are scaled to
 * the canvas, so world units are screen pixels at that zoom.
 */
export const POINT_SIZE_PX = { min: 2, max: 20, default: 6 } as const;

/** Glyph size: diameter of a glyph in px in the magic lens; glyphs on the canvas scale with it. */
export const GLYPH_SIZE_PX = { min: 16, max: 120, default: 48 } as const;

/** Canvas radius (world units) of a full-detail glyph per px of glyph size: 48 px give radius 5. */
const HIGH_RADIUS_PER_GLYPH_PX = 5 / 48;

/** Glyphs at medium zoom are half as large as full-detail ones. */
const MEDIUM_RADIUS_FACTOR = 0.5;

export class GlyphSizeInfo {
  private radii = new Map<ZoomLevel, number>();
  private contourThicknesses = new Map<ZoomLevel, number>();
  private hitTolerances = new Map<ZoomLevel, number>();

  private _pointSize: number = POINT_SIZE_PX.default;
  private _glyphSize: number = GLYPH_SIZE_PX.default;

  private _currentZoomLevel: ZoomLevel = ZoomLevel.low;
  private _currentRadius = 1;
  private _currentContour = 0;
  private _currentHitTolerance = 0;

  constructor(
    private baseContour = 0.3,
    private baseHitTolerance = 8
  ) {
    this.update();
  }

  clone(): GlyphSizeInfo {
    const cloned = new GlyphSizeInfo(this.baseContour, this.baseHitTolerance);
    cloned.setSizes(this._pointSize, this._glyphSize);

    // Keep overrides of the current values (e.g. an enlarged radius)
    cloned._currentZoomLevel = this._currentZoomLevel;
    cloned._currentRadius = this._currentRadius;
    cloned._currentContour = this._currentContour;
    cloned._currentHitTolerance = this._currentHitTolerance;

    return cloned;
  }

  /** Recompute all sizes, e.g. after the device pixel ratio changed. */
  update(): void {
    const pixelRatio = window.devicePixelRatio || 1;
    const depthFactor = window.screen.pixelDepth / 24;
    const scale = 1.25;

    const highRadius = this._glyphSize * HIGH_RADIUS_PER_GLYPH_PX;
    this.radii.set(ZoomLevel.low, this._pointSize / 2);
    this.radii.set(ZoomLevel.medium, highRadius * MEDIUM_RADIUS_FACTOR);
    this.radii.set(ZoomLevel.high, highRadius);

    this.contourThicknesses.set(ZoomLevel.low, this.baseContour);
    this.contourThicknesses.set(ZoomLevel.medium, this.baseContour);
    this.contourThicknesses.set(ZoomLevel.high, this.baseContour * scale);

    this.hitTolerances.set(ZoomLevel.low, this.baseHitTolerance / depthFactor / pixelRatio);
    this.hitTolerances.set(ZoomLevel.medium, (this.baseHitTolerance * 4) / depthFactor / pixelRatio);
    this.hitTolerances.set(ZoomLevel.high, (this.baseHitTolerance * 16) / depthFactor / pixelRatio);

    this.updateInfo();
  }

  /** Take over the user's point and glyph size (px). Returns whether a size changed. */
  setSizes(pointSize: number, glyphSize: number): boolean {
    if (pointSize === this._pointSize && glyphSize === this._glyphSize) return false;
    this._pointSize = pointSize;
    this._glyphSize = glyphSize;
    this.update();
    return true;
  }

  get pointSize(): number {
    return this._pointSize;
  }

  get glyphSize(): number {
    return this._glyphSize;
  }

  private updateInfo() {
    // Save map lookups
    this._currentRadius = this.getRadius(this._currentZoomLevel);
    this._currentContour = this.getContourThickness(this._currentZoomLevel);
    this._currentHitTolerance = this.getHitTolerance(this._currentZoomLevel);
  }

  // === Zoom level management ===
  set currentZoomLevel(level: ZoomLevel) {
    this._currentZoomLevel = level;
    this.updateInfo(); // Update AFTER setting the new level
  }

  get currentZoomLevel(): ZoomLevel {
    return this._currentZoomLevel;
  }

  // === Direct access by level ===
  getRadius(level: ZoomLevel): number {
    return this.radii.get(level) ?? 1;
  }

  getContourThickness(level: ZoomLevel): number {
    return this.contourThicknesses.get(level) ?? this.baseContour;
  }

  getHitTolerance(level: ZoomLevel): number {
    return this.hitTolerances.get(level) ?? this.baseHitTolerance;
  }

  // === Convenient current-level accessors ===
  get radius(): number {
    return this._currentRadius;
  }

  set radius(radius: number) {
    this._currentRadius = radius;
  }

  get contourThickness(): number {
    return this._currentContour;
  }

  get hitTolerance(): number {
    return this._currentHitTolerance;
  }

  set hitTolerance(tolerance: number) {
    this._currentHitTolerance = tolerance;
  }
}
