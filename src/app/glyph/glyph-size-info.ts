import { ZoomLevel } from "../shared/enum/zoom-level";

export class GlyphSizeInfo {
  private radii = new Map<ZoomLevel, number>();
  private contourThicknesses = new Map<ZoomLevel, number>();
  private hitTolerances = new Map<ZoomLevel, number>();

  private _currentZoomLevel: ZoomLevel = ZoomLevel.low;
  private _currentRadius = 1;
  private _currentContour = 0;
  private _currentHitTolerance = 0;

  constructor(
    private baseRadius = 2,
    private baseContour = 0.3,
    private baseHitTolerance = 8
  ) { }

  clone(): GlyphSizeInfo {
    const cloned = new GlyphSizeInfo(
      this.baseRadius,
      this.baseContour,
      this.baseHitTolerance
    );

    // Clone maps
    this.radii.forEach((value, key) => cloned.radii.set(key, value));
    this.contourThicknesses.forEach((value, key) => cloned.contourThicknesses.set(key, value));
    this.hitTolerances.forEach((value, key) => cloned.hitTolerances.set(key, value));

    // Clone current values
    cloned._currentZoomLevel = this._currentZoomLevel;
    cloned._currentRadius = this._currentRadius;
    cloned._currentContour = this._currentContour;
    cloned._currentHitTolerance = this._currentHitTolerance;

    return cloned;
  }

  /** Update all size info based on canvas and screen properties */
  update(canvasWidth: number, canvasHeight: number): void {
    const baseDim = 900;
    const minDim = Math.min(canvasWidth, canvasHeight);
    const pixelRatio = window.devicePixelRatio || 1;
    const depthFactor = window.screen.pixelDepth / 24;

    const scale = 1.25; // pixelRatio * depthFactor;
    const base = 1 / (depthFactor / pixelRatio) * (minDim / baseDim); // minDim * this.baseRatio;

    this.radii.set(ZoomLevel.low, base * this.baseRadius);
    this.radii.set(ZoomLevel.medium, base * this.baseRadius * scale);
    this.radii.set(ZoomLevel.high, base * this.baseRadius * scale * 2);

    this.contourThicknesses.set(ZoomLevel.low, this.baseContour);
    this.contourThicknesses.set(ZoomLevel.medium, this.baseContour);
    this.contourThicknesses.set(ZoomLevel.high, this.baseContour * scale);

    this.hitTolerances.set(ZoomLevel.low, this.baseHitTolerance / depthFactor / pixelRatio);
    this.hitTolerances.set(ZoomLevel.medium, this.baseHitTolerance * 4 / depthFactor / pixelRatio);
    this.hitTolerances.set(ZoomLevel.high, this.baseHitTolerance * 16 / depthFactor / pixelRatio);

    this.updateInfo();
  }

  private updateInfo() {
    // Save map lookups
    this._currentRadius = this.getRadius(this._currentZoomLevel);
    this._currentContour = this.getContourThickness(this._currentZoomLevel);
    this._currentHitTolerance = this.getHitTolerance(this._currentZoomLevel);
  }

  // === Zoom level management ===
  set currentZoomLevel(level: ZoomLevel) {
    this.updateInfo();
    this._currentZoomLevel = level;
  }

  get currentZoomLevel(): ZoomLevel {
    return this._currentZoomLevel;
  }

  // === Direct access by level ===
  getRadius(level: ZoomLevel): number {
    return this.radii.get(level) ?? this.baseRadius;
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
