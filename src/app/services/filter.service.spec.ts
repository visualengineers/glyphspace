import { FilterService } from './filter.service';
import { GlyphObject } from '../glyph/glyph-object';
import { FilterMode } from '../shared/enum/filter-mode';
import { ItemFilter } from '../shared/filter/item-filter';

class TestFilter extends ItemFilter {
  private ids = new Set<string>();

  add(id: string): void {
    this.ids.add(id);
  }

  inFilter(item: GlyphObject): boolean {
    return this.ids.has(item.id);
  }

  empty(): boolean {
    return this.ids.size === 0;
  }

  clear(): void {
    this.ids.clear();
  }

  info(): string {
    return 'TestFilter';
  }
}

function createGlyph(id: string): GlyphObject {
  const glyph = new GlyphObject(id);
  glyph.positions = { t1: { algo1: { x: 0, y: 0 } } };
  return glyph;
}

function createGlyphMap(ids: string[]): Map<string, GlyphObject> {
  const map = new Map<string, GlyphObject>();
  ids.forEach(id => map.set(id, createGlyph(id)));
  return map;
}

describe('FilterService', () => {
  let service: FilterService;

  beforeEach(() => {
    service = new FilterService();
  });

  it('should start with no filters', () => {
    expect(service.getFilters().length).toBe(0);
  });

  it('should emit filterChanged$ when refreshFilters is called', (done: DoneFn) => {
    const glyphMap = createGlyphMap(['1', '2', '3']);
    service.setActiveGlyphData(glyphMap);

    service.filterChanged$.subscribe(() => {
      done();
    });

    service.refreshFilters();
  });

  it('should mark no items as passive when no filters exist', () => {
    const glyphMap = createGlyphMap(['1', '2', '3']);
    service.setActiveGlyphData(glyphMap);
    service.refreshFilters();

    glyphMap.forEach(glyph => {
      expect(glyph.passive).toBeFalse();
    });
    expect(service.filteredItems).toBe(3);
  });

  it('should apply AND filter correctly', () => {
    const glyphMap = createGlyphMap(['1', '2', '3']);
    service.setActiveGlyphData(glyphMap);

    const filter = new TestFilter();
    filter.filterMode = FilterMode.And;
    filter.add('1');
    filter.add('2');

    service.ensureFilter(filter);
    service.refreshFilters();

    expect(glyphMap.get('1')?.passive).toBeFalse();
    expect(glyphMap.get('2')?.passive).toBeFalse();
    expect(glyphMap.get('3')?.passive).toBeTrue();
    expect(service.filteredItems).toBe(2);
  });

  it('should apply OR filter correctly', () => {
    const glyphMap = createGlyphMap(['1', '2', '3']);
    service.setActiveGlyphData(glyphMap);

    const filter = new TestFilter();
    filter.filterMode = FilterMode.Or;
    filter.add('1');

    service.ensureFilter(filter);
    service.refreshFilters();

    expect(glyphMap.get('1')?.passive).toBeFalse();
    expect(glyphMap.get('2')?.passive).toBeTrue();
    expect(glyphMap.get('3')?.passive).toBeTrue();
    expect(service.filteredItems).toBe(1);
  });

  it('should not duplicate filters with ensureFilter', () => {
    const filter = new TestFilter();
    service.ensureFilter(filter);
    service.ensureFilter(filter);
    expect(service.getFilters().length).toBe(1);
  });

  it('should clear all filters', () => {
    const glyphMap = createGlyphMap(['1', '2']);
    service.setActiveGlyphData(glyphMap);

    const filter = new TestFilter();
    filter.filterMode = FilterMode.And;
    filter.add('1');
    service.ensureFilter(filter);

    service.clearFilters();
    expect(service.getFilters().length).toBe(0);

    // After clearing, all items should be active
    glyphMap.forEach(glyph => {
      expect(glyph.passive).toBeFalse();
    });
  });

  it('should treat all-empty filters as no filtering', () => {
    const glyphMap = createGlyphMap(['1', '2']);
    service.setActiveGlyphData(glyphMap);

    const filter = new TestFilter(); // empty
    filter.filterMode = FilterMode.And;
    service.ensureFilter(filter);
    service.refreshFilters();

    glyphMap.forEach(glyph => {
      expect(glyph.passive).toBeFalse();
    });
    expect(service.filteredItems).toBe(2);
  });
});
