# GlyphSpace documentation

_Start here to find the right page, whether you use GlyphSpace or work on it._

GlyphSpace shows a dataset as glyphs on a 2-D map: each item is placed by a dimensionality reduction (FastMap, PCA, UMAP, t-SNE and others) and drawn as a small glyph that shows its most relevant features. Data comes as CSV, prepared in the browser by the preprocessing wizard or in advance with a command-line tool.

## Using GlyphSpace

| Page | Read it to … |
|---|---|
| [Getting started](user-guide/getting-started.md) | open the app, find your way around, load the sample data |
| [Dashboard](user-guide/dashboard.md) | work with canvases, projections, glyph types, the magic lens and exports |
| [Encoding and filters](user-guide/encoding-and-filters.md) | change glyph features and colours, filter and search items |
| [Importing data](user-guide/importing-data.md) | turn your own CSV into a dataset with the wizard |
| [Preparing data](user-guide/preparing-data.md) | shape a CSV for GlyphSpace, or bundle a dataset with the CLI |
| [Troubleshooting](user-guide/troubleshooting.md) | understand and fix wizard errors K1–K8 and other problems |

## Working on GlyphSpace

| Page | Read it to … |
|---|---|
| [Setup](development/setup.md) | install, run and build the project |
| [Architecture](development/architecture.md) | see how the parts fit together |
| [Dashboard](development/dashboard.md) | understand canvases, rendering, glyphs, filters and data loading |
| [Wizard](development/wizard.md) | understand the wizard's steps, state, undo and errors |
| [Processing pipeline](development/processing-pipeline.md) | follow a CSV from upload to the dashboard |
| [Extending](development/extending.md) | add a glyph type, a colour scale, a projection method or an error class |
| [Testing](development/testing.md) | run and write unit and Python tests |
| [Conventions](development/conventions.md) | prepare a change for review |
| [Deployment](development/deployment.md) | understand CI, the build and GitHub Pages |
| [Documentation](development/documentation.md) | know which document to write or update |

## Reference

| Section | Contents |
|---|---|
| [Specifications](specs/README.md) | the contracts: [dataset format](specs/dataset-format.md), [CSV input](specs/csv-input.md), [processing config](specs/processing-config.md), [worker protocol](specs/worker-protocol.md), [wizard storage](specs/wizard-storage.md), and the [wizard redesign](specs/wizard-redesign.md) requirements |
| [Decision log](decisions/README.md) | architecture decision records: why GlyphSpace is built the way it is |
| [Changelog](../CHANGELOG.md) | what changed, and when |

GlyphSpace is a rewrite of [Glyphboard](https://github.com/visualengineers/glyphboard); the [Glyphboard documentation](https://visualengineers.github.io/glyphboard-doc) explains the original concepts.
