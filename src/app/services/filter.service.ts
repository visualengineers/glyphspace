import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GlyphObject } from '../glyph/glyph-object';
import { FilterMode } from '../shared/enum/filter-mode';
import { ItemFilter } from '../shared/filter/item-filter';
import { IdFilter } from '../shared/filter/id-filter';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filters: ItemFilter[] = [];
  private activeGlyphData: Map<string, GlyphObject> | undefined;

  /** Emits after every refresh; filter owners sync their visuals to their filter's state on it. */
  private filterChangedSubject = new Subject<void>();
  filterChanged$: Observable<void> = this.filterChangedSubject.asObservable();

  /** Items of the active dataset. */
  totalItems = 0;
  /** Items of the active dataset that pass the filters. */
  filteredItems = 0;

  /**
   * Make a dataset's items the ones the filters apply to, and count them.
   * Called by DataLoaderService when it opens a dataset.
   */
  setActiveGlyphData(data: Map<string, GlyphObject> | undefined): void {
    this.activeGlyphData = data;
    this.totalItems = data?.size ?? 0;
    this.refreshFilters();
  }

  /**
   * Get the current active glyph data map.
   * Used by histogram for selection overlay computation.
   */
  getGlyphDataSync(): Map<string, GlyphObject> | undefined {
    return this.activeGlyphData;
  }

  /** Reset every filter and unregister it; its owner registers it again on its next use. */
  clearFilters(): void {
    this.filters.forEach(filter => filter.clear());
    this.filters.splice(0, this.filters.length);
    this.refreshFilters();
  }

  getFilters(): readonly ItemFilter[] {
    return this.filters;
  }

  ensureFilter(filter: ItemFilter): void {
    if (!this.filters.includes(filter)) {
      this.filters.push(filter);
    }
  }

  /**
   * Unregister a filter whose owner goes away (a removed canvas) or no longer
   * filters, and refresh. Returns whether it was filtering, so the caller knows
   * whether the canvases need a redraw.
   */
  removeFilter(filter: ItemFilter): boolean {
    const index = this.filters.indexOf(filter);
    if (index < 0) return false;
    const wasFiltering = !filter.empty();
    this.filters.splice(index, 1);
    this.refreshFilters();
    return wasFiltering;
  }

  clearIdFilters(): void {
    this.filters.forEach(filter => {
      if (filter instanceof IdFilter) {
        filter.clear();
      }
    });
  }

  refreshFilters(): void {
    const glyphData = this.activeGlyphData;
    if (glyphData == null) {
      this.filteredItems = 0;
      this.filterChangedSubject.next();
      return;
    }

    let count = 0;
    const active = this.filters.filter(filter => !filter.empty());
    const andFilters = active.filter(filter => filter.filterMode === FilterMode.And);
    const orFilters = active.filter(filter => filter.filterMode === FilterMode.Or);
    glyphData.forEach((item: GlyphObject) => {
      // An item passes when every And filter accepts it and, if any Or filter is
      // active, at least one of them does. Without active filters, every item passes.
      const passes =
        andFilters.every(filter => filter.inFilter(item)) &&
        (orFilters.length === 0 || orFilters.some(filter => filter.inFilter(item)));
      item.passive = !passes;
      if (passes) count++;
    });
    this.filteredItems = count;
    this.filterChangedSubject.next();
  }
}
