# Specifications

_For contributors who change a format, a protocol or a feature that other code depends on._

A spec says **what** something must do or look like: a file format, a message protocol, a stored state, or the requirements of a feature. It does not explain why it was chosen (that is an [ADR](../decisions/README.md)) or how the code implements it (that is the [development docs](../development/)).

## Rules

- A spec is a living document. Change it in the same pull request as the code it describes.
- A change that breaks existing data or callers (a removed field, a renamed message, a new required field) also needs an ADR.
- Every spec starts with a status line. Statuses:

| Status | Meaning |
|---|---|
| Draft | Under discussion, not implemented. |
| Accepted | Agreed, implementation pending or in progress. |
| Implemented | The code follows the spec. |
| Superseded | Replaced; the line names the successor. |

New specs start from [template.md](template.md).

## Index

| Spec | Status | Covers |
|---|---|---|
| [Dataset format](dataset-format.md) | Implemented | The JSON files of a dataset, the dataset collection and stored datasets |
| [CSV input](csv-input.md) | Implemented | What an input CSV must and may contain, for the wizard and the CLI |
| [Processing config](processing-config.md) | Implemented | The configuration the wizard sends to the Python pipeline and the order of operations |
| [Worker protocol](worker-protocol.md) | Implemented | Messages between the main thread and the Pyodide and projection workers |
| [Wizard storage](wizard-storage.md) | Implemented | The wizard state saved in localStorage and its migrations |
| [Wizard redesign](wizard-redesign.md) | Implemented | Requirements A1–A15 of the 2026 wizard redesign (German) |
