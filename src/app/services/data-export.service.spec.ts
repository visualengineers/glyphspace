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

    expect(csv.split('\n')).toEqual(['"id","fat","flavor"', '"brie","45","buttery, nutty"', '"gouda","30",""']);
  });

  it('exports features only for a dataset without metadata', async () => {
    const csv = await exportedCsv([glyph('brie', { '1': '45' })], { label: { '1': 'fat' } });

    expect(csv.split('\n')).toEqual(['"id","fat"', '"brie","45"']);
  });

  // Regression: the header was joined unquoted, so a label with a comma (a
  // one-hot feature like "group_Lamb, Veal, and Game Products") added columns
  // and shifted every column after it.
  it('quotes the header like the rows', async () => {
    const csv = await exportedCsv([glyph('lamb', { '1': '1', '2': '20' })], {
      label: { '1': 'group_Lamb, Veal, and Game Products', '2': 'Price "EUR"' },
    });

    expect(csv.split('\n')[0]).toBe('"id","group_Lamb, Veal, and Game Products","Price ""EUR"""');
  });

  it('keeps spreadsheets from running values as formulas, but leaves numbers alone', async () => {
    const csv = await exportedCsv(
      [glyph('x', { '1': '=HYPERLINK("http://evil")', '2': '-3.5', '3': '@SUM(A1)', '4': '+1e-5', '5': '-x' })],
      { label: { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': '=e' } }
    );

    expect(csv.split('\n')).toEqual([
      `"id","a","b","c","d","'=e"`,
      `"x","'=HYPERLINK(""http://evil"")","-3.5","'@SUM(A1)","+1e-5","'-x"`,
    ]);
  });
});
