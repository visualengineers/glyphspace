# 0011. Existing components keep eager change detection; new ones use OnPush

**Status:** Accepted · **Date:** 2026-11-09 · **Related:** [Conventions](../development/conventions.md#angular), `eslint.config.js`

## Context

Angular 22 made `ChangeDetectionStrategy.OnPush` the default: a component without a `changeDetection` setting is only checked when an input changes, an event in its template fires, or a signal or `async` pipe it reads updates. GlyphSpace's components were written for the old default, which checks every component after every event. Much of their state lives in root services and is mutated in place or assigned in RxJS subscriptions (`ConfigService`, `FilterService`, the canvas and wizard components), which OnPush does not notice.

`ng update` therefore set `changeDetection: ChangeDetectionStrategy.Eager` on every existing component, keeping their behaviour. angular-eslint 22's recommended rules report exactly that setting as an error (`prefer-on-push-component-change-detection`).

## Decision

The 31 components that `ng update` pinned keep `Eager`. They are listed by file in `EAGER_CHANGE_DETECTION` in `eslint.config.js`, where the rule is off. Everywhere else the rule stays an error, so new components use OnPush. A component leaves the list once it works with OnPush: its state in signals or inputs, or `markForCheck` where a subscription changes it.

## Alternatives considered

- **Switch every component to OnPush with the update:** it changes when each part of the UI refreshes, the unit tests would not catch most mistakes, and it would mix a refactor into a dependency update.
- **Turn the rule off:** new components could opt out of OnPush without anyone noticing.
- **Keep Angular 21:** it gets security fixes only until about May 2027.

## Consequences

- Two strategies coexist until the list is empty. A new component that reads mutable service state has to use signals, the `async` pipe or `markForCheck`, or it will not refresh.
- Moving a listed component to OnPush needs a check in the running app, not only the specs.
- The list in `eslint.config.js` shows how much is left.
