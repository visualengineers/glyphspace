// src/app/utils/three-helpers.ts
import * as THREE from 'three';
import { quadtree } from 'd3-quadtree';
import { GlyphObject } from '../../glyph/glyph-object';
import { GlyphCacheObject } from '../../glyph/glyph-cache-object';

export function getGlyphFromObject(object: THREE.Object3D): GlyphObject | null {
    let glyph: GlyphObject;
    if (object == null) {
        throw new RangeError('Cannot get glyph from object');
    }
    if (object.userData['item'] === null) {
        glyph = (object.parent?.userData['item'].deref() as GlyphObject);
    } else {
        glyph = (object.userData['item'].deref() as GlyphObject);
    }
    return glyph;
}

export function clusterGlyphs(
    glyphs: GlyphCacheObject[],
    radius: number
): void {
    const qt = quadtree<GlyphCacheObject>()
        .x(d => d.position.x)
        .y(d => d.position.y)
        .addAll(glyphs);

    const visited = new Set<string>();

    for (const glyph of glyphs) {
        if (visited.has(glyph.id)) continue;

        const neighbors: GlyphCacheObject[] = [];

        // Visit nearby nodes in the quadtree within radius
        qt.visit((node, x0, y0, x1, y1) => {
            if (!node.length && node.data) {
                const d = node.data;
                const dist = Math.hypot(
                    d.position.x - glyph.position.x,
                    d.position.y - glyph.position.y
                );
                if (dist <= radius) {
                    neighbors.push(d);
                }
            }

            const dx = Math.max(0, Math.max(x0 - glyph.position.x, glyph.position.x - x1));
            const dy = Math.max(0, Math.max(y0 - glyph.position.y, glyph.position.y - y1));
            return dx * dx + dy * dy > radius * radius;
        });

        if (neighbors.length > 1) {
            // It's a cluster
            neighbors.forEach(g => {
                g.isClustered = true;
                g.isClusterRepresentative = false;
                visited.add(g.id);
            });

            // Find cluster center (mean)
            const centerX = neighbors.reduce((sum, g) => sum + g.position.x, 0) / neighbors.length;
            const centerY = neighbors.reduce((sum, g) => sum + g.position.y, 0) / neighbors.length;

            // Assign representative (closest to center)
            let minDist = Infinity;
            let representative: GlyphCacheObject | null = null;

            for (const g of neighbors) {
                const dist = Math.hypot(g.position.x - centerX, g.position.y - centerY);
                if (dist < minDist) {
                    minDist = dist;
                    representative = g;
                }
            }

            if (representative) {
                representative.isClusterRepresentative = true;
            }
        }
    }
}
