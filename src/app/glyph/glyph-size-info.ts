import { ZoomLevel } from '../shared/enum/zoom-level';

/**
 * Item size: diameter of a point in px at 100 % zoom (positions are scaled to
 * the canvas, so world units are screen pixels there). Glyphs get a radius
 * that makes a typical glyph cover about as much as its point.
 */
export const ITEM_SIZE_PX = { min: 2, max: 20, default: 6 } as const;

/**
 * How far a typical glyph reaches, in point radii. A glyph is mostly empty
 * space between thin petals or spokes, so it has to reach beyond the point's
 * radius to look about as large as the filled dot it replaces.
 */
export const GLYPH_REACH_IN_POINT_RADII = 2;

export class GlyphSizeInfo {
  private radii = new Map<ZoomLevel, number>();
  private contourThicknesses = new Map<ZoomLevel, number>();
  private hitTolerances = new Map<ZoomLevel, number>();

  private _itemSize: number = ITEM_SIZE_PX.default;
  private _reach = 1;

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
    cloned.setSizes(this._itemSize, this._reach);

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

    // A glyph keeps its size across zoom levels; only how it is drawn changes.
    const pointRadius = this._itemSize / 2;
    const glyphRadius = (pointRadius * GLYPH_REACH_IN_POINT_RADII) / this._reach;
    this.radii.set(ZoomLevel.low, pointRadius);
    this.radii.set(ZoomLevel.medium, glyphRadius);
    this.radii.set(ZoomLevel.high, glyphRadius);

    this.contourThicknesses.set(ZoomLevel.low, this.baseContour);
    this.contourThicknesses.set(ZoomLevel.medium, this.baseContour);
    this.contourThicknesses.set(ZoomLevel.high, this.baseContour * scale);

    this.hitTolerances.set(ZoomLevel.low, this.baseHitTolerance / depthFactor / pixelRatio);
    this.hitTolerances.set(ZoomLevel.medium, (this.baseHitTolerance * 4) / depthFactor / pixelRatio);
    this.hitTolerances.set(ZoomLevel.high, (this.baseHitTolerance * 16) / depthFactor / pixelRatio);

    this.updateInfo();
  }

  /**
   * Take over the item size (px) and how far a typical glyph reaches as a
   * fraction of its radius (see typicalGlyphReach). Returns whether anything changed.
   */
  setSizes(itemSize: number, reach: number): boolean {
    if (itemSize === this._itemSize && reach === this._reach) return false;
    this._itemSize = itemSize;
    this._reach = reach > 0 ? reach : 1;
    this.update();
    return true;
  }

  get itemSize(): number {
    return this._itemSize;
  }

  get reach(): number {
    return this._reach;
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
