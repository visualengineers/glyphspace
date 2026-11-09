# 0006. Give each column a role: feature or metadata

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2026-11-09 (commit dca9d84, closes #71) · **Related:** [Dataset format](../specs/dataset-format.md), [Processing config](../specs/processing-config.md), [Wizard storage](../specs/wizard-storage.md), [ADR 0007](0007-high-cardinality-columns-default-to-metadata.md)

## Context

Every selected column was a feature: cleaned, encoded and scaled. Leaving a text column out of the projection in Step 4 didn't stop it from being one-hot encoded, so a column such as `flavor` in a cheese dataset still stopped the processing with error K7, too many distinct values to one-hot encode (review comment on #88). Yet such columns are useful: a name, a title or a description identifies an item in the tooltip and is what people search for.

## Decision

Each selected column has a role (`ColumnRole` in `src/app/preprocessing-wizard/models/data-type.enum.ts`), set in Step 2 ("Use as"):

- **Feature:** cleaned, encoded and scaled; can feed the projection, the glyphs, the colour and the dashboard's filters.
- **Metadata:** kept as its original values; shown in the tooltip, found by the text search and exported, never cleaned, encoded or projected.

Steps 3–5 list feature columns only. Making a column metadata removes it from the glyph and colour mapping in one undo step.

The dataset format gets two optional fields: `schema.metadata` (metadata id → column name) and a `metadata` map per item.

## Alternatives considered

Deselecting such columns was the earlier default for near-unique columns ([ADR 0007](0007-high-cardinality-columns-default-to-metadata.md)); it avoided the failure but lost the information. Others are not recorded.

## Consequences

- Code that asks whether a column takes part in the processing uses `isFeatureColumn` / `isMetadataColumn` (`src/app/preprocessing-wizard/models/column-config.ts`), not `enabled` alone.
- The saved wizard state moved to version 3; columns saved before that are restored as features.
- Datasets without metadata (bundled datasets, older saves) still load, because both new fields are optional.
- The dashboard shows metadata in its own tooltip group (`src/app/canvas/tooltip/`), searches it (`src/app/shared/filter/text-filter.ts`) and exports it (`src/app/services/data-export.service.ts`).
- The CLI has no metadata columns; it encodes every column.
