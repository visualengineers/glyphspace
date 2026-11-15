import * as THREE from 'three';
import { quadtree, QuadtreeLeaf } from 'd3';
import { GlyphObject } from '../../glyph/glyph-object';
import { GlyphCacheObject } from '../../glyph/glyph-cache-object';

/**
 * The item a mesh shows: through the `WeakRef` in its `userData`, or its
 * parent's (the magic lens wraps meshes in groups). Null for anything else.
 */
export function getGlyphFromObject(object: THREE.Object3D): GlyphObject | null {
  if (object == null) {
    throw new RangeError('Cannot get glyph from object');
  }
  const ref = (object.userData['item'] ?? object.parent?.userData['item']) as WeakRef<GlyphObject> | undefined;
  return ref?.deref() ?? null;
}

/**
 * Group the items that lie within `radius` of each other (canvas units, at
 * their target positions). The item closest to a group's mean becomes its
 * representative; the other members are left out while aggregation is on.
 * Every call starts afresh, so it can run again whenever positions change.
 */
export function clusterGlyphs(glyphs: GlyphCacheObject[], radius: number): void {
  for (const glyph of glyphs) {
    glyph.isClustered = false;
    glyph.isClusterRepresentative = false;
  }

  const qt = quadtree<GlyphCacheObject>()
    .x(d => d.position.x)
    .y(d => d.position.y)
    .addAll(glyphs);

  const visited = new Set<GlyphCacheObject>();

  for (const glyph of glyphs) {
    if (visited.has(glyph)) continue;

    // Items within the radius that no earlier cluster has taken
    const neighbors: GlyphCacheObject[] = [];
    qt.visit((node, x0, y0, x1, y1) => {
      if (!node.length) {
        // A leaf chains the items at the same position.
        for (
          let leaf: QuadtreeLeaf<GlyphCacheObject> | undefined = node as QuadtreeLeaf<GlyphCacheObject>;
          leaf;
          leaf = leaf.next
        ) {
          const d = leaf.data;
          if (visited.has(d)) continue;
          const dist = Math.hypot(d.position.x - glyph.position.x, d.position.y - glyph.position.y);
          if (dist <= radius) neighbors.push(d);
        }
      }

      const dx = Math.max(0, Math.max(x0 - glyph.position.x, glyph.position.x - x1));
      const dy = Math.max(0, Math.max(y0 - glyph.position.y, glyph.position.y - y1));
      return dx * dx + dy * dy > radius * radius;
    });

    if (neighbors.length <= 1) continue;

    neighbors.forEach(g => {
      g.isClustered = true;
      visited.add(g);
    });

    // The representative is the member closest to the cluster's mean.
    const centerX = neighbors.reduce((sum, g) => sum + g.position.x, 0) / neighbors.length;
    const centerY = neighbors.reduce((sum, g) => sum + g.position.y, 0) / neighbors.length;
    let representative = neighbors[0];
    let minDist = Infinity;
    for (const g of neighbors) {
      const dist = Math.hypot(g.position.x - centerX, g.position.y - centerY);
      if (dist < minDist) {
        minDist = dist;
        representative = g;
      }
    }
    representative.isClusterRepresentative = true;
  }
}
