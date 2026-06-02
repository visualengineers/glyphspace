import { GlyphObject } from '../../glyph/glyph-object';
import { ItemFilter } from './item-filter';

export class IdFilter extends ItemFilter {
  private _acceptableIds: string[];

  constructor(acceptableIds?: string[]) {
    super();
    this._acceptableIds = acceptableIds === undefined ? [] : acceptableIds;
  }

  public override info() {
    return 'Id Filter Length ' + this._acceptableIds.length + ' FilterMode: ' + this.filterMode;
  }

  public override empty() {
    return this._acceptableIds.length <= 0;
  }

  public override inFilter(item: GlyphObject): boolean {
    return this._acceptableIds.indexOf(item.id) >= 0;
  }

  public add(id: string) {
    const pos = this._acceptableIds.indexOf(id);
    if (pos < 0) {
      this._acceptableIds.push(id);
    }
  }

  public remove(id: string) {
    const pos = this._acceptableIds.indexOf(id);
    if (pos >= 0) {
      this._acceptableIds.splice(pos, 1);
    }
  }

  public toggle(id: string) {
    const pos = this._acceptableIds.indexOf(id);
    if (pos >= 0) {
      this._acceptableIds.splice(pos, 1);
    } else {
      this._acceptableIds.push(id);
    }
  }

  public get acceptableIds(): string[] {
    return this._acceptableIds;
  }

  public set acceptableIds(ids: string[]) {
    this._acceptableIds = ids.sort();
  }

  public override clear() {
    this._acceptableIds.splice(0, this._acceptableIds.length);
  }

  public addMultiple(newIds: string[]) {
    newIds.forEach((id: string) => {
      if (this._acceptableIds.indexOf(id) < 0) {
        this._acceptableIds.push(id);
      }
    });
    this._acceptableIds.sort();
  }
}
