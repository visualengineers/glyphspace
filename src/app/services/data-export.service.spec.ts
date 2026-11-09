import { DataExportService } from './data-export.service';
import { GlyphObject } from '../glyph/glyph-object';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';

/** The byte order mark the export puts in front of the CSV (for Excel). */
const BOM = String.fromCharCode(0xfeff);

function glyph(id: string, values: Record<string, string>, metadata?: Record<string, string>): GlyphObject {
  const item = new GlyphObject(id);
  item.values = values;
  item.metadata = metadata;
  return item;
}

/** Runs the export and returns the CSV it would download, without the BOM. */
async function exportedCsv(glyphs: GlyphObject[], schema: Partial<GlyphSchema>): Promise<string> {
  const service = new DataExportService();
  let blob: Blob | undefined;
  vi.spyOn(service as unknown as { downloadBlob(b: Blob, name: string): void }, 'downloadBlob').mockImplementation(
    (b: Blob) => (blob = b)
  );

  service.exportFilteredGlyphsAsCSV(
    new Map(glyphs.map(g => [g.id, g])),
    new Map([['1', schema as GlyphSchema]]),
    'cheese'
  );

  if (!blob) throw new Error('nothing was exported');
  const text = await blob.text();
  return text.startsWith(BOM) ? text.slice(BOM.length) : text;
}

describe('DataExportService', () => {
  it('exports the metadata columns after the features', async () => {
    const csv = await exportedCsv(
      [glyph('brie', { '1': '45' }, { '1': 'buttery, nutty' }), glyph('gouda', { '1': '30' })],
      { label: { '1': 'fat' }, metadata: { '1': 'flavor' } }
    );

    expect(csv.split('\n')).toEqual(['id,fat,flavor', '"brie","45","buttery, nutty"', '"gouda","30",""']);
  });

  it('exports features only for a dataset without metadata', async () => {
    const csv = await exportedCsv([glyph('brie', { '1': '45' })], { label: { '1': 'fat' } });

    expect(csv.split('\n')).toEqual(['id,fat', '"brie","45"']);
  });
});
