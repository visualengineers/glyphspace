import { GlyphObject } from '../../glyph/glyph-object';
import { ItemFilter } from './item-filter';

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
    return "";
  }

  public override inFilter(item: GlyphObject): boolean {
    if (!item.values) return false
    
    return Object.values(item.values).some(val =>
      this._acceptableStrings.includes(String(val).toLowerCase())
    );
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

  public extendacceptableStrings(newStrings: string[]) {
    newStrings.forEach((text: string) => {
      if (this._acceptableStrings.indexOf(text.toLowerCase()) === -1) {
        this._acceptableStrings.push(text.toLowerCase());
      }
    });
    this._acceptableStrings.sort();
  }
}
