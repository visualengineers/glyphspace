import type { Mocked } from 'vitest';
import { ProjectionService } from '../../../services/projection.service';
import { ProjectionConfig } from '../../models/column-config';
import { DEFAULT_PROJECTION_CONFIG } from '../../models/preprocessing-state';
import { createSpyObj } from '../../../../testing/create-spy-obj';
import { buildBackgroundProjectionRuns, enabledBackgroundMethodNames } from './background-projections';

const FEATURES = [
  [0.1, 0.2],
  [0.3, 0.4],
];
const IDS = [1, 2];

/** Every background method switched on, LLE included (as an older saved config may have it). */
const EVERYTHING_ON: ProjectionConfig = {
  ...DEFAULT_PROJECTION_CONFIG,
  enablePCA: true,
  enableIsoMap: true,
  enableMDS: true,
  enableLLE: true,
  enableLTSA: true,
  enableTSNE: true,
  enableUMAP: true,
  enableTriMap: true,
  enableTopoMap: true,
  enableSammon: true,
};

describe('background projections', () => {
  let service: Mocked<ProjectionService>;

  beforeEach(() => {
    service = createSpyObj<ProjectionService>('ProjectionService', [
      'runPCABackground',
      'runIsoMap',
      'runMDS',
      'runLLE',
      'runLTSA',
      'runTSNE',
      'runUMAP',
      'runTriMap',
      'runTopoMap',
      'runSammon',
    ]);
  });

  it('never names LLE, which is hidden, even when the config enables it', () => {
    expect(enabledBackgroundMethodNames(EVERYTHING_ON)).toEqual([
      'PCA',
      'IsoMap',
      'MDS',
      'LTSA',
      't-SNE',
      'UMAP',
      'TriMap',
      'TopoMap',
      'Sammon',
    ]);
  });

  it('never starts LLE, even when the config enables it', async () => {
    const runs = buildBackgroundProjectionRuns(service, EVERYTHING_ON, FEATURES, IDS);
    await Promise.all(runs.map(r => r.run()));

    expect(runs.map(r => r.key)).not.toContain('lle');
    expect(service.runLLE).not.toHaveBeenCalled();
    expect(service.runLTSA).toHaveBeenCalledTimes(1);
  });

  it('runs TriMap without parameters (DruidJS defaults)', async () => {
    const config: ProjectionConfig = { ...DEFAULT_PROJECTION_CONFIG, enablePCA: false, enableIsoMap: false };
    const runs = buildBackgroundProjectionRuns(service, { ...config, enableTriMap: true }, FEATURES, IDS);
    await Promise.all(runs.map(r => r.run()));

    expect(runs.map(r => r.name)).toEqual(['TriMap']);
    expect(service.runTriMap).toHaveBeenCalledWith(FEATURES, IDS);
  });
});
