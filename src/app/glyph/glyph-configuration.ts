import { GlyphType } from "../shared/enum/glyph-type";

export class GlyphConfiguration {
  private _useCoordinateSystem = true;
  private _useCategories = true;
  private _useBackground = true;
  private _useLabels = true;
  private _useContour = true;
  private _radius = 0;
  private _accessors: any[] = [];
  private _scaleLinear = false;

  private _glyphType: GlyphType = GlyphType.Star;

  private options = [
    { property: 'useCoordinateSystem', label: 'Coordinate System' },
    { property: 'useBackground', label: 'Circle Background' },
    { property: 'useContour', label: 'Contour' },
    { property: 'scaleLinear', label: 'Scale Linear' },
    { property: 'useLabels', label: 'Labels' }
  ];

  get useCoordinateSystem(): boolean { return this._useCoordinateSystem; }
  set useCoordinateSystem(flag: boolean) { this._useCoordinateSystem = flag; }

  get useBackground(): boolean { return this._useBackground; }
  set useBackground(flag: boolean) { this._useBackground = flag; }

  get useCategories(): boolean { return this._useCategories; }
  set useCategories(flag: boolean) { this._useCategories = flag; }

  get useContour(): boolean { return this._useContour; }
  set useContour(flag: boolean) { this._useContour = flag; }

  get useLabels(): boolean { return this._useLabels; }
  set useLabels(flag: boolean) { this._useLabels = flag; }

  get glyphOptions(): any { return this.options; }
  set glyphOptions(options: any) { this.options = options; }

  get glyphType(): GlyphType { return this._glyphType; }
  set glyphType(type: GlyphType) { this._glyphType = type; }

  get radius(): number { return this._radius; }
  set radius(r: number) { this._radius = r; }

  get accessors(): any[] { return this._accessors; }
  set accessors(acc: any[]) { this._accessors = acc; }

  get scaleLinear(): boolean { return this._scaleLinear; }
  set scaleLinear(scaleLinear: boolean) { this._scaleLinear = scaleLinear; }
}