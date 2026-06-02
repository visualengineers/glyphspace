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

  private filterChangedSubject = new Subject<void>();
  filterChanged$: Observable<void> = this.filterChangedSubject.asObservable();

  totalItems = 0;
  filteredItems = 0;

  /**
   * Set the active glyph data reference used by refreshFilters().
   * Called by DataLoaderService when the active dataset changes.
   */
  setActiveGlyphData(data: Map<string, GlyphObject> | undefined): void {
    this.activeGlyphData = data;
  }

  /**
   * Get the current active glyph data map.
   * Used by histogram for selection overlay computation.
   */
  getGlyphDataSync(): Map<string, GlyphObject> | undefined {
    return this.activeGlyphData;
  }

  clearFilters(): void {
    this.filters.splice(0, this.filters.length);
    this.refreshFilters();
  }

  getFilters(): ItemFilter[] {
    return this.filters;
  }

  ensureFilter(filter: ItemFilter): void {
    if (!this.filters.includes(filter)) {
      this.filters.push(filter);
    }
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
    if (glyphData == null) return;

    let count = 0;
    const allFiltersEmpty = this.filters.length === 0 || this.filters.every(filter => filter.empty());
    const orFiltering = this.filters
      .filter(filter => filter.filterMode === FilterMode.Or)
      .every(filter => filter.empty());
    glyphData.forEach((item: GlyphObject) => {
      let andFilter = true;
      let orFilter = orFiltering;
      this.filters.forEach(filter => {
        if (filter.empty()) {
          return;
        }

        if (filter.filterMode === FilterMode.Or) {
          orFilter = orFilter || filter.inFilter(item);
        } else if (filter.filterMode === FilterMode.And) {
          andFilter = andFilter && filter.inFilter(item);
        }
      });

      item.passive = allFiltersEmpty ? false : !(andFilter && orFilter);
      if (!item.passive) count++;
    });
    this.filteredItems = count;
    this.filterChangedSubject.next();
  }
}
