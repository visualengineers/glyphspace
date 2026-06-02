import { GlyphType } from '../shared/enum/glyph-type';

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

  private _glyphType: GlyphType = GlyphType.Star;

  private options: GlyphOption[] = [
    { property: 'useCoordinateSystem', label: 'Coordinate System' },
    { property: 'useBackground', label: 'Circle Background' },
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
}
