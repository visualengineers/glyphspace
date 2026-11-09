# Conventions

_For contributors preparing a change for review._

## Code style

- **Formatting** is Prettier's job (`.prettierrc`): single quotes, semicolons, ES5 trailing commas, 2-space indent, lines up to 120 characters, no parentheses around a single arrow-function parameter. The pre-commit hook formats staged files under `src/`; `npm run format:check` checks everything.
- **Linting** is ESLint with the recommended TypeScript, stylistic and Angular rule sets plus Angular's template accessibility rules (`eslint.config.js`). Component selectors use the prefix `app-` or `glyph-` (kebab-case); directive selectors `app` (camelCase).
- **Explain every lint exception.** Write the reason on the same line: `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset is an opaque structure from Python`. `any` and `!` produce warnings, not errors, so they need a reason too.
- **Comments say why**, not what the next line does. Keep them true: a comment that describes removed behaviour is worse than none.
- **Python** in `src/assets/` and `tools/` uses type hints and docstrings. It runs under default pandas and pandas 3 (the tests check both), so avoid chained in-place assignments, which do nothing under pandas 3's copy-on-write.

## Angular

- Components are standalone; dependencies are wired in `src/app/app.config.ts` and through `providedIn: 'root'` services.
- Constructor injection is allowed (`@angular-eslint/prefer-inject` is off).
- Heavy parts load on demand: the wizard through `@defer` in `menubar/menubar.component.html`, DruidJS through a dynamic import on the main thread.
- Work that would block the UI belongs in a web worker (`src/app/workers/`), with its message types in `src/app/shared/` ([Worker protocol](../specs/worker-protocol.md)).

## Accessibility

The wizard is a modal dialog with focus management, live-region announcements and keyboard shortcuts ([Wizard](wizard.md#shell-preprocessing-wizardpreprocessing-wizardcomponentts)). New UI follows the same patterns:

- every control has an accessible name;
- announcements go through `WizardAnnouncer`, not new live regions;
- animations respect `prefers-reduced-motion`.

The template accessibility lint rules catch some of this, not all.

## Branches and commits

- Work on a branch off `main` named `feature/<topic>`, `feat/<topic>`, `fix/<topic>` or `chore/<topic>`; merge it with a pull request.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, for example `fix(wizard): step 5 panels end on the shared bottom edge`. Types in use: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`. The body says why the change was needed.
- Reference the issue a change closes (`Closes #71`).

## Pull requests

A pull request is ready for review when:

- CI is green: lint, unit tests and production build ([Deployment](deployment.md));
- the Python tests pass, if Python code changed;
- the docs that describe the changed behaviour are updated in the same PR ([Documentation](documentation.md)): specs for formats and protocols, an ADR for a decision others must live with, the changelog for anything users notice.
