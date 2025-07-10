import { GlyphObject } from "../../glyph/glyph-object";
import { ItemFilter } from "./item-filter";

export class IdFilter extends ItemFilter {
  private _accaptableIds: string[];

  constructor(acceptableIds?: string[]) {
    super();
    this._accaptableIds = acceptableIds === undefined ? [] : acceptableIds;
  }

  public override info() {
    return "Id Filter Length " + this._accaptableIds.length + " FilterMode: " + this.filterMode;
  }

  public override empty() {
    return this._accaptableIds.length <= 0;
  }

  public override inFilter(item: GlyphObject): boolean {
    return this._accaptableIds.indexOf(item.id) >= 0;
  }

  public add(id: string) {
    const pos = this._accaptableIds.indexOf(id);
    if (pos < 0) {
        this._accaptableIds.push(id);
    }
  }

  public remove(id: string) {
    const pos = this._accaptableIds.indexOf(id);
    if (pos >= 0) {
        this._accaptableIds.splice(pos, 1);
    }
  }

  public toggle(id: string) {
    const pos = this._accaptableIds.indexOf(id);
    if (pos >= 0) {
        this._accaptableIds.splice(pos, 1);
    } else {
      this._accaptableIds.push(id);
    }
  }

  public get accaptableIds(): string[] {
    return this._accaptableIds;
  }

  public set accaptableIds(ids: string[]) {
    this._accaptableIds = ids.sort();
  }

  public override clear() {
    this._accaptableIds.splice(0, this._accaptableIds.length);
  }

  public addMultiple(newIds: string[]) {
    newIds.forEach((id: string) => {
      if (this._accaptableIds.indexOf(id) < 0) {
        this._accaptableIds.push(id);
      }
    });
    this._accaptableIds.sort();
  }
}
