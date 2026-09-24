import { ProjectionConfig } from '../../models/column-config';
import { ProjectionResult, ProjectionService } from '../../../services/projection.service';
import { ProjectionMethodKey, isProjectionMethodActive } from '../step4-projection-settings/projection-methods';

type Ids = (string | number)[];
type Runner = (
  service: ProjectionService,
  features: number[][],
  ids: Ids,
  config: ProjectionConfig
) => Promise<ProjectionResult>;

interface BackgroundMethod {
  /** ProjectionService method id, also the key of its background status. */
  key: string;
  /** Display name. */
  name: string;
  /** Projection-config switch; a hidden method never runs (see HIDDEN_PROJECTION_METHODS). */
  configKey: ProjectionMethodKey;
  run: Runner;
}

/** One optional projection to compute in the background after the primary FastMap run. */
export interface BackgroundProjectionRun {
  key: string;
  name: string;
  run: () => Promise<ProjectionResult>;
}

/** The optional projection methods, in display order. */
const BACKGROUND_METHODS: readonly BackgroundMethod[] = [
  { key: 'pca', name: 'PCA', configKey: 'enablePCA', run: (s, f, ids) => s.runPCABackground(f, ids) },
  {
    key: 'isomap',
    name: 'IsoMap',
    configKey: 'enableIsoMap',
    run: (s, f, ids, c) => s.runIsoMap(f, ids, { neighbors: c.isomapNeighbors }),
  },
  { key: 'mds', name: 'MDS', configKey: 'enableMDS', run: (s, f, ids) => s.runMDS(f, ids) },
  {
    key: 'lle',
    name: 'LLE',
    configKey: 'enableLLE',
    run: (s, f, ids, c) => s.runLLE(f, ids, { neighbors: c.lleNeighbors }),
  },
  {
    key: 'ltsa',
    name: 'LTSA',
    configKey: 'enableLTSA',
    run: (s, f, ids, c) => s.runLTSA(f, ids, { neighbors: c.ltsaNeighbors }),
  },
  {
    key: 'tsne',
    name: 't-SNE',
    configKey: 'enableTSNE',
    run: (s, f, ids, c) => s.runTSNE(f, ids, { perplexity: c.tsnePerplexity, iterations: c.tsneIterations }),
  },
  {
    key: 'umap',
    name: 'UMAP',
    configKey: 'enableUMAP',
    run: (s, f, ids, c) => s.runUMAP(f, ids, { neighbors: c.umapNeighbors, minDist: c.umapMinDist }),
  },
  { key: 'trimap', name: 'TriMap', configKey: 'enableTriMap', run: (s, f, ids) => s.runTriMap(f, ids) },
  { key: 'topomap', name: 'TopoMap', configKey: 'enableTopoMap', run: (s, f, ids) => s.runTopoMap(f, ids) },
  { key: 'sammon', name: 'Sammon', configKey: 'enableSammon', run: (s, f, ids) => s.runSammon(f, ids) },
];

/** The background methods that run for `config`: switched on and not hidden, in display order. */
function activeMethods(config: ProjectionConfig): BackgroundMethod[] {
  return BACKGROUND_METHODS.filter(m => isProjectionMethodActive(config, m.configKey));
}

/** Display names of the background methods that run for `config`, in display order. */
export function enabledBackgroundMethodNames(config: ProjectionConfig): string[] {
  return activeMethods(config).map(m => m.name);
}

/** Display name of a background status key (e.g. 'tsne' → 't-SNE'). */
export function backgroundMethodName(key: string): string {
  return BACKGROUND_METHODS.find(m => m.key === key)?.name ?? key.toUpperCase();
}

/** The runs for every background method that runs for `config`. */
export function buildBackgroundProjectionRuns(
  service: ProjectionService,
  config: ProjectionConfig,
  features: number[][],
  ids: Ids
): BackgroundProjectionRun[] {
  return activeMethods(config).map(m => ({
    key: m.key,
    name: m.name,
    run: () => m.run(service, features, ids, config),
  }));
}
