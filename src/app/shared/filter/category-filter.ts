import { GlyphObject } from '../../glyph/glyph-object';
import { ItemFilter } from './item-filter';

export interface CategoryRange {
  min: number;
  max: number;
}

export class CategoryFilter extends ItemFilter {
  private _featureName: string;
  private _ranges: CategoryRange[] = [];

  constructor();
  constructor(featureName?: string);
  constructor(featureName?: string, ranges?: CategoryRange[]) {
    super();
    this._featureName = featureName ?? '';
    if (ranges) {
      this.setRanges(ranges);
    }
  }

  /* -----------------------------
   * Core filter lifecycle
   * ----------------------------- */

  public override clear(): void {
    this._ranges = [];
  }

  public override empty(): boolean {
    return this._ranges.length === 0;
  }

  public override info(): string {
    const ranges = this._ranges.map(r => `[${r.min}, ${r.max}]`).join(', ');

    return `CategoryFilter for ${this._featureName} with ranges ${ranges} | FilterMode: ${this.filterMode}`;
  }

  public override inFilter(item: GlyphObject): boolean {
    if (this.empty()) return false;

    const contextKey = String(item.currentContext);
    const featureContext = item.features[contextKey];
    const value = featureContext?.[this._featureName];

    if (value === undefined) {
      return false;
    }

    return this._ranges.some(r => value >= r.min && value <= r.max);
  }

  /* -----------------------------
   * Feature name
   * ----------------------------- */

  public get featureName(): string {
    return this._featureName;
  }

  public set featureName(name: string) {
    this._featureName = name;
  }

  /* -----------------------------
   * Range management
   * ----------------------------- */

  public get ranges(): readonly CategoryRange[] {
    return this._ranges;
  }

  public addRange(min: number, max: number): void {
    this.validateRange(min, max);
    this._ranges.push({ min, max });
  }

  public removeRange(index: number): void {
    if (index < 0 || index >= this._ranges.length) return;
    this._ranges.splice(index, 1);
  }

  public setRanges(ranges: CategoryRange[]): void {
    ranges.forEach(r => this.validateRange(r.min, r.max));
    this._ranges = [...ranges];
  }

  /* -----------------------------
   * Validation
   * ----------------------------- */

  private validateRange(min: number, max: number): void {
    if (min === undefined || max === undefined) {
      throw new RangeError('range values must be defined');
    }

    // CategoryFilter can work with both normalized [0,1] and raw integer values
    // so we only check that min <= max
    if (min > max) {
      throw new RangeError('min must be <= max');
    }
  }
}
