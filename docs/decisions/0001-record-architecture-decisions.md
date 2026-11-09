# 0001. Record architecture decisions

**Status:** Accepted · **Date:** 2026-11-09 · **Related:** [Decision log](README.md), [Documentation](../development/documentation.md)

## Context

Most of GlyphSpace's design choices are visible only in the code. Commit messages rarely say why (the switch to DruidJS is recorded as "change to druid js"), and the reasoning for the wizard redesign sat in a German ticket list in the repository root. New contributors, and contributors coming back after a while, had to reconstruct intent from the code.

## Decision

We record architecture decisions as ADRs in `docs/decisions/`, one Markdown file per decision, numbered in order, in the format of [template.md](template.md). The table in [README.md](README.md) is the decision log; there is no second list.

We keep three kinds of record apart:

- **ADRs** (`docs/decisions/`) say why. They are not rewritten once accepted; a new ADR supersedes an old one.
- **Specs** (`docs/specs/`) say what a format, protocol or feature must look like. They change with the code.
- **The changelog** (`CHANGELOG.md`) says what changed for users, and when.

Decisions made before this ADR are recorded retroactively (0002–0009), from evidence in the repository only, and marked as such.

## Alternatives considered

- **A decision log as one running document.** Easy to start, but entries get edited in place and the history of a decision is lost. An index over ADRs gives the same overview.
- **Decisions in pull request descriptions only.** They are hard to find later and not versioned with the code.

## Consequences

- A decision that others will have to live with comes with an ADR in the same pull request.
- The retroactive ADRs are only as good as the evidence. Where it is missing, they say so; if you know the original reasons, add them in a new ADR or a dated note.
