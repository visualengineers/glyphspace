# 0009. Run unit tests with Vitest in a real Chromium

**Status:** Accepted (recorded retroactively on 2026-11-09) · **Date:** 2026-09-24 (commit a4a87c3, "switch tests to Vitest") · **Related:** [Testing](../development/testing.md), [Deployment](../development/deployment.md)

## Context

The unit tests ran on Karma with Jasmine, the Angular CLI's former default (the comment in `src/test-setup.ts` still refers to Jasmine's behaviour). Karma itself is deprecated, and the Angular CLI's `@angular/build:unit-test` builder runs Vitest.

The wizard's layout specs measure real geometry: `mountInShellLayout` and `expectFillsStep` (`src/app/preprocessing-wizard/testing/preprocessing-test-helpers.ts`) check that each step's main box fills the available height. An emulated DOM without layout, such as jsdom, can't answer that.

The commit records the switch, not the reasons; the context above is what the repository shows.

## Decision

Unit tests run with Vitest through `@angular/build:unit-test` in headless Chromium, provided by Playwright (`angular.json` → `test`: `runner: vitest`, `browsers: ["ChromiumHeadless"]`, viewport 1280×720). Chromium's version is pinned by `package-lock.json`.

## Alternatives considered

None are recorded. Vitest with jsdom would be faster but can't run the layout specs.

## Consequences

- Every machine needs `npx playwright install chromium` once; CI installs it on every run (`--with-deps --only-shell`), uncached on purpose.
- CI clears `CHROME_BIN`, because the runner image points it at its own Chrome, which the builder would launch instead of the pinned Chromium.
- Vitest keeps a `vi.spyOn` until it is restored, and all spec files share one browser context, so `src/test-setup.ts` restores all mocks after every test.
- The Python tests (`tools/tests/`) are separate and run with pytest.
