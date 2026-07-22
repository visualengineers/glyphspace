import {
  classifyProcessingError,
  classifyBackgroundFailure,
  detectPreflightIssues,
  WizardIssue,
} from './wizard-error-classes';
import { PreprocessingState } from '../../models/preprocessing-state';
import { ColumnConfig } from '../../models/column-config';
import { ColumnStatistics, DataProfile } from '../../models/column-statistics';
import {
  DataType,
  EncodingMethod,
  ScalingMethod,
  MissingValueStrategy,
  OutlierStrategy,
  OutlierMethod,
} from '../../models/data-type.enum';

/**
 * A3 — unit tests for the error-classification and pre-flight-detection logic.
 * Covers the user-relevant failure classes (K1–K7), the generic fallback,
 * background (partial) failures and state-derived pre-flight warnings.
 */

// A structured issue must always be actionable: cause and fix are present and
// never leak the raw text into the user-facing title.
function expectActionable(issue: WizardIssue, raw?: string): void {
  expect(issue.title.trim().length).toBeGreaterThan(0);
  expect(issue.why.trim().length).toBeGreaterThan(0);
  expect(issue.fix.trim().length).toBeGreaterThan(0);
  if (raw) {
    expect(issue.title).not.toContain(raw);
  }
}

describe('classifyProcessingError', () => {
  // One representative raw message per class → expected code, step and anchor.
  const cases: { name: string; raw: string; code: string; step: number; anchorId: string }[] = [
    {
      name: 'K1 — non-numeric value in a projection column',
      raw: 'ValueError: could not convert string to float: "abc"',
      code: 'K1',
      step: 2,
      anchorId: 'wizard-anchor-columns',
    },
    {
      name: 'K2 — no rows left after cleaning',
      raw: 'No data rows remaining after cleaning (0 rows)',
      code: 'K2',
      step: 2,
      anchorId: 'wizard-anchor-columns',
    },
    {
      name: 'K3 — column with no variance',
      raw: 'Column has zero variance / constant value',
      code: 'K3',
      step: 1,
      anchorId: 'wizard-anchor-columns',
    },
    {
      name: 'K4 — neighbour parameter out of range',
      raw: 'n_neighbors=50 must be greater than 1 and less than n_samples=10',
      code: 'K4',
      step: 3,
      anchorId: 'wizard-anchor-methods',
    },
    {
      name: 'K5 — glyph feature count out of range',
      raw: 'A glyph needs 3-12 glyph features',
      code: 'K5',
      step: 3,
      anchorId: 'wizard-anchor-glyph',
    },
    {
      name: 'K6 — time / resource limit',
      raw: 'Worker aborted: computation timed out',
      code: 'K6',
      step: 3,
      anchorId: 'wizard-anchor-methods',
    },
    {
      name: 'K7 — column with too many distinct values (one-hot explosion)',
      raw: "These columns have too many distinct values to one-hot encode: 'title' (9000 distinct values).",
      code: 'K7',
      step: 1,
      anchorId: 'wizard-anchor-columns',
    },
  ];

  cases.forEach(c => {
    it(`classifies ${c.name}`, () => {
      const issue = classifyProcessingError(c.raw);
      expect(issue.code).toBe(c.code);
      expect(issue.severity).toBe('blocking');
      expect(issue.step).toBe(c.step);
      expect(issue.anchorId).toBe(c.anchorId);
      expect(issue.raw).toBe(c.raw);
      expectActionable(issue, c.raw);
    });
  });

  it('is case-insensitive on the raw message', () => {
    expect(classifyProcessingError('COULD NOT CONVERT STRING to float').code).toBe('K1');
    expect(classifyProcessingError('Out Of Memory').code).toBe('K6');
  });

  it('K7 names the offending column and wins over the generic memory class', () => {
    const raw =
      'Failed to process data: These columns have too many distinct values to one-hot encode: ' +
      "'title' (9000 distinct values). Each would expand into that many feature columns, which " +
      'exceeds the in-browser memory. Deselect them in the column step, or switch their encoding to label.';
    const issue = classifyProcessingError(raw);
    // Even though the raw mentions "memory" (would match K6), the more specific
    // K7 is checked first and wins.
    expect(issue.code).toBe('K7');
    expect(issue.step).toBe(1);
    expect(issue.anchorId).toBe('wizard-anchor-columns');
    expect(issue.title).toContain('title');
    expect(issue.why).toContain('title');
    expect(issue.why).toContain('9000');
    expectActionable(issue, raw);
  });

  it('K7 lists every offending column when several are near-unique', () => {
    const raw =
      'These columns have too many distinct values to one-hot encode: ' +
      "'show_id' (9000 distinct values), 'title' (9000 distinct values), 'cast' (8281 distinct values).";
    const issue = classifyProcessingError(raw);
    expect(issue.code).toBe('K7');
    expect(issue.title).toContain('3 columns');
    expect(issue.why).toContain('show_id');
    expect(issue.why).toContain('title');
    expect(issue.why).toContain('cast');
    expectActionable(issue, raw);
  });

  it('falls back to a generic, still-actionable blocking issue for unmatched errors', () => {
    const raw = 'Segfault 0xDEADBEEF in libfoo.so at frame #7';
    const issue = classifyProcessingError(raw);
    expect(issue.code).toBe('');
    expect(issue.severity).toBe('blocking');
    // The user-facing title must not be the raw technical text.
    expect(issue.title).not.toContain('Segfault');
    expect(issue.title).not.toContain('0xDEADBEEF');
    // But the raw text is preserved for the collapsible technical section.
    expect(issue.raw).toBe(raw);
    expectActionable(issue, raw);
  });

  it('handles empty / nullish input without throwing', () => {
    const issue = classifyProcessingError('');
    expect(issue.code).toBe('');
    expectActionable(issue);
    expect(classifyProcessingError(undefined as unknown as string).code).toBe('');
  });
});

