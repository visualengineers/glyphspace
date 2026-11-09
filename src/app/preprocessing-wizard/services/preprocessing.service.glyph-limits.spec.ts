import { createTestPreprocessingService } from '../testing/preprocessing-test-helpers';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES } from '../../glyph/glyph-axes';

const names = (count: number) => Array.from({ length: count }, (_, i) => `f${i}`);

/** The wizard takes as many glyph features as the dashboard's glyph legend allows. */
describe('PreprocessingService – glyph feature limits', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it(`takes ${MIN_GLYPH_AXES} to ${MAX_GLYPH_AXES} glyph features`, () => {
    const service = createTestPreprocessingService();

    expect(() => service.setGlyphFeatures(names(MIN_GLYPH_AXES))).not.toThrow();
    expect(() => service.setGlyphFeatures(names(MAX_GLYPH_AXES))).not.toThrow();
    expect(service.currentState.glyphFeatures).toEqual(names(MAX_GLYPH_AXES));
  });

  it.each([MIN_GLYPH_AXES - 1, MAX_GLYPH_AXES + 1])('rejects %s glyph features', count => {
    const service = createTestPreprocessingService();

    expect(() => service.setGlyphFeatures(names(count))).toThrow(`${MIN_GLYPH_AXES}–${MAX_GLYPH_AXES}`);
  });
});
