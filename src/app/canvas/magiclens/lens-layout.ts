import { forceCollide, forceSimulation, forceX, forceY, SimulationNodeDatum } from 'd3';

/** An item to show in the magic lens. */
export interface LensItem {
  /** Position on the canvas; only the differences between the items matter. */
  x: number;
  y: number;
  /** How far the glyph reaches, as a fraction of its radius (1 for glyphs that fill their circle). */
  extent: number;
}

export interface LensLayout {
  /** Glyph radius, the same for all items so their glyphs stay comparable. */
  radius: number;
  /** Glyph centres relative to the lens centre, in the order of the items. */
  positions: { x: number; y: number }[];
}

/**
 * Share of the lens that the glyphs cover together; the rest is room to push
 * them apart. A single glyph reaches sqrt(FILL), about three quarters, to the edge.
 */
const FILL = 0.55;
/** Room kept for a glyph that reaches less, so its neighbours don't cover it. */
const MIN_EXTENT = 0.3;
const GAP = 2;
const TICKS = 80;
const ATTRACTION = 0.1;

interface Node extends SimulationNodeDatum {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  room: number;
}

/**
 * Lay out the items in a lens of the given radius: as large as they fit, in
 * their arrangement on the canvas (centred and scaled up), pushed apart just
 * enough not to overlap. The radius depends on how far the glyphs actually
 * reach, so a few glyphs fill the lens and many still fit. Deterministic, so
 * the same items give the same picture.
 */
export function layoutLens(items: readonly LensItem[], lensRadius: number): LensLayout {
  if (items.length === 0) return { radius: 0, positions: [] };

  const extents = items.map(item => Math.min(1, Math.max(MIN_EXTENT, item.extent)));
  const sumOfSquares = extents.reduce((sum, extent) => sum + extent * extent, 0);
  const radius = lensRadius * Math.sqrt(FILL / sumOfSquares);

  const centreX = mean(items.map(item => item.x));
  const centreY = mean(items.map(item => item.y));
  const spread = Math.max(...items.map(item => Math.hypot(item.x - centreX, item.y - centreY)));
  const meanExtent = mean(extents) * radius;
  const scale = spread > 0 ? Math.max(0, lensRadius - meanExtent) / spread : 0;

  const nodes: Node[] = items.map((item, i) => {
    const room = Math.max(0, lensRadius - extents[i] * radius);
    const target = clampToCircle((item.x - centreX) * scale, (item.y - centreY) * scale, room);
    return { ...target, targetX: target.x, targetY: target.y, room };
  });

  if (nodes.length > 1) {
    const simulation = forceSimulation(nodes)
      .force('x', forceX<Node>(node => node.targetX).strength(ATTRACTION))
      .force('y', forceY<Node>(node => node.targetY).strength(ATTRACTION))
      .force(
        'collide',
        forceCollide<Node>((_, i) => extents[i] * radius + GAP / 2)
          .strength(1)
          .iterations(2)
      )
      .velocityDecay(0.3)
      .stop();
    for (let tick = 0; tick < TICKS; tick++) {
      simulation.tick();
      for (const node of nodes) Object.assign(node, clampToCircle(node.x, node.y, node.room));
    }
  }

  return { radius, positions: nodes.map(node => ({ x: node.x, y: node.y })) };
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampToCircle(x: number, y: number, radius: number): { x: number; y: number } {
  const distance = Math.hypot(x, y);
  if (distance <= radius) return { x, y };
  const factor = distance > 0 ? radius / distance : 0;
  return { x: x * factor, y: y * factor };
}
