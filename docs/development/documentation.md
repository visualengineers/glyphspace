# Documentation

_For contributors who change behaviour that is documented, or who add documentation._

## What goes where

| You are … | Write or update | Location |
|---|---|---|
| changing what users see or do | the user guide page; a changelog entry | `docs/user-guide/`, `CHANGELOG.md` |
| changing a file format, a stored state, a worker message or the processing config | the spec | `docs/specs/` |
| making a decision others will have to live with (a library, a storage, a structure, a rule) | an ADR, plus a row in the decision log | `docs/decisions/` |
| changing how the code works internally | the development page | `docs/development/` |
| adding a new kind of extension point | a how-to | `docs/development/extending.md` |

Update the docs in the same pull request as the code. A reviewer should be able to check one against the other.

## The kinds of document

- **User guide**: tasks and screens, in the words of the UI. No internals.
- **Specs**: what a contract must look like; living, with a status line ([index](../specs/README.md)).
- **ADRs**: why a decision was taken; not rewritten once accepted, superseded by a new one ([decision log](../decisions/README.md), [ADR 0001](../decisions/0001-record-architecture-decisions.md)).
- **Development docs**: how the code is organised and why it is shaped that way: invariants, pitfalls, where to start.
- **Changelog**: what changed for users, newest first ([format](#changelog)).

Don't repeat content across kinds; link to it. The development docs explain the code and link to the spec for the exact format and to the ADR for the reasons.

## Style

- English, plain GitHub Markdown. Diagrams in Mermaid, which GitHub renders.
- Start with an H1 title and one italic line saying who the page is for.
- Development pages say once, under the title, that paths are relative to `src/app/` unless they start with `src/`, `tools/` or `docs/`.
- Name code by its path in backticks (`services/filter.service.ts`) and by its symbol (`FilterService.refreshFilters`), not by line number: line numbers go stale with the next change.
- Link between docs pages with relative links (`../specs/dataset-format.md`).
- Use the UI's exact labels in **bold** in the user guide.
- Write what the code does. If you are not sure, check the code or leave it out; never document intent as fact.
- Prefer a table to a long list when items share the same attributes.

## Changelog

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

- Add an entry under **Unreleased** in the pull request that makes the change, in one of the groups Added, Changed, Deprecated, Removed, Fixed, Security.
- Write for users: what they notice, not which file changed. Link the pull request.
- When a release is made, rename **Unreleased** to the version (or the date, while there are no versions) and start a new **Unreleased**.
