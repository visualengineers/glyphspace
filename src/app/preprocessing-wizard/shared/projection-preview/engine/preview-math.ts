import { Phase, PhaseStep, Rgb } from './preview-types';

// ---------- deterministic RNG ----------

/** Seeded PRNG (mulberry32), so every preview looks the same on every run. */
export function mulberry(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal samples (Box-Muller) drawn from `rand`. */
export function gaussOf(rand: () => number): () => number {
  return () => {
    const u1 = rand() || 1e-9;
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.283185 * u2);
  };
}

// ---------- colour ----------

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function mixRgb(p: Rgb, q: Rgb, t: number): Rgb {
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
}

export function rgb(c: Rgb): string {
  return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
}

export function rgba(c: Rgb, a: number): string {
  return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + a + ')';
}

const GRADIENT_FROM = hexToRgb('#1aa6bf');
const GRADIENT_TO = hexToRgb('#ff7043');

/** Cyan-to-orange colour ramp for position-coded points; `t` is clamped to 0..1. */
export function grad(t: number): string {
  return rgb(mixRgb(GRADIENT_FROM, GRADIENT_TO, Math.max(0, Math.min(1, t))));
}

// ---------- easing ----------

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smoothstep on a clamped 0..1 input. */
export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// ---------- phases ----------

/** Total duration of one animation loop. */
export function cycleDuration(steps: readonly PhaseStep[]): number {
  return steps.reduce((sum, step) => sum + step.d, 0);
}

/** Phase for a time `t` inside one loop (0 <= t < cycleDuration). */
export function phaseOf(steps: readonly PhaseStep[], t: number): Phase {
  let acc = 0;
  for (let i = 0; i < steps.length; i++) {
    if (t < acc + steps[i].d) return { idx: i, local: (t - acc) / steps[i].d };
    acc += steps[i].d;
  }
  return { idx: steps.length - 1, local: 1 };
}

/** Phase for an ever-growing animation clock (wraps around the loop). */
export function phaseAt(steps: readonly PhaseStep[], clock: number): Phase {
  const total = cycleDuration(steps);
  return total > 0 ? phaseOf(steps, clock % total) : { idx: 0, local: 0 };
}

/**
 * The single frame shown when the user prefers reduced motion: the start of
 * the final phase, which shows the finished embedding with its annotations.
 */
export function stillPhase(steps: readonly PhaseStep[]): Phase {
  return { idx: Math.max(0, steps.length - 1), local: 0 };
}
