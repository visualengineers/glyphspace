import { GlyphObject } from '../../glyph/glyph-object';
import { StringStringMap } from '../interfaces/glyph-feature';
import { ItemFilter } from './item-filter';

/**
 * Lower-cased values per values object. An item's values are replaced, not
 * changed, when its dataset is built again, so the cache never goes stale and
 * a refresh doesn't lower-case every value of every item again.
 */
const lowerCaseValues = new WeakMap<StringStringMap, string[]>();

function lowerCased(values: StringStringMap): string[] {
  let lower = lowerCaseValues.get(values);
  if (!lower) {
    lower = Object.values(values).map(value => String(value).toLowerCase());
    lowerCaseValues.set(values, lower);
  }
  return lower;
}

export class TextFilter extends ItemFilter {
  private _acceptableStrings: string[];

  constructor(acceptableStrings?: string[]) {
    super();
    this._acceptableStrings = acceptableStrings === undefined ? [] : acceptableStrings;
  }

  public override clear() {
    this.acceptableStrings.splice(0, this.acceptableStrings.length);
  }

  public override empty() {
    return this._acceptableStrings.length <= 0;
  }

  public override info() {
    return '';
  }

  /** Matches the item's feature values and its metadata (tooltip-only columns). */
  public override inFilter(item: GlyphObject): boolean {
    return this.matchesAny(item.values) || this.matchesAny(item.metadata);
  }

  private matchesAny(values: StringStringMap | undefined): boolean {
    if (!values) return false;
    return lowerCased(values).some(value => this._acceptableStrings.some(substr => value.includes(substr)));
  }

  public get acceptableStrings(): string[] {
    return this._acceptableStrings;
  }

  public set acceptableStrings(newStrings: string[]) {
    this._acceptableStrings = [];
    newStrings.forEach((text: string) => {
      this._acceptableStrings.push(text.toLowerCase());
    });
    this._acceptableStrings.sort();
  }

  public extendAcceptableStrings(newStrings: string[]) {
    newStrings.forEach((text: string) => {
      if (this._acceptableStrings.indexOf(text.toLowerCase()) === -1) {
        this._acceptableStrings.push(text.toLowerCase());
      }
    });
    this._acceptableStrings.sort();
  }
}