describe('classifyBackgroundFailure', () => {
  it('produces a dismissable warning that names the method and keeps raw detail', () => {
    const issue = classifyBackgroundFailure('umap', 'n_neighbors too large for n_samples');
    expect(issue.severity).toBe('warning');
    expect(issue.dismissable).toBe(true);
    expect(issue.title).toContain('UMAP');
    expect(issue.raw).toBe('n_neighbors too large for n_samples');
    // Cause/fix are inherited from the underlying classification (K4 here).
    expect(issue.code).toBe('K4');
    expectActionable(issue);
  });

  it('supplies a synthetic raw detail when none is given', () => {
    const issue = classifyBackgroundFailure('tsne');
    expect(issue.raw).toContain('tsne');
    expect(issue.severity).toBe('warning');
    expect(issue.dismissable).toBe(true);
  });
});

// ---- Fixtures for detectPreflightIssues ----------------------------------

function makeColumnStats(overrides: Partial<ColumnStatistics>): ColumnStatistics {
  return {
    name: 'col',
    dataType: DataType.Numeric,
    count: 100,
    missingCount: 0,
    missingPercentage: 0,
    uniqueCount: 50,
    ...overrides,
  };
}

function makeColumnConfig(overrides: Partial<ColumnConfig>): ColumnConfig {
  return {
    name: 'col',
    originalType: DataType.Numeric,
    targetType: DataType.Numeric,
    encodingMethod: EncodingMethod.None,
    scalingMethod: ScalingMethod.None,
    includeInProjection: true,
    isColorFeature: false,
    missingValueStrategy: MissingValueStrategy.Keep,
    outlierMethod: OutlierMethod.IQR_1_5,
    outlierStrategy: OutlierStrategy.Keep,
    enabled: true,
    hasIssues: false,
    ...overrides,
  } as ColumnConfig;
}

