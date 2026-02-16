import { normalizeFeatureValue } from './color-helper';

describe('normalizeFeatureValue', () => {
  it('should return raw value for non-categorical features', () => {
    const result = normalizeFeatureValue(0.75, 'feat1', { feat1: 'numeric' }, {});
    expect(result).toBe(0.75);
  });

  it('should normalize categorical features by max value', () => {
    const result = normalizeFeatureValue(3, 'feat1', { feat1: 'categorical' }, { feat1: 6 });
    expect(result).toBe(0.5);
  });

  it('should return raw value when categorical max is 0', () => {
    const result = normalizeFeatureValue(3, 'feat1', { feat1: 'categorical' }, { feat1: 0 });
    expect(result).toBe(3);
  });

  it('should return raw value when categorical max is undefined', () => {
    const result = normalizeFeatureValue(3, 'feat1', { feat1: 'categorical' }, {});
    expect(result).toBe(3);
  });

  it('should return raw value when feature type is missing', () => {
    const result = normalizeFeatureValue(0.5, 'unknown', {}, {});
    expect(result).toBe(0.5);
  });

  it('should handle value of 0 for categorical', () => {
    const result = normalizeFeatureValue(0, 'feat1', { feat1: 'categorical' }, { feat1: 10 });
    expect(result).toBe(0);
  });

  it('should handle max value equal to value', () => {
    const result = normalizeFeatureValue(5, 'feat1', { feat1: 'categorical' }, { feat1: 5 });
    expect(result).toBe(1);
  });
});
