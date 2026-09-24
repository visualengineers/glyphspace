import { ProjectionComputeConfig, ProjectionMethod } from '../shared/types/projection.types';
import {
  DruidClassName,
  DruidModule,
  DruidReducer,
  DruidSpec,
  druidSpecFor,
  runDruidProjection,
  runTsneProjection,
  toPositions,
} from './druid-runner';

interface Construction {
  className: DruidClassName;
  data: number[][];
  params: unknown;
  transformCalls: (number | undefined)[];
}

const CLASS_NAMES: DruidClassName[] = [
  'PCA',
  'FASTMAP',
  'ISOMAP',
  'TSNE',
  'UMAP',
  'MDS',
  'LLE',
  'LTSA',
  'TriMap',
  'TopoMap',
  'SAMMON',
];

/** Stub DruidJS module whose classes record how they were constructed and used. */
function stubDruid(embedding: number[][]): { module: DruidModule; constructed: Construction[] } {
  const constructed: Construction[] = [];
  const makeClass = (className: DruidClassName) =>
    class implements DruidReducer {
      private readonly record: Construction;

      constructor(data: number[][], params?: unknown) {
        this.record = { className, data, params, transformCalls: [] };
        constructed.push(this.record);
      }

      transform(iterations?: number): number[][] {
        this.record.transformCalls.push(iterations);
        return embedding;
      }
    };
  const module = {} as DruidModule;
  for (const name of CLASS_NAMES) {
    module[name] = makeClass(name);
  }
  return { module, constructed };
}

const FEATURES = [
  [1, 2, 3],
  [4, 5, 6],
];
const IDS = ['a', 7];
const EMBEDDING = [
  [0.1, 0.2],
  [0.3, 0.4],
];

type SpecMethod = Exclude<ProjectionMethod, 'tsne'>;

// Constructor arguments for DruidJS 0.9 (see the class docs in its druid.d.ts).
const SPEC_CASES: [SpecMethod, ProjectionComputeConfig | undefined, DruidSpec][] = [
  ['pca', undefined, { className: 'PCA', params: { d: 2 } }],
  ['fastmap', undefined, { className: 'FASTMAP', params: { d: 2 } }],
  ['mds', undefined, { className: 'MDS', params: { d: 2 } }],
  // TopoMap always embeds in 2-D and has no `d` parameter.
  ['topomap', undefined, { className: 'TopoMap', params: {} }],
  ['sammon', undefined, { className: 'SAMMON', params: { d: 2 } }],
  ['isomap', undefined, { className: 'ISOMAP', params: { d: 2 } }],
  ['isomap', { isomapNeighbors: 0 }, { className: 'ISOMAP', params: { d: 2 } }],
  ['isomap', { isomapNeighbors: 12 }, { className: 'ISOMAP', params: { d: 2, neighbors: 12 } }],
  ['lle', { lleNeighbors: 8 }, { className: 'LLE', params: { d: 2, neighbors: 8 } }],
  ['lle', {}, { className: 'LLE', params: { d: 2 } }],
  ['ltsa', { ltsaNeighbors: 9 }, { className: 'LTSA', params: { d: 2, neighbors: 9 } }],
  ['ltsa', undefined, { className: 'LTSA', params: { d: 2 } }],
  // TriMap runs with DruidJS's defaults (0.9 dropped weight_adj).
  ['trimap', undefined, { className: 'TriMap', params: { d: 2 } }],
  [
    'umap',
    { neighbors: 20, minDist: 0.5 },
    { className: 'UMAP', params: { d: 2, n_neighbors: 20, min_dist: 0.5, local_connectivity: 1 } },
  ],
  ['umap', {}, { className: 'UMAP', params: { d: 2, n_neighbors: 15, min_dist: 0.1, local_connectivity: 1 } }],
  // min_dist 0 is a valid setting and must reach DruidJS; 0 neighbors is not and falls back.
  [
    'umap',
    { neighbors: 5, minDist: 0 },
    { className: 'UMAP', params: { d: 2, n_neighbors: 5, min_dist: 0, local_connectivity: 1 } },
  ],
  [
    'umap',
    { neighbors: 0, minDist: 0.3 },
    { className: 'UMAP', params: { d: 2, n_neighbors: 15, min_dist: 0.3, local_connectivity: 1 } },
  ],
];

describe('druidSpecFor', () => {
  for (const [method, config, spec] of SPEC_CASES) {
    it(`builds ${spec.className}(features, ${JSON.stringify(spec.params)}) for ${method} ${JSON.stringify(config)}`, () => {
      expect(druidSpecFor(method, config)).toEqual(spec);
    });
  }

  it('requires a config for UMAP', () => {
    expect(() => druidSpecFor('umap')).toThrowError('UMAP requires config with neighbors and minDist');
  });

  it('rejects unknown methods', () => {
    expect(() => druidSpecFor('nope' as SpecMethod)).toThrowError('Unknown projection method: nope');
  });
});

