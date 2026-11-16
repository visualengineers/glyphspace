import { ProjectionComputeConfig, ProjectionMethod } from '../shared/types/projection.types';
import {
  DruidClassName,
  DruidModule,
  DruidReducer,
  DruidSpec,
  assertFiniteEmbedding,
  druidSpecFor,
  prepareProjectionInput,
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

// Full rank, so the input reaches DruidJS (input of rank 0 or 1 is embedded without it).
const FEATURES = [
  [1, 2, 3],
  [4, 5, 7],
  [0, 9, 1],
  [6, 1, 4],
];
const IDS = ['a', 7, 'c', 'd'];
const EMBEDDING = [
  [0.1, 0.2],
  [0.3, 0.4],
  [0.5, 0.6],
  [0.7, 0.8],
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
  it('pairs each embedded point with its row id, as a string', () => {
    expect(toPositions(EMBEDDING.slice(0, 2), IDS)).toEqual([
      { id: 'a', x: 0.1, y: 0.2 },
      { id: '7', x: 0.3, y: 0.4 },
    ]);
  });
});

describe('prepareProjectionInput', () => {
  it('passes full-rank input through unchanged', () => {
    expect(prepareProjectionInput(FEATURES)).toEqual({ kind: 'reduce', features: FEATURES });
  });

  it('drops constant columns', () => {
    const withConstants = FEATURES.map(([a, b, c]) => [a, 5, b, c, 0]);

    expect(prepareProjectionInput(withConstants)).toEqual({ kind: 'reduce', features: FEATURES });
  });

  it('places every item at the origin when nothing varies', () => {
    expect(
      prepareProjectionInput([
        [1, 2],
        [1, 2],
        [1, 2],
      ])
    ).toEqual({
      kind: 'exact',
      embedding: [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    });
  });

  /** The exact embedding of input that needs no DruidJS. */
  function exactEmbedding(features: number[][]): number[][] {
    const input = prepareProjectionInput(features);
    if (input.kind !== 'exact') throw new Error('expected an exact embedding');
    return input.embedding;
  }

  it('places items on a line, distances preserved, when one column varies', () => {
    const embedding = exactEmbedding([
      [1, 7],
      [2, 7],
      [4, 7],
    ]);

    [-4 / 3, -1 / 3, 5 / 3].forEach((x, i) => expect(embedding[i][0]).toBeCloseTo(x, 12));
    expect(embedding.map(([, y]) => y)).toEqual([0, 0, 0]);
  });

  it('places items on a line when the columns only repeat each other', () => {
    // b = 3 - 2a: the points lie on a line; the first and the last are sqrt(3² + 6²) apart
    const embedding = exactEmbedding([
      [0, 3],
      [1, 1],
      [3, -3],
    ]);

    expect(embedding.map(([, y]) => y)).toEqual([0, 0, 0]);
    expect(embedding[2][0] - embedding[0][0]).toBeCloseTo(Math.hypot(3, 6), 12);
  });

  it('treats any two rows as a line', () => {
    expect(
      prepareProjectionInput([
        [1, 2, 3],
        [4, 6, 3],
      ]).kind
    ).toBe('exact');
  });

  it('rejects input without rows, ragged rows and non-finite values', () => {
    expect(() => prepareProjectionInput([])).toThrowError('There are no rows to project.');
    expect(() => prepareProjectionInput([[1, 2], [3]])).toThrowError(/Row 2 .* has 1 values instead of 2/);
    expect(() =>
      prepareProjectionInput([
        [1, NaN],
        [3, 4],
      ])
    ).toThrowError(/Invalid numeric value in row 1/);
  });
});

describe('assertFiniteEmbedding', () => {
  it('rejects NaN and infinite coordinates and a wrong number of points', () => {
    expect(() =>
      assertFiniteEmbedding(
        'PCA',
        [
          [0, 1],
          [NaN, 2],
          [3, Infinity],
        ],
        3
      )
    ).toThrowError(/^PCA returned invalid coordinates for 2 of 3 items: the projection input is singular/);
    expect(() => assertFiniteEmbedding('PCA', [[0, 1]], 2)).toThrowError('PCA returned 1 coordinates for 2 items.');
    expect(() =>
      assertFiniteEmbedding(
        'PCA',
        [
          [0, 1],
          [2, 3],
        ],
        2
      )
    ).not.toThrow();
  });
});

describe('runDruidProjection', () => {
  it('constructs the requested class once, transforms once and maps the embedding', async () => {
    const { module, constructed } = stubDruid(EMBEDDING);
    const load = vi.fn().mockResolvedValue(module);

    const result = await runDruidProjection(
      load,
      { className: 'ISOMAP', params: { d: 2, neighbors: 3 } },
      FEATURES,
      IDS
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(constructed).toEqual([
      { className: 'ISOMAP', data: FEATURES, params: { d: 2, neighbors: 3 }, transformCalls: [undefined] },
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

  it('embeds input of rank 1 without DruidJS', async () => {
    const load = vi.fn();

    const result = await runDruidProjection(load, druidSpecFor('pca'), [[1], [2], [4]], ['x', 'y', 'z']);

    expect(load).not.toHaveBeenCalled();
    expect(result.positions.map(p => [p.id, p.y])).toEqual([
      ['x', 0],
      ['y', 0],
      ['z', 0],
    ]);
  });

  it('rejects more neighbours than rows before running DruidJS', async () => {
    const load = vi.fn();
    const spec = druidSpecFor('isomap', { isomapNeighbors: 4 });

    await expect(runDruidProjection(load, spec, FEATURES, IDS)).rejects.toThrowError(
      'ISOMAP: 4 neighbors exceed the 4 rows to project; choose fewer than 4 neighbors.'
    );
    await expect(
      runDruidProjection(load, druidSpecFor('umap', { neighbors: 15, minDist: 0.1 }), FEATURES, IDS)
    ).rejects.toThrowError(/^UMAP: 15 neighbors exceed the 4 rows/);
    expect(load).not.toHaveBeenCalled();
  });

  it('rejects a non-finite embedding', async () => {
    const { module } = stubDruid([
      [0, 1],
      [NaN, 0],
      [1, 1],
      [2, 2],
    ]);

    await expect(
      runDruidProjection(() => Promise.resolve(module), druidSpecFor('pca'), FEATURES, IDS)
    ).rejects.toThrowError(/^PCA returned invalid coordinates for 1 of 4 items/);
  });

  it('rejects ids that do not match the rows', async () => {
    await expect(runDruidProjection(vi.fn(), druidSpecFor('pca'), FEATURES, ['a'])).rejects.toThrowError(
      'The projection input has 4 rows but 1 ids.'
    );
  });
});

describe('runDruidProjection with the real DruidJS on degenerate input', () => {
  const load = () => import('@saehrimnir/druidjs') as unknown as Promise<DruidModule>;
  const rows = 60;
  const ids = Array.from({ length: rows }, (_, i) => `r${i}`);
  // DruidJS 0.9 returns NaN for FastMap and PCA on all of these.
  const inputs: [string, number[][]][] = [
    ['one column', Array.from({ length: rows }, (_, i) => [Math.sin(i)])],
    ['one varying column next to constant ones', Array.from({ length: rows }, (_, i) => [Math.sin(i), 0.5, 0.5])],
    ['two columns that repeat each other', Array.from({ length: rows }, (_, i) => [Math.sin(i), 2 * Math.sin(i) + 1])],
    [
      'two varying columns next to a constant one',
      Array.from({ length: rows }, (_, i) => [Math.sin(i), 1, Math.cos(i * 1.3)]),
    ],
  ];

  for (const [label, features] of inputs) {
    for (const method of ['fastmap', 'pca'] as const) {
      it(`${method}: a finite position for every item with ${label}`, async () => {
        const { positions } = await runDruidProjection(load, druidSpecFor(method), features, ids);

        expect(positions.map(p => p.id)).toEqual(ids);
        expect(positions.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
      });
    }
  }

  it('ISOMAP on many identical rows fails with a clear error instead of NaN positions', async () => {
    const duplicates = Array.from({ length: rows }, (_, i) => [i % 3, (i % 3) * 0.5 + 1, i % 2]);

    await expect(runDruidProjection(load, druidSpecFor('isomap'), duplicates, ids)).rejects.toThrowError(
      /^ISOMAP returned invalid coordinates for \d+ of 60 items/
    );
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
      { perplexity: 3, iterations: 120 },
      (p, message) => progress.push([p, message])
    );

    expect(constructed.length).toBe(1);
    expect(constructed[0].className).toBe('TSNE');
    expect(constructed[0].params).toEqual({ d: 2, perplexity: 3, epsilon: 10 });
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

  it('rejects a perplexity of at least the number of rows', async () => {
    const load = vi.fn();

    await expect(
      runTsneProjection(load, FEATURES, IDS, { perplexity: 4, iterations: 50 }, () => undefined)
    ).rejects.toThrowError('t-SNE perplexity 4 needs more than 4 rows; there are 4. Choose a perplexity below 4.');
    expect(load).not.toHaveBeenCalled();
  });

  it('places rank-1 input on a line without iterating', async () => {
    const load = vi.fn();
    const progress: number[] = [];

    const result = await runTsneProjection(
      load,
      [[1], [3], [2]],
      ['a', 'b', 'c'],
      { perplexity: 1, iterations: 50 },
      p => progress.push(p)
    );

    expect(load).not.toHaveBeenCalled();
    expect(result.positions.map(p => p.x)).toEqual([-1, 1, 0]);
    expect(progress).toEqual([100]);
  });
});
