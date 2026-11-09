import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { GlyphObject } from '../glyph/glyph-object';
import { GlyphMeta } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { defaultColorScaleId } from '../shared/interfaces/color-scale';

@Injectable({ providedIn: 'root' })
export class SchemaConfigSyncService {
  constructor(private config: ConfigService) {}

  /** Apply a dataset's schema, and the category counts from its meta, to the configuration. */
  applySchemaToConfig(schema: GlyphSchema, meta?: GlyphMeta): void {
    this.config.colorFeature = schema.color;
    this.config.featureCategoryCounts = categoryCounts(meta);
    this.config.replaceActiveFeatures(schema.glyph);
    this.config.featureLabels = schema.label;
    this.config.metadataLabels = schema.metadata ?? {};

    if (schema.colorScaleId !== undefined) {
      this.config.colorRange = schema.colorScaleId;
    } else if (schema.colorRange !== undefined) {
      this.config.colorRange = defaultColorScaleId(schema.colorRange ? 'numeric' : 'categorical');
    }

    if (schema.types) {
      this.config.featureTypes = schema.types;
    }
  }

  calculateFeatureMaxValues(glyphMap: Map<string, GlyphObject>): void {
    const featureTypes = this.config.featureTypes;
    const maxValues: Record<string, number> = {};

    glyphMap.forEach((glyph: GlyphObject) => {
      const features = glyph.features['1'];
      if (features) {
        Object.keys(featureTypes).forEach(featureId => {
          if (featureTypes[featureId] === 'categorical') {
            const value = features[featureId];
            if (value !== undefined) {
              maxValues[featureId] = Math.max(maxValues[featureId] || 0, value);
            }
          }
        });
      }
    });

    this.config.featureMaxValues = maxValues;
  }

  extractFeatureMaxValuesFromMeta(meta: GlyphMeta): void {
    if (!meta || !meta.features) return;

    const maxValues: Record<string, number> = {};

    Object.entries(meta.features).forEach(([featureId, stats]) => {
      if (stats.max !== undefined) {
        maxValues[featureId] = stats.max;
      }
    });

    this.config.featureMaxValues = maxValues;
  }
}

/** Number of categories of each feature that has categories (label-encoded or boolean). */
function categoryCounts(meta: GlyphMeta | undefined): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.entries(meta?.features ?? {}).forEach(([featureId, stats]) => {
    if (stats.categories?.length) counts[featureId] = stats.categories.length;
  });
  return counts;
}
