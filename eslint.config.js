// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettierConfig = require("eslint-config-prettier");

// Components written before Angular 22 made OnPush the default. `ng update` pinned them to
// the previous behaviour (ChangeDetectionStrategy.Eager); new components use OnPush.
// Remove a file from this list once it works with OnPush
// (docs/decisions/0011-existing-components-keep-eager-change-detection.md).
const EAGER_CHANGE_DETECTION = [
  "src/app/app.component.ts",
  "src/app/canvas/glyph-canvas.component.ts",
  "src/app/canvas/magiclens/magiclens.component.ts",
  "src/app/canvas/navigationcontrols/navigationcontrols.component.ts",
  "src/app/canvas/settingscontrols/settingscontrols.component.ts",
  "src/app/canvas/tooltip/tooltip.component.ts",
  "src/app/menubar/menubar.component.ts",
  "src/app/preprocessing-wizard/preprocessing-wizard.component.ts",
  "src/app/preprocessing-wizard/shared/data-preview-table/data-preview-table.component.ts",
  "src/app/preprocessing-wizard/shared/data-type-badge/data-type-badge.component.ts",
  "src/app/preprocessing-wizard/shared/help-tooltip/help-tooltip.component.ts",
  "src/app/preprocessing-wizard/shared/progress-stepper/progress-stepper.component.ts",
  "src/app/preprocessing-wizard/shared/projection-preview/projection-preview.component.spec.ts",
  "src/app/preprocessing-wizard/shared/projection-preview/projection-preview.component.ts",
  "src/app/preprocessing-wizard/shared/wizard-issue-card/wizard-issue-card.component.ts",
  "src/app/preprocessing-wizard/steps/step1-upload/step1-upload.component.ts",
  "src/app/preprocessing-wizard/steps/step2-column-selection/step2-column-selection.component.ts",
  "src/app/preprocessing-wizard/steps/step3-configure-data-features/step3-configure-data-features.component.ts",
  "src/app/preprocessing-wizard/steps/step4-projection-settings/step4-projection-settings.component.ts",
  "src/app/preprocessing-wizard/steps/step5-glyph-color-settings/step5-glyph-color-settings.component.ts",
  "src/app/preprocessing-wizard/steps/step6-review-processing/step6-review-processing.component.ts",
  "src/app/shared/components/color-scale-selector/color-scale-selector.component.spec.ts",
  "src/app/shared/components/color-scale-selector/color-scale-selector.component.ts",
  "src/app/shared/components/mini-histogram/mini-histogram.component.ts",
  "src/app/shared/components/toast/toast.component.ts",
  "src/app/sidebar/encoding-tab/encoding-tab.component.ts",
  "src/app/sidebar/filter-summary/filter-summary.component.ts",
  "src/app/sidebar/filters-tab/filters-tab.component.ts",
  "src/app/sidebar/glyph-legend/glyph-legend.component.ts",
  "src/app/sidebar/histogram/histogram.component.ts",
  "src/app/sidebar/sidebar.component.ts",
];

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "glyph"],
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@angular-eslint/prefer-inject": "off",
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/no-output-native": "warn",
      "eqeqeq": ["warn", "smart"],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/eqeqeq": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
    },
  },
  {
    files: EAGER_CHANGE_DETECTION,
    rules: {
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
    },
  },
  prettierConfig,
]);
