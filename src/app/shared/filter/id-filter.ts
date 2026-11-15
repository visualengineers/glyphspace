import { GlyphObject } from '../../glyph/glyph-object';
import { ItemFilter } from './item-filter';

/** Accepts the items whose id was selected. The ids are a set, so a test is O(1) however many are selected. */
export class IdFilter extends ItemFilter {
  private ids: Set<string>;

  constructor(acceptableIds: Iterable<string> = []) {
    super();
    this.ids = new Set(acceptableIds);
  }

  public override info() {
    return 'Id Filter Length ' + this.ids.size + ' FilterMode: ' + this.filterMode;
  }

  public override empty() {
    return this.ids.size === 0;
  }

  public override inFilter(item: GlyphObject): boolean {
    return this.ids.has(item.id);
  }

  /** Number of selected ids. */
  public get size(): number {
    return this.ids.size;
  }

  public has(id: string): boolean {
    return this.ids.has(id);
  }

  public add(id: string) {
    this.ids.add(id);
  }

  public remove(id: string) {
    this.ids.delete(id);
  }

  public toggle(id: string) {
    if (!this.ids.delete(id)) this.ids.add(id);
  }

  /** The selected ids, sorted. */
  public get acceptableIds(): string[] {
    return [...this.ids].sort();
  }

  public set acceptableIds(ids: string[]) {
    this.ids = new Set(ids);
  }

  public override clear() {
    this.ids.clear();
  }

  public addMultiple(newIds: Iterable<string>) {
    for (const id of newIds) this.ids.add(id);
  }
}
