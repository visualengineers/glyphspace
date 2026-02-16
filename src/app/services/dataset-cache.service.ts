import { Injectable } from '@angular/core';
import { GlyphObject } from '../glyph/glyph-object';
import { GlyphMeta } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { GlyphFeature } from '../shared/interfaces/glyph-feature';
import { GlyphPosition } from '../shared/interfaces/glyph-position';

@Injectable({ providedIn: 'root' })
export class DatasetCacheService {
  private glyphCache = new Map<string, Map<string, GlyphObject>>();
  private metaCache = new Map<string, Map<string, GlyphMeta>>();
  private schemaCache = new Map<string, Map<string, GlyphSchema>>();

  getGlyphMap(name: string): Map<string, GlyphObject> | undefined {
    return this.glyphCache.get(name);
  }

  getSchemaMap(name: string): Map<string, GlyphSchema> | undefined {
    return this.schemaCache.get(name);
  }

  getMetaMap(name: string): Map<string, GlyphMeta> | undefined {
    return this.metaCache.get(name);
  }

  deleteDataset(name: string): void {
    this.glyphCache.delete(name);
    this.schemaCache.delete(name);
    this.metaCache.delete(name);
  }

  buildDataSet(
    name: string,
    timestamp: string,
    schema: GlyphSchema,
    meta: GlyphMeta,
    features: GlyphFeature[],
    positions: Map<string, GlyphPosition[]>
  ): number {
    const schemaMap = this.getOrCreateSubMap(this.schemaCache, name);
    schemaMap.set(timestamp, schema);

    const metaMap = this.getOrCreateSubMap(this.metaCache, name);
    metaMap.set(timestamp, meta);

    const glyphMap = this.getOrCreateSubMap(this.glyphCache, name);

    for (const feature of features) {
      const idStr = String(feature.id);

      let glyph = glyphMap.get(idStr);

      if (!glyph) {
        glyph = new GlyphObject(idStr);
        glyph.features = feature.features;
        glyph.values = feature.values;
        glyph.defaultcontext = feature.defaultcontext ? parseInt(feature.defaultcontext) : 1;
        glyph.positions = {};

        glyphMap.set(idStr, glyph);
      }

      if (!glyph.positions[timestamp]) {
        glyph.positions[timestamp] = {};
      }
    }

    for (const [algorithm, entries] of positions) {
      for (const posEntry of entries) {
        const idStr = String(posEntry.id);
        const glyph = glyphMap.get(idStr);
        if (!glyph) {
          continue;
        }

        glyph.positions[timestamp][algorithm] = {
          ...posEntry.position,
        };
      }
    }

    return glyphMap.size;
  }

  private getOrCreateSubMap<V>(map: Map<string, Map<string, V>>, key: string): Map<string, V> {
    let sub = map.get(key);
    if (!sub) {
      sub = new Map();
      map.set(key, sub);
    }
    return sub;
  }
}
