# 0005. Refer to wizard steps by id, not by number

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2026-09-24 (commit a4a87c3) · **Related:** [Wizard](../development/wizard.md#steps), [Wizard storage](../specs/wizard-storage.md)

## Context

The wizard had five steps; the fourth, "Visualization", held projection, glyph and colour settings together. Commit a4a87c3 split it into Projection and Glyphs & Color, which moved the review step from position 5 to 6. Code all over the wizard knew steps by number: navigation, deep links from the history and from error cards ("Fix in step N"), the target step of each error class, the step summaries, and the step index saved in localStorage. Every such number had to be found and changed, and any that was missed pointed at the wrong step.

## Decision

Steps are named by a `WizardStepId` (`upload`, `columns`, `features`, `projection`, `appearance`, `review`). The ordered list `WIZARD_STEPS` in `src/app/preprocessing-wizard/shared/constants/step-info.ts` is the only place that knows their order. Code refers to steps by id; `stepIndex`, `stepIdAt`, `stepNumber` and `stepLabel` convert to an index or to the "Step N" shown to the user.

The state keeps the numeric index (`currentStep`), and saved states are migrated through the step id ([Wizard storage](../specs/wizard-storage.md#restoring-and-migrating)).

## Alternatives considered

None are recorded.

## Consequences

- Reordering, inserting or removing a step changes `WIZARD_STEPS`, plus a storage migration if the saved index changes meaning.
- User-facing texts that name a step build the number with `stepNumber` or `stepLabel` instead of writing "Step 4".
- `step-info.spec.ts` checks the list; specs elsewhere should also use ids.
