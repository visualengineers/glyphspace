/**
 * Wizard error classes (A3).
 *
 * The six user-relevant failure classes are derivable from the code, but today
 * the raw message that reaches the UI rarely makes the class obvious (see the
 * analysis docs "fehlerklassen-ableitbarkeit" / "fehlerbehandlung-wizard-analyse").
 * This module turns raw error strings — and pre-flight state signals — into
 * structured issues that name the likely cause (WHY), the concrete action
 * (FIX) and the exact wizard step that resolves it.
 *
 * The `step` index is 0-based (0=Upload … 4=Review); the displayed "Schritt N"
 * is `step + 1`. `anchorId` reuses the A6 deep-link anchors so the "Fix in
 * Schritt N" button jumps straight to the responsible control.
 */

import { PreprocessingState } from '../../models/preprocessing-state';
import { ProjectionConfig } from '../../models/column-config';

export type IssueSeverity = 'blocking' | 'warning';

export interface WizardIssue {
  /** Error-class code, e.g. "K1". Empty for unclassified/generic issues. */
  code: string;
  severity: IssueSeverity;
  /** Everyday-language title (what went wrong). */
  title: string;
  /** WHY — the likely cause in plain language. */
  why: string;
  /** FIX — the concrete action, naming the step. */
  fix: string;
  /** 0-based target step index (goToStep / goToStepWithScroll). */
  step: number;
  /** A6 deep-link anchor id inside the target step (optional). */
  anchorId?: string;
  /** Raw technical detail, shown collapsed under "Technical details". */
  raw?: string;
  /** Whether the user may dismiss this issue (partial/optional failures). */
  dismissable?: boolean;
}

/** English step titles, aligned with STEP_INFO, for the "Fix in Schritt N · <name>" button. */
export const STEP_NAMES: Record<number, string> = {
  0: 'Upload Data',
  1: 'Select Columns',
  2: 'Configure Data & Features',
  3: 'Visualization Settings',
  4: 'Review & Process',
};

/** Static class templates. Cause/fix/step are fixed per class; `raw`/`title` may be enriched. */
const CLASS_TEMPLATES: Record<string, Omit<WizardIssue, 'raw'>> = {
  K1: {
    code: 'K1',
    severity: 'blocking',
    title: 'A projection column still contains text values',
    why: 'Text or categorical values without a matching encoding ended up in the feature matrix, so the numeric projection cannot use them.',
    fix: 'Set an encoding for that column, or remove it from the projection, in Step 3 (Configure Data & Features).',
    step: 2,
    anchorId: 'wizard-anchor-columns',
  },
  K2: {
    code: 'K2',
    severity: 'blocking',
    title: 'No rows were left after cleaning',
    why: 'The missing-value, outlier or duplicate rules were strict enough to remove every row.',
    fix: 'Loosen the cleaning rules in Step 3 (Configure Data & Features) so some rows survive.',
    step: 2,
    anchorId: 'wizard-anchor-columns',
  },
  K3: {
    code: 'K3',
    severity: 'blocking',
    title: 'A column has no usable values',
    why: 'A selected column is constant or almost entirely empty, so scaling and projection have nothing to work with.',
    fix: 'Deselect the affected column in Step 2 (Select Columns).',
    step: 1,
    anchorId: 'wizard-anchor-columns',
  },
  K4: {
    code: 'K4',
    severity: 'blocking',
    title: 'A projection parameter is out of range',
    why: 'The neighbour count is larger than the number of samples (IsoMap, LLE, LTSA or UMAP), which the method cannot compute.',
    fix: 'Lower the parameter or disable the method in Step 4 (Visualization Settings).',
    step: 3,
    anchorId: 'wizard-anchor-methods',
  },
  K5: {
    code: 'K5',
    severity: 'blocking',
    title: 'The number of glyph features is out of range',
    why: 'A glyph needs between 3 and 12 features; the current selection is outside that range.',
    fix: 'Adjust the selection to 3–12 features in Step 4 (Visualization Settings).',
    step: 3,
    anchorId: 'wizard-anchor-glyph',
  },
  K6: {
    code: 'K6',
    severity: 'blocking',
    title: 'Processing hit a time or resource limit',
    why: 'The dataset is large enough to exceed the worker time limit or available memory.',
    fix: 'Reduce the dataset in Step 2, or reduce the number of methods in Step 4.',
    step: 3,
    anchorId: 'wizard-anchor-methods',
  },
};

function template(code: string): WizardIssue {
  return { ...CLASS_TEMPLATES[code] };
}

/**
 * Classify a raw processing error message into one of the six classes.
 * Falls back to a generic (still persistent, still actionable) blocking issue
 * when no pattern matches, so the user never sees a bare "Processing failed".
 */
