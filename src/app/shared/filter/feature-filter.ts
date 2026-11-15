import { GlyphObject } from '../../glyph/glyph-object';
import { binOfValue } from '../utils/histogram.utils';
import { ItemFilter } from './item-filter';

interface BinRange {
  minBin: number;
  maxBin: number;
  binCount: number;
}

/**
 * Accepts the items counted in a range of bins of a numeric feature's histogram
 * (the sidebar brush). Bins are numpy's half-open bins of the normalised value
 * (`binOfValue`), so the filter keeps exactly the items drawn in the brushed bars.
 */
export class FeatureFilter extends ItemFilter {
  private _featureName: string;
  private range: BinRange | null = null;

  constructor(featureName = '') {
    super();
    this._featureName = featureName;
  }

  public override clear() {
    this.range = null;
  }

  public override empty() {
    return this.range === null;
  }

  public override info() {
    const range = this.range ? `bins ${this.range.minBin}–${this.range.maxBin} of ${this.range.binCount}` : 'no range';
    return `Feature Filter for ${this.featureName} with ${range} FilterMode: ${this.filterMode}`;
  }

  public override inFilter(item: GlyphObject): boolean {
    if (!this.range) return false;
    const value = item.features?.[item.currentContext]?.[this._featureName];
    if (typeof value !== 'number' || Number.isNaN(value)) return false;
    const bin = binOfValue(value, this.range.binCount);
    return bin >= this.range.minBin && bin <= this.range.maxBin;
  }

  /** Accept the items in bins minBin … maxBin (inclusive) of a histogram with binCount bins. */
  public setBinRange(minBin: number, maxBin: number, binCount: number): void {
    if (!Number.isInteger(binCount) || binCount < 1) throw new RangeError('binCount must be a positive integer');
    if (!Number.isInteger(minBin) || !Number.isInteger(maxBin) || minBin < 0 || maxBin >= binCount) {
      throw new RangeError('bins must be integers within the histogram');
    }
    if (minBin > maxBin) throw new RangeError('minBin must be <= maxBin');
    this.range = { minBin, maxBin, binCount };
  }

  public get minBin(): number | undefined {
    return this.range?.minBin;
  }

  public get maxBin(): number | undefined {
    return this.range?.maxBin;
  }

  public get featureName(): string {
    return this._featureName;
  }
  public set featureName(newFeatureName: string) {
    this._featureName = newFeatureName;
  }
}
