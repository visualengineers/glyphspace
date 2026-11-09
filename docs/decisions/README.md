# Decision log

_For contributors who want to know why GlyphSpace is built the way it is, or who are about to make a decision others will have to live with._

Each architecture decision record (ADR) captures one decision: the situation, what was decided, what else was considered, and what it costs. The table below is the decision log: every ADR, newest last.

| No. | Decision | Status | Date |
|---|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted | 2026-11-09 |
| [0002](0002-preprocess-in-the-browser-with-pyodide.md) | Preprocess uploaded data in the browser with Pyodide | Accepted (retroactive) | 2025-07 |
| [0003](0003-druidjs-projections-in-web-workers.md) | Compute projections with DruidJS, FastMap first, the rest in web workers | Accepted (retroactive) | 2025-12 / 2026-01 |
| [0004](0004-no-python-code-built-from-data.md) | Never build Python source from request data | Accepted (retroactive) | 2026-09 |
| [0005](0005-wizard-steps-referenced-by-id.md) | Refer to wizard steps by id, not by number | Accepted (retroactive) | 2026-09 |
| [0006](0006-feature-and-metadata-column-roles.md) | Give each column a role: feature or metadata | Accepted (retroactive) | 2026-11 |
| [0007](0007-high-cardinality-columns-default-to-metadata.md) | Near-unique text columns start as metadata | Accepted (retroactive) | 2026-07 / 2026-11 |
| [0008](0008-wizard-state-in-localstorage-datasets-in-indexeddb.md) | Keep wizard state in localStorage and processed datasets in IndexedDB | Accepted (retroactive) | 2025-12 / 2026-06 |
| [0009](0009-unit-tests-in-real-chromium-with-vitest.md) | Run unit tests with Vitest in a real Chromium | Accepted (retroactive) | 2026-09 |

"Retroactive" means the ADR was written after the fact, from the code, commit messages and the [wizard redesign spec](../specs/wizard-redesign.md). Where the reasons were not written down at the time, the ADR says so instead of guessing.

## Writing an ADR

1. Copy [template.md](template.md) to `NNNN-short-title.md` with the next free number.
2. Fill it in while the decision is being made. A short ADR of ten lines is better than none; small decisions belong here too.
3. Add a row to the table above in the same pull request.
4. Once accepted, don't rewrite it. A dated note at the end is fine for facts learned later. If the decision changes, write a new ADR, set the old one's status to `Superseded by NNNN`, and link both ways.

Statuses: `Proposed`, `Accepted`, `Deprecated` (no longer applies, nothing replaces it), `Superseded by NNNN`.

An ADR says why. The [specs](../specs/README.md) say what the result must look like, and the [development docs](../development/) say how the code does it.
