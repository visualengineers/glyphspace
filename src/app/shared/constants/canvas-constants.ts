/** Duration of camera fit-to-screen animation in milliseconds */
export const FIT_ANIMATION_DURATION_MS = 500;

/** Margin factor when fitting the view to content (1.1 = 10% padding) */
export const FIT_MARGIN_FACTOR = 1.1;

/** Throttle interval for mouse-move hit testing in milliseconds */
export const HIT_TEST_THROTTLE_MS = 50;

/** Time after last mouse movement before cursor is considered idle (ms) */
export const MOUSE_IDLE_MS = 2000;

/** Maximum elapsed time for a mousedown-mouseup pair to count as a click (ms) */
export const CLICK_TIME_THRESHOLD_MS = 300;

/** Maximum pixel distance for a mousedown-mouseup pair to count as a click */
export const CLICK_DISTANCE_THRESHOLD = 4;

/** Minimum interval between consecutive renderGlyphs calls (ms) */
export const MIN_RENDER_INTERVAL_MS = 50;

/** Enlargement factor for glyphs shown inside the magic lens */
export const LENS_ENLARGEMENT_FACTOR = 5;

/** Transition speed levels of the settings overlay; a canvas starts at the fastest. */
export const TRANSITION_SPEED = { min: 1, max: 10, default: 10 } as const;

/**
 * Share of the remaining way a glyph moves per frame in a transition (moving
 * back after collision avoidance, switching the projection): level 10 moves
 * 10 % per frame, about 0.7 s at 60 fps; level 1 moves 1 %, about 7 s.
 */
export function transitionStep(level: number): number {
  return level / 100;
}

/**
 * Pull of collision avoidance back towards each item's own position. Weak, so
 * overlapping items still move apart; it lets them come back when they get
 * smaller, and keeps the projection's shape.
 */
export const COLLISION_ATTRACTION = 0.05;