function makeState(opts: {
  totalRows: number;
  columns: ColumnStatistics[];
  configs: ColumnConfig[];
  projection?: Partial<PreprocessingState['projectionConfig']>;
}): PreprocessingState {
  const profile: DataProfile = {
    totalRows: opts.totalRows,
    totalColumns: opts.columns.length,
    fileSize: 1000,
    fileName: 'test.csv',
    columns: opts.columns,
    qualityScore: 1,
    duplicateCount: 0,
    previewRows: [],
  };
  const columnConfigs = new Map<string, ColumnConfig>();
  opts.configs.forEach(c => columnConfigs.set(c.name, c));
  const baseProjection = {
    enablePCA: false,
    enableIsoMap: false,
    enableMDS: false,
    enableLLE: false,
    enableLTSA: false,
    enableTSNE: false,
    enableUMAP: false,
    enableTriMap: false,
    enableTopoMap: false,
    enableSammon: false,
    isomapNeighbors: 0,
    lleNeighbors: 0,
    ltsaNeighbors: 0,
    tsnePerplexity: 30,
    tsneIterations: 1000,
    umapNeighbors: 15,
    umapMinDist: 0.1,
    trimapWeightAdj: 500,
  };
  return {
    dataProfile: profile,
    columnConfigs,
    projectionConfig: { ...baseProjection, ...(opts.projection ?? {}) },
  } as unknown as PreprocessingState;
}

describe('detectPreflightIssues', () => {
  it('returns nothing when there is no data profile', () => {
    const state = { dataProfile: null } as unknown as PreprocessingState;
    expect(detectPreflightIssues(state)).toEqual([]);
  });

  it('flags a constant projection column as a K3 warning (step 2)', () => {
    const state = makeState({
      totalRows: 100,
      columns: [makeColumnStats({ name: 'const', uniqueCount: 1 })],
      configs: [makeColumnConfig({ name: 'const' })],
    });
    const issues = detectPreflightIssues(state);
    const k3 = issues.find(i => i.code === 'K3');
    expect(k3).toBeTruthy();
    expect(k3!.severity).toBe('warning');
    expect(k3!.step).toBe(1);
    expect(k3!.title).toContain('const');
    expectActionable(k3!);
  });

  it('flags a mostly-empty projection column as a K3 warning', () => {
    const state = makeState({
      totalRows: 100,
      columns: [makeColumnStats({ name: 'sparse', missingPercentage: 80 })],
      configs: [makeColumnConfig({ name: 'sparse' })],
    });
    expect(detectPreflightIssues(state).some(i => i.code === 'K3')).toBe(true);
  });

  it('ignores bad columns that are not selected for the projection', () => {
    const state = makeState({
      totalRows: 100,
      columns: [makeColumnStats({ name: 'const', uniqueCount: 1 })],
      configs: [makeColumnConfig({ name: 'const', includeInProjection: false })],
    });
    expect(detectPreflightIssues(state).some(i => i.code === 'K3')).toBe(false);
  });

  it('flags a neighbour count >= row count as a K4 warning (step 4)', () => {
    const state = makeState({
      totalRows: 10,
      columns: [makeColumnStats({ name: 'a' })],
      configs: [makeColumnConfig({ name: 'a' })],
      projection: { enableUMAP: true, umapNeighbors: 15 },
    });
    const k4 = detectPreflightIssues(state).find(i => i.code === 'K4');
    expect(k4).toBeTruthy();
    expect(k4!.severity).toBe('warning');
    expect(k4!.step).toBe(3);
    expect(k4!.why).toContain('UMAP');
    expectActionable(k4!);
  });

  it('does not flag K4 when the neighbour count stays below the row count', () => {
    const state = makeState({
      totalRows: 100,
      columns: [makeColumnStats({ name: 'a' })],
      configs: [makeColumnConfig({ name: 'a' })],
      projection: { enableUMAP: true, umapNeighbors: 15 },
    });
    expect(detectPreflightIssues(state).some(i => i.code === 'K4')).toBe(false);
  });

  it('flags a slow method on a large dataset as a K6 warning', () => {
    const state = makeState({
      totalRows: 20000,
      columns: [makeColumnStats({ name: 'a' })],
      configs: [makeColumnConfig({ name: 'a' })],
      projection: { enableTSNE: true },
    });
    const k6 = detectPreflightIssues(state).find(i => i.code === 'K6');
    expect(k6).toBeTruthy();
    expect(k6!.severity).toBe('warning');
    expectActionable(k6!);
  });

  it('does not flag K6 for a large dataset with only fast methods', () => {
    const state = makeState({
      totalRows: 20000,
      columns: [makeColumnStats({ name: 'a' })],
      configs: [makeColumnConfig({ name: 'a' })],
      projection: { enablePCA: true },
    });
    expect(detectPreflightIssues(state).some(i => i.code === 'K6')).toBe(false);
  });
});
