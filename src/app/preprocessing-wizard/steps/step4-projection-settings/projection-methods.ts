import { ProjectionConfig } from '../../models/column-config';
import { HELP_TEXT } from '../../shared/constants/help-text';

/** Projection-config keys that hold a numeric method parameter. */
export type ProjectionParamKey = {
  [K in keyof ProjectionConfig]: ProjectionConfig[K] extends number ? K : never;
}[keyof ProjectionConfig];

/** Projection-config keys that switch a background method on or off. */
export type ProjectionMethodKey = {
  [K in keyof ProjectionConfig]: ProjectionConfig[K] extends boolean ? K : never;
}[keyof ProjectionConfig];

/** Describes a tunable parameter for a projection method. */
export interface ProjectionParam {
  label: string;
  helpKey: keyof typeof HELP_TEXT.parameters;
  configKey: ProjectionParamKey;
  min: number;
  max: number;
  step?: number;
  /** Default value used by the per-method "reset parameters" action. */
  default: number;
}

/**
 * UI configuration for a projection method.
 * Not to be confused with ProjectionMethod type from shared/types/projection.types.ts
 * which is the string union type for method identifiers.
 */
export interface ProjectionMethodUI {
  key: ProjectionMethodKey;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  sizeHint?: string;
  disabled?: boolean;
  largeDatasetWarning?: boolean;
  params?: ProjectionParam[];
}

/** Neighbour parameters that must stay below the row count (error class K4). */
export const NEIGHBOR_PARAM_KEYS: readonly ProjectionParamKey[] = [
  'isomapNeighbors',
  'lleNeighbors',
  'ltsaNeighbors',
  'umapNeighbors',
];

/** Maps a projection method's config key to its animated-preview key. */
export const PROJECTION_PREVIEW_KEYS: Readonly<Record<ProjectionMethodKey, string>> = {
  enablePCA: 'pca',
  enableTriMap: 'tri',
  enableMDS: 'mds',
  enableIsoMap: 'iso',
  enableLLE: 'lle',
  enableLTSA: 'ltsa',
  enableTopoMap: 'topo',
  enableUMAP: 'umap',
  enableSammon: 'sammon',
  enableTSNE: 'tsne',
};

/**
 * Methods that are neither offered in Step 4 nor run, even when a saved or
 * older config still switches them on. Their config fields, card and worker
 * support stay, so bringing one back means deleting it from this set.
 */
export const HIDDEN_PROJECTION_METHODS: ReadonlySet<ProjectionMethodKey> = new Set<ProjectionMethodKey>([
  // Hidden until druidjs fixes LLE (0.9 finds the largest eigenvectors); see ROADMAP.
  'enableLLE',
]);

/** True when `key` is switched on in `config` and the method is not hidden. */
export function isProjectionMethodActive(config: ProjectionConfig, key: ProjectionMethodKey): boolean {
  return config[key] && !HIDDEN_PROJECTION_METHODS.has(key);
}

/** Every background projection method, sorted by speed (fastest first). FastMap always runs. */
const ALL_PROJECTION_METHODS: readonly ProjectionMethodUI[] = [
  {
    key: 'enablePCA',
    name: 'PCA',
    description: 'Linear projection via eigendecomposition',
    icon: 'analytics',
    badge: 'Very Fast',
    sizeHint: 'any size',
  },
  {
    // Runs with DruidJS's defaults (reference TriMap 1.1.5), so it has no parameters.
    key: 'enableTriMap',
    name: 'TriMap',
    description: 'Global structure preservation',
    icon: 'timeline',
    badge: 'Fast',
    sizeHint: 'up to 100K rows',
  },
  {
    key: 'enableMDS',
    name: 'MDS',
    description: 'Classical Multidimensional Scaling — distance preserving',
    icon: 'grid_on',
    badge: 'Medium',
    sizeHint: 'up to 5K rows',
    largeDatasetWarning: true,
  },
  {
    key: 'enableIsoMap',
    name: 'IsoMap',
    description: 'Manifold learning — preserves geodesic distances',
    icon: 'auto_graph',
    badge: 'Medium',
    sizeHint: 'up to 5K rows',
    largeDatasetWarning: true,
    params: [
      {
        label: 'Neighbors (0 = auto)',
        helpKey: 'isomapNeighbors',
        configKey: 'isomapNeighbors',
        min: 0,
        max: 200,
        default: 0,
      },
    ],
  },
  {
    key: 'enableLLE',
    name: 'LLE',
    description: 'Locally Linear Embedding — preserves local geometry',
    icon: 'blur_on',
    badge: 'Medium',
    sizeHint: 'up to 30K rows',
    largeDatasetWarning: true,
    params: [
      {
        label: 'Neighbors (0 = auto)',
        helpKey: 'lleNeighbors',
        configKey: 'lleNeighbors',
        min: 0,
        max: 200,
        default: 0,
      },
    ],
  },
  {
    key: 'enableLTSA',
    name: 'LTSA',
    description: 'Local Tangent Space Alignment — curved manifolds',
    icon: 'waves',
    badge: 'Medium',
    sizeHint: 'up to 20K rows',
    largeDatasetWarning: true,
    params: [
      {
        label: 'Neighbors (0 = auto)',
        helpKey: 'ltsaNeighbors',
        configKey: 'ltsaNeighbors',
        min: 0,
        max: 200,
        default: 0,
      },
    ],
  },
  {
    key: 'enableTopoMap',
    name: 'TopoMap',
    description: 'Topology preserving via MST',
    icon: 'terrain',
    badge: 'Medium',
    sizeHint: 'up to 8K rows',
    largeDatasetWarning: true,
  },
  {
    key: 'enableUMAP',
    name: 'UMAP',
    description: 'Balances local and global structure',
    icon: 'scatter_plot',
    badge: 'Slow',
    sizeHint: 'up to 100K rows',
    largeDatasetWarning: true,
    params: [
      {
        label: 'Number of Neighbors',
        helpKey: 'umapNeighbors',
        configKey: 'umapNeighbors',
        min: 2,
        max: 200,
        default: 15,
      },
      {
        label: 'Minimum Distance',
        helpKey: 'umapMinDist',
        configKey: 'umapMinDist',
        min: 0,
        max: 0.99,
        step: 0.01,
        default: 0.1,
      },
    ],
  },
  {
    key: 'enableSammon',
    name: 'Sammon',
    description: 'Sammon mapping — preserves small distances',
    icon: 'hub',
    badge: 'Slow',
    sizeHint: 'up to 5K rows',
    largeDatasetWarning: true,
  },
  {
    key: 'enableTSNE',
    name: 't-SNE',
    description: 'Preserves local clusters',
    icon: 'bubble_chart',
    badge: 'Very Slow',
    sizeHint: 'up to 15K rows',
    largeDatasetWarning: true,
    params: [
      { label: 'Perplexity', helpKey: 'tsnePerplexity', configKey: 'tsnePerplexity', min: 5, max: 50, default: 30 },
      {
        label: 'Iterations',
        helpKey: 'tsneIterations',
        configKey: 'tsneIterations',
        min: 250,
        max: 5000,
        step: 250,
        default: 1000,
      },
    ],
  },
];

/** The background methods offered in Step 4: every method that is not hidden. */
export const PROJECTION_METHODS: readonly ProjectionMethodUI[] = ALL_PROJECTION_METHODS.filter(
  method => !HIDDEN_PROJECTION_METHODS.has(method.key)
);