describe('druidSpecFor with the real DruidJS', () => {
  // DruidJS merges unknown keys into its parameters without complaint, so a
  // renamed parameter would silently fall back to its default. Construct every
  // class with its defaults and check each key we pass is one it declares.
  type WithDefaults = new (data: number[][], params: Record<string, never>) => { parameter(): object };
  // More rows than UMAP's default 15 neighbours, which DruidJS requires.
  const data = Array.from({ length: 24 }, (_, i) => [i % 3, (i * 7) % 5, (i * 3) % 4, i / 24]);

  async function declaredParameters(className: DruidClassName): Promise<string[]> {
    const druid = (await import('@saehrimnir/druidjs')) as unknown as Record<DruidClassName, WithDefaults>;
    return Object.keys(new druid[className](data, {}).parameter());
  }

  for (const [method, config, spec] of SPEC_CASES) {
    it(`${spec.className} declares every parameter passed for ${method} ${JSON.stringify(config)}`, async () => {
      const { className, params } = druidSpecFor(method, config);

      expect(await declaredParameters(className)).toEqual(expect.arrayContaining(Object.keys(params)));
    });
  }

  it('TSNE declares every parameter passed by runTsneProjection', async () => {
    expect(await declaredParameters('TSNE')).toEqual(expect.arrayContaining(['d', 'perplexity', 'epsilon']));
  });
});

describe('toPositions', () => {
  it('pairs each embedded point with its row id', () => {
    expect(toPositions(EMBEDDING, IDS)).toEqual([
      { id: 'a', x: 0.1, y: 0.2 },
      { id: 7, x: 0.3, y: 0.4 },
    ]);
  });
});

describe('runDruidProjection', () => {
  it('constructs the requested class once, transforms once and maps the embedding', async () => {
    const { module, constructed } = stubDruid(EMBEDDING);
    const load = vi.fn().mockResolvedValue(module);

    const result = await runDruidProjection(
      load,
      { className: 'ISOMAP', params: { d: 2, neighbors: 5 } },
      FEATURES,
      IDS
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(constructed).toEqual([
      { className: 'ISOMAP', data: FEATURES, params: { d: 2, neighbors: 5 }, transformCalls: [undefined] },
    ]);
    expect(constructed[0].data).toBe(FEATURES);
    expect(result.positions).toEqual(toPositions(EMBEDDING, IDS));
    expect(result.computeTime).toBeGreaterThanOrEqual(0);
  });

  it('passes the spec parameters through unchanged', async () => {
    const { module, constructed } = stubDruid(EMBEDDING);

    await runDruidProjection(() => Promise.resolve(module), druidSpecFor('topomap'), FEATURES, IDS);
    await runDruidProjection(() => Promise.resolve(module), druidSpecFor('pca'), FEATURES, IDS);

    expect(constructed.map(c => [c.className, c.params])).toEqual([
      ['TopoMap', {}],
      ['PCA', { d: 2 }],
    ]);
  });
});

describe('runTsneProjection', () => {
  it('iterates in chunks of 50 and reports progress after each chunk', async () => {
    const { module, constructed } = stubDruid(EMBEDDING);
    const progress: [number, string][] = [];

    const result = await runTsneProjection(
      () => Promise.resolve(module),
      FEATURES,
      IDS,
      { perplexity: 12, iterations: 120 },
      (p, message) => progress.push([p, message])
    );

    expect(constructed.length).toBe(1);
    expect(constructed[0].className).toBe('TSNE');
    expect(constructed[0].params).toEqual({ d: 2, perplexity: 12, epsilon: 10 });
    expect(constructed[0].transformCalls).toEqual([50, 50, 20]);
    expect(progress).toEqual([
      [42, 't-SNE: 50/120 iterations'],
      [83, 't-SNE: 100/120 iterations'],
      [100, 't-SNE: 120/120 iterations'],
    ]);
    expect(result.positions).toEqual(toPositions(EMBEDDING, IDS));
  });

  it('continues one optimisation across chunks (real DruidJS)', async () => {
    // 60 iterations in chunks of 50 + 10 must equal 60 iterations in one go.
    const data = Array.from({ length: 30 }, (_, i) => [Math.sin(i), Math.cos(i * 1.7), (i % 5) / 5]);
    const druid = await import('@saehrimnir/druidjs');
    const ids = data.map((_, i) => i);

    const chunked = await runTsneProjection(
      () => Promise.resolve(druid),
      data,
      ids,
      { perplexity: 5, iterations: 60 },
      () => undefined
    );
    const whole = new druid.TSNE(data, { d: 2, perplexity: 5, epsilon: 10 }).transform(60);

    expect(chunked.positions).toEqual(toPositions(whole, ids));
  });
});
