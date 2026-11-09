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
});
