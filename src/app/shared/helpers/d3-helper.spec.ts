import { hexToRgb } from './d3-helper';

describe('hexToRgb', () => {
  it.each([
    ['#D60000', 'rgb(214, 0, 0)'],
    ['0f0', 'rgb(0, 255, 0)'],
    [0x00cc88, 'rgb(0, 204, 136)'],
    ['rgb(1, 2, 3)', 'rgb(1, 2, 3)'],
  ])('converts %s to %s', (input, expected) => {
    expect(hexToRgb(input)).toBe(expected);
  });

  it('rejects malformed colors', () => {
    expect(() => hexToRgb('#12345')).toThrow();
  });
});
