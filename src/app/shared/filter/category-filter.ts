import { GlyphObject } from '../../glyph/glyph-object';
import { binOfValue } from '../utils/histogram.utils';
import { ItemFilter } from './item-filter';

/**
 * Accepts the items counted in the clicked bars of a categorical histogram.
 * An item is in a bar exactly when its normalised value falls in that bin
 * (`binOfValue`), so a click never picks up items of the neighbouring bar.
 */
export class CategoryFilter extends ItemFilter {
  private _featureName: string;
  private bins = new Set<number>();
  private binCount = 0;

  constructor(featureName = '') {
    super();
    this._featureName = featureName;
  }

  public override clear(): void {
    this.bins.clear();
  }

  public override empty(): boolean {
    return this.bins.size === 0;
  }

  public override info(): string {
    return `CategoryFilter for ${this._featureName} with bins ${[...this.bins].join(', ')} of ${this.binCount} | FilterMode: ${this.filterMode}`;
  }

  public override inFilter(item: GlyphObject): boolean {
    if (this.empty()) return false;
    const value = item.features?.[item.currentContext]?.[this._featureName];
    if (typeof value !== 'number' || Number.isNaN(value)) return false;
    return this.bins.has(binOfValue(value, this.binCount));
  }

  /** Accept the items in the given bins of a histogram with binCount bins. */
  public setBins(bins: Iterable<number>, binCount: number): void {
    if (!Number.isInteger(binCount) || binCount < 1) throw new RangeError('binCount must be a positive integer');
    const selected = new Set(bins);
    for (const bin of selected) {
      if (!Number.isInteger(bin) || bin < 0 || bin >= binCount) {
        throw new RangeError('bins must be integers within the histogram');
      }
    }
    this.bins = selected;
    this.binCount = binCount;
  }

  public get selectedBins(): ReadonlySet<number> {
    return this.bins;
  }

  public get featureName(): string {
    return this._featureName;
  }

  public set featureName(name: string) {
    this._featureName = name;
  }
}
