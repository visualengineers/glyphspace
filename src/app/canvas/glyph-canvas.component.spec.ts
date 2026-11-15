import { isClick } from './glyph-canvas.component';
import { CLICK_DISTANCE_THRESHOLD, CLICK_TIME_THRESHOLD_MS } from '../shared/constants/canvas-constants';

describe('isClick', () => {
  const down = { x: 100, y: 100, time: 1000 };

  it('accepts a release near the press, soon enough', () => {
    expect(isClick(down, { x: 102, y: 101, time: 1100 })).toBe(true);
  });

  // Regression: the distance was measured from the last mouse move, so any
  // quick pan counted as a click and pinned a tooltip.
  it('rejects a quick pan that ends far from where the button went down', () => {
    expect(isClick(down, { x: 100 + CLICK_DISTANCE_THRESHOLD * 10, y: 100, time: 1100 })).toBe(false);
  });

  it('rejects a long press', () => {
    expect(isClick(down, { x: 100, y: 100, time: 1000 + CLICK_TIME_THRESHOLD_MS })).toBe(false);
  });

  it('rejects a release without a press on the canvas (e.g. it started on an overlay)', () => {
    expect(isClick(null, { x: 100, y: 100, time: 1000 })).toBe(false);
  });
});
