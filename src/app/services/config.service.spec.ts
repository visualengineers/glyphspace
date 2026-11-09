import { firstValueFrom, skip } from 'rxjs';
import { ConfigService } from './config.service';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES } from '../glyph/glyph-axes';
import { getCategoricalColors, getColorScaleById } from '../shared/interfaces/color-scale';
import { hexToRgb } from '../shared/helpers/d3-helper';

const ids = (count: number) => Array.from({ length: count }, (_, i) => `${i + 1}`);

describe('ConfigService', () => {
  let config: ConfigService;

  beforeEach(() => {
    config = new ConfigService();
  });

  describe('glyph axes', () => {
    it('appends an added feature as the last axis and announces the change', async () => {
      config.replaceActiveFeatures(['3', '1', '2']);
      const changed = firstValueFrom(config.glyphConfigSubject$.pipe(skip(1)));

      expect(config.addGlyphAxis('7')).toBe(true);

      expect(config.activeFeatures).toEqual(['3', '1', '2', '7']);
      await expect(changed).resolves.toBeDefined();
    });

    it(`adds nothing beyond ${MAX_GLYPH_AXES} axes`, () => {
      config.replaceActiveFeatures(ids(MAX_GLYPH_AXES));

      expect(config.addGlyphAxis('99')).toBe(false);
      expect(config.activeFeatures.length).toBe(MAX_GLYPH_AXES);
    });

    it('removes an axis and keeps the order of the others', () => {
      config.replaceActiveFeatures(['3', '1', '2', '7']);

      expect(config.removeGlyphAxis('1')).toBe(true);
      expect(config.activeFeatures).toEqual(['3', '2', '7']);
    });

    it(`keeps at least ${MIN_GLYPH_AXES} axes`, () => {
      config.replaceActiveFeatures(ids(MIN_GLYPH_AXES));

      expect(config.removeGlyphAxis('1')).toBe(false);
      expect(config.activeFeatures.length).toBe(MIN_GLYPH_AXES);
    });
  });

  describe('getRgbaColor', () => {
    it('colors the categories of a categorical feature with the palette in order', () => {
      config.colorRange = 4;
      config.colorFeature = 'kind';
      config.featureTypes = { kind: 'categorical' };
      config.featureCategoryCounts = { kind: 3 };
      const colors = getCategoricalColors(getColorScaleById(4));

      const actual = [0, 0.5, 1].map(value => config.getRgbaColor({ '1': { kind: value } }));

      expect(actual).toEqual(colors.slice(0, 3).map(hexToRgb));
    });
  });
});
