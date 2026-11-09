# 0007. Near-unique text columns start as metadata

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2026-07-21/22 (guard and default, commits 52bdd25 and f17e59e); 2026-11-09 (metadata instead of deselection, commit dca9d84) · **Related:** [ADR 0006](0006-feature-and-metadata-column-roles.md), [CSV input](../specs/csv-input.md#wizard), [wizard redesign spec](../specs/wizard-redesign.md), requirement A2

## Context

From the [wizard redesign spec](../specs/wizard-redesign.md) (A2, follow-up to A3/K7): `streaming_titles.csv` has five columns with a different value in every row (`show_id`, `title`, `director`, `cast`, `description`). One-hot encoding them would have produced about 43,750 columns and exhausted Pyodide's memory. A3 handled this reactively, with a clear error; A2 was to prevent it by not selecting such columns by default. Near-unique numeric and date values, in contrast, are ordinary measurements.

## Decision

Two parts:

- **Guard** (A3): the pipeline refuses to one-hot encode a column with more than 500 distinct values (`MAX_ONEHOT_UNIQUE` in `src/assets/preprocessing_processor_config.py`) before any encoding starts, and names every such column. The wizard shows this as error class K7.
- **Default** (A2): a text, categorical or ID column with more than 20 non-missing values (`HIGH_CARDINALITY_MIN_ROWS`), of which at least 90 % are distinct (`HIGH_CARDINALITY_RATIO`), starts as metadata (`createDefaultColumnConfig` in `src/app/preprocessing-wizard/services/column-defaults.ts`). Numeric and date columns are exempt.

Until the column roles of [ADR 0006](0006-feature-and-metadata-column-roles.md), the default deselected such columns. Since then they start as metadata, so they stay available in the tooltip and the search.

## Alternatives considered

The spec named 0.95 as a possible ratio; 0.9 was implemented. Others are not recorded.

## Consequences

- Typical datasets with names, titles or descriptions process without changes in Step 2.
- A column with 20 or fewer non-missing values is never affected, however unique its values are.
- The limit of 500 still applies when the user makes such a column a feature with one-hot encoding. Label encoding gives one feature instead of one per value.
