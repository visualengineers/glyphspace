import { GlyphType } from '../shared/enum/glyph-type';
import { GLYPH_SIZE_PX, POINT_SIZE_PX } from './glyph-size-info';

export interface GlyphOption {
  property: string;
  label: string;
}

export class GlyphConfiguration {
  private _useCoordinateSystem = true;
  private _useCategories = true;
  private _useBackground = true;
  private _useLabels = true;
  private _useContour = true;
  private _radius = 0;
  private _scaleLinear = false;
  private _pointSize: number = POINT_SIZE_PX.default;
  private _glyphSize: number = GLYPH_SIZE_PX.default;

  private _glyphType: GlyphType = GlyphType.Star;

  private options: GlyphOption[] = [
    { property: 'useCoordinateSystem', label: 'Coordinate system' },
    { property: 'useBackground', label: 'Circle background' },
    { property: 'useContour', label: 'Contour' },
  ];

  get useCoordinateSystem(): boolean {
    return this._useCoordinateSystem;
  }
  set useCoordinateSystem(flag: boolean) {
    this._useCoordinateSystem = flag;
  }

  get useBackground(): boolean {
    return this._useBackground;
  }
  set useBackground(flag: boolean) {
    this._useBackground = flag;
  }

  get useCategories(): boolean {
    return this._useCategories;
  }
  set useCategories(flag: boolean) {
    this._useCategories = flag;
  }

  get useContour(): boolean {
    return this._useContour;
  }
  set useContour(flag: boolean) {
    this._useContour = flag;
  }

  get useLabels(): boolean {
    return this._useLabels;
  }
  set useLabels(flag: boolean) {
    this._useLabels = flag;
  }

  get glyphOptions(): GlyphOption[] {
    return this.options;
  }
  set glyphOptions(options: GlyphOption[]) {
    this.options = options;
  }

  get glyphType(): GlyphType {
    return this._glyphType;
  }
  set glyphType(type: GlyphType) {
    this._glyphType = type;
  }

  get radius(): number {
    return this._radius;
  }
  set radius(r: number) {
    this._radius = r;
  }

  get scaleLinear(): boolean {
    return this._scaleLinear;
  }
  set scaleLinear(scaleLinear: boolean) {
    this._scaleLinear = scaleLinear;
  }

  /** Diameter of a point in px at 100 % zoom, within POINT_SIZE_PX. */
  get pointSize(): number {
    return this._pointSize;
  }
  set pointSize(px: number) {
    this._pointSize = clampSize(px, POINT_SIZE_PX);
  }

  /** Diameter of a glyph in px in the magic lens, within GLYPH_SIZE_PX. */
  get glyphSize(): number {
    return this._glyphSize;
  }
  set glyphSize(px: number) {
    this._glyphSize = clampSize(px, GLYPH_SIZE_PX);
  }
}

function clampSize(px: number, limits: { min: number; max: number; default: number }): number {
  if (!Number.isFinite(px)) return limits.default;
  return Math.min(limits.max, Math.max(limits.min, Math.round(px)));
}