export function classifyProcessingError(raw: string): WizardIssue {
  const msg = (raw || '').toLowerCase();
  let issue: WizardIssue;

  if (/timed out|timeout|out of memory|memory|aborted/.test(msg)) {
    issue = template('K6');
  } else if (/invalid numeric value|could not convert|non-?numeric|not a number|isnan|convert string/.test(msg)) {
    issue = template('K1');
  } else if (/empty|no valid feature data|no data rows|0 rows|no rows|nothing left/.test(msg)) {
    issue = template('K2');
  } else if (/neighbor|n_neighbors|perplexity|k must|greater than|exceeds|out of range|sample/.test(msg)) {
    issue = template('K4');
  } else if (/glyph feature|3-12|3 to 12/.test(msg)) {
    issue = template('K5');
  } else if (/constant|zero variance|no variance|all missing|singular|division by zero/.test(msg)) {
    issue = template('K3');
  } else {
    issue = {
      code: '',
      severity: 'blocking',
      title: "We couldn't finish processing your data",
      why: 'Something in the current combination of columns, cleaning rules and methods stopped the projection from finishing. This is almost always a settings issue, not a problem with your data — and your upload and settings are still here.',
      fix: 'Start processing again. If it keeps failing, deselect any text-heavy or mostly-empty columns in Step 2, then turn off the more advanced methods (t-SNE, UMAP, Sammon) in Step 4 and try once more.',
      step: 3,
      anchorId: 'wizard-anchor-methods',
    };
  }

  issue.raw = raw;
  return issue;
}

/**
 * Classify a background (non-primary) projection failure into a dismissable
 * warning. FastMap already succeeded, so the visualization is usable — this is
 * a degraded/partial state, not a hard failure.
 */
export function classifyBackgroundFailure(method: string, raw?: string): WizardIssue {
  const base = classifyProcessingError(raw || '');
  return {
    ...base,
    severity: 'warning',
    dismissable: true,
    title: `${method.toUpperCase()} could not be computed`,
    raw: raw || `${method} failed`,
  };
}

/**
 * Pre-flight detection: read signals already present in the state to warn about
 * likely failures BEFORE processing starts. These use the same signals the
 * profiler already computes (hasIssues = constant/mostly-missing column) plus
 * derivable parameter/size checks. Returned as "possible issue" warnings.
 */
export function detectPreflightIssues(state: PreprocessingState): WizardIssue[] {
  const issues: WizardIssue[] = [];
  const profile = state.dataProfile;
  if (!profile) return issues;

  const rowCount = profile.totalRows ?? 0;

  // K3 — constant / mostly-empty columns that are still selected for the projection.
  const badColumns: string[] = [];
  state.columnConfigs.forEach(config => {
    if (!config.enabled || !config.includeInProjection) return;
    const col = profile.columns.find(c => c.name === config.name);
    if (!col) return;
    if (col.uniqueCount === 1 || col.missingPercentage > 50) {
      badColumns.push(config.name);
    }
  });
  if (badColumns.length > 0) {
    const t = template('K3');
    issues.push({
      ...t,
      severity: 'warning',
      title:
        badColumns.length === 1
          ? `Column "${badColumns[0]}" may have no usable values`
          : `${badColumns.length} projection columns may have no usable values`,
      why: `These columns are constant or mostly empty: ${badColumns.join(', ')}. They add no information and can make the projection fail.`,
      raw: `Flagged by profiling (uniqueCount === 1 || missingPercentage > 50): ${badColumns.join(', ')}`,
    });
  }

  // K4 — neighbour parameters larger than the sample size.
  const pc: ProjectionConfig = state.projectionConfig;
  const neighborChecks: { enabled: boolean; label: string; value: number }[] = [
    { enabled: pc.enableIsoMap, label: 'IsoMap', value: pc.isomapNeighbors },
    { enabled: pc.enableLLE, label: 'LLE', value: pc.lleNeighbors },
    { enabled: pc.enableLTSA, label: 'LTSA', value: pc.ltsaNeighbors },
    { enabled: pc.enableUMAP, label: 'UMAP', value: pc.umapNeighbors },
  ];
  const offending = neighborChecks.filter(c => c.enabled && c.value > 0 && rowCount > 0 && c.value >= rowCount);
  if (offending.length > 0) {
    const t = template('K4');
    issues.push({
      ...t,
      severity: 'warning',
      title: 'A method needs more neighbours than you have rows',
      why: `${offending
        .map(o => `${o.label} (neighbours ${o.value})`)
        .join(', ')} — the neighbour count must stay below the row count (${rowCount}).`,
      raw: `rowCount=${rowCount}; ${offending.map(o => `${o.label}.neighbors=${o.value}`).join(', ')}`,
    });
  }

  // K6 — large dataset combined with a slow method risks the worker time limit.
  const SLOW_LIMIT = 15000;
  const slowEnabled = pc.enableTSNE || pc.enableSammon || pc.enableUMAP;
  if (rowCount > SLOW_LIMIT && slowEnabled) {
    const t = template('K6');
    issues.push({
      ...t,
      severity: 'warning',
      title: 'A slow method on a large dataset may time out',
      why: `The dataset has ${rowCount.toLocaleString()} rows and a slow method (t-SNE, Sammon or UMAP) is enabled, which can exceed the processing time limit.`,
      raw: `rowCount=${rowCount}; slow methods enabled.`,
    });
  }

  return issues;
}
