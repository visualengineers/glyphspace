import { Injectable } from '@angular/core';
import { GlyphObject } from '../glyph/glyph-object';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';

@Injectable({
  providedIn: 'root',
})
export class DataExportService {
  exportFilteredGlyphsAsCSV(
    glyphMap: Map<string, GlyphObject>,
    schemaMap: Map<string, GlyphSchema>,
    datasetKey: string
  ): void {
    // --------------------------------------------------
    // 1. Collect feature keys + labels from schema.label
    // --------------------------------------------------
    const featureKeyToLabel = new Map<string, string>();

    schemaMap.forEach((schema: GlyphSchema) => {
      Object.entries(schema.label).forEach(([featureKey, label]) => {
        featureKeyToLabel.set(featureKey, label);
      });
    });

    const orderedFeatureKeys = Array.from(featureKeyToLabel.keys());
    // Safe: keys come from the same map, so get() always returns a value
    const orderedLabels = orderedFeatureKeys.map(key => featureKeyToLabel.get(key) ?? key);

    if (orderedFeatureKeys.length === 0) {
      console.warn('No features found in schema labels');
      return;
    }

    // --------------------------------------------------
    // 2. Collect active glyphs
    // --------------------------------------------------
    const activeGlyphs = Array.from(glyphMap.values()).filter(glyph => !glyph.passive);

    if (activeGlyphs.length === 0) {
      console.warn('No active glyphs to export');
      return;
    }

    // --------------------------------------------------
    // 3. CSV header (labels!)
    // --------------------------------------------------
    const headers = ['id', ...orderedLabels];
    const rows: string[] = [];
    rows.push(headers.join(','));

    // --------------------------------------------------
    // 4. CSV rows
    // --------------------------------------------------
    activeGlyphs.forEach(glyph => {
      const rawValues = glyph.values || {};

      const row = [this.escapeCSV(glyph.id), ...orderedFeatureKeys.map(key => this.escapeCSV(rawValues[key] ?? ''))];

      rows.push(row.join(','));
    });

    // --------------------------------------------------
    // 5. Download
    // --------------------------------------------------
    const csvContent = '\ufeff' + rows.join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    const fileName = `glyphspace-export-${timestamp}-${datasetKey}-${activeGlyphs.length}.csv`;
    this.downloadBlob(blob, fileName);
  }

  private escapeCSV(value: string | number | undefined | null): string {
    const str = String(value ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  }
}
