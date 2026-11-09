import { DatasetCacheService } from './dataset-cache.service';
import { GlyphFeature } from '../shared/interfaces/glyph-feature';
import { GlyphMeta } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';

const schema = { label: { '1': 'fat' }, metadata: { '1': 'flavor' } } as unknown as GlyphSchema;
const meta: GlyphMeta = { features: {} };

describe('DatasetCacheService', () => {
  it("keeps each item's metadata next to its feature values", () => {
    const cache = new DatasetCacheService();
    const features: GlyphFeature[] = [
      {
        id: 'brie',
        defaultcontext: '1',
        features: { '1': { '1': 0.5 } },
        values: { '1': '45' },
        metadata: { '1': 'buttery' },
      },
      { id: 'gouda', defaultcontext: '1', features: { '1': { '1': 0.2 } }, values: { '1': '30' } },
    ];

    cache.buildDataSet('cheese', '1', schema, meta, features, new Map());

    const glyphs = cache.getGlyphMap('cheese');
    expect(glyphs?.get('brie')?.values).toEqual({ '1': '45' });
    expect(glyphs?.get('brie')?.metadata).toEqual({ '1': 'buttery' });
    expect(glyphs?.get('gouda')?.metadata).toBeUndefined();
  });

  describe('building a dataset again under the same name', () => {
    const item = (id: string, value: number): GlyphFeature => ({
      id,
      defaultcontext: '1',
      features: { '1': { '1': value } },
      values: { '1': String(value) },
    });
    const positions = (...ids: string[]) => new Map([['pca', ids.map(id => ({ id, position: { x: 1, y: 2 } }))]]);

    it('takes the new values of items it already had', () => {
      const cache = new DatasetCacheService();
      cache.buildDataSet('cheese', '1', schema, meta, [item('brie', 0.5)], positions('brie'));

      const count = cache.buildDataSet('cheese', '1', schema, meta, [item('brie', 0.9)], positions('brie'));

      const brie = cache.getGlyphMap('cheese')?.get('brie');
      expect(count).toBe(1);
      expect(brie?.features).toEqual({ '1': { '1': 0.9 } });
      expect(brie?.values).toEqual({ '1': '0.9' });
      expect(brie?.positions['1']['pca']).toEqual({ x: 1, y: 2 });
    });

    it('drops items the new data no longer has', () => {
      const cache = new DatasetCacheService();
      cache.buildDataSet('cheese', '1', schema, meta, [item('brie', 0.5), item('gouda', 0.2)], positions('brie'));

      const count = cache.buildDataSet('cheese', '1', schema, meta, [item('brie', 0.9)], positions('brie'));

      expect(count).toBe(1);
      expect(cache.getGlyphMap('cheese')?.has('gouda')).toBe(false);
    });

    it('keeps the items of other timestamps', () => {
      const cache = new DatasetCacheService();
      cache.buildDataSet('cheese', '1', schema, meta, [item('brie', 0.5), item('gouda', 0.2)], positions('gouda'));

      cache.buildDataSet('cheese', '2', schema, meta, [item('brie', 0.9)], positions('brie'));

      const gouda = cache.getGlyphMap('cheese')?.get('gouda');
      expect(gouda?.positions['1']['pca']).toEqual({ x: 1, y: 2 });
    });
  });
});
