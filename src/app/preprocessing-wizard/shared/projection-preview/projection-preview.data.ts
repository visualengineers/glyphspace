import { PhaseStep, PreviewKey } from './engine';

/** Metadata shown in the header of one projection method's preview. */
export interface PreviewMeta {
  name: string;
  tag: string;
  /** Tag colour class suffix used for the badge styling. */
  tagClass: 'fast' | 'medium' | 'slow' | 'primary';
  rows: string;
  sub: string;
  desc: string;
}

/** One step of the looping animation and the caption shown during it. */
export interface CaptionStep extends PhaseStep {
  cap: string;
}

export const PREVIEW_META: Readonly<Record<PreviewKey, PreviewMeta>> = {
  fast: {
    name: 'FastMap',
    tag: 'Always active',
    tagClass: 'primary',
    rows: '',
    sub: 'Pivot-based linear projection',
    desc: 'The default projection — always on, loads immediately, and is shown while slower methods compute in the background.',
  },
  pca: {
    name: 'PCA',
    tag: 'Very fast',
    tagClass: 'fast',
    rows: 'Any size',
    sub: 'Principal Component Analysis',
    desc: 'Fast and linear — captures the directions of greatest variance.',
  },
  tri: {
    name: 'TriMap',
    tag: 'Fast',
    tagClass: 'fast',
    rows: 'Up to 100K rows',
    sub: 'Triplet-based dimensionality reduction',
    desc: 'Learns from point triplets to keep the global layout honest.',
  },
  mds: {
    name: 'MDS',
    tag: 'Medium',
    tagClass: 'medium',
    rows: 'Up to 5K rows',
    sub: 'Classical Multidimensional Scaling',
    desc: 'Arranges points so pairwise distances match the original data.',
  },
  iso: {
    name: 'IsoMap',
    tag: 'Medium',
    tagClass: 'medium',
    rows: 'Up to 5K rows',
    sub: 'Isometric Mapping',
    desc: 'Measures distances along the manifold, then unrolls it flat.',
  },
  lle: {
    name: 'LLE',
    tag: 'Medium',
    tagClass: 'medium',
    rows: 'Up to 30K rows',
    sub: 'Locally Linear Embedding',
    desc: 'Rebuilds each point from its neighbors, keeping local geometry.',
  },
  ltsa: {
    name: 'LTSA',
    tag: 'Medium',
    tagClass: 'medium',
    rows: 'Up to 20K rows',
    sub: 'Local Tangent Space Alignment',
    desc: 'Aligns local tangent spaces to flatten curved manifolds.',
  },
  topo: {
    name: 'TopoMap',
    tag: 'Medium',
    tagClass: 'medium',
    rows: 'Up to 8K rows',
    sub: 'Topology-preserving mapping via MST',
    desc: 'Builds a minimum spanning tree and preserves its topology.',
  },
  umap: {
    name: 'UMAP',
    tag: 'Slow',
    tagClass: 'slow',
    rows: 'Up to 100K rows',
    sub: 'Uniform Manifold Approximation & Projection',
    desc: 'Balances local detail with the global layout of the data.',
  },
  sammon: {
    name: 'Sammon',
    tag: 'Slow',
    tagClass: 'slow',
    rows: 'Up to 5K rows',
    sub: 'Sammon Mapping',
    desc: 'Like MDS, but small distances count the most.',
  },
  tsne: {
    name: 't-SNE',
    tag: 'Very slow',
    tagClass: 'slow',
    rows: 'Up to 15K rows',
    sub: 't-Distributed Stochastic Neighbor Embedding',
    desc: 'Focuses on local neighborhoods to reveal tight clusters.',
  },
};

export const PREVIEW_CAPTIONS: Readonly<Record<PreviewKey, readonly CaptionStep[]>> = {
  fast: [
    { d: 1.1, cap: 'Your data — many variables at once' },
    { d: 1.7, cap: 'Pick two far-apart pivot points' },
    { d: 1.4, cap: 'The pivots define an axis' },
    { d: 1.9, cap: 'Place each point by its distance to the pivots' },
    { d: 1.7, cap: 'A fast linear layout — ready instantly' },
  ],
  pca: [
    { d: 1.1, cap: 'Your data — many variables at once' },
    { d: 1.9, cap: 'Finding the direction of greatest variance' },
    { d: 0.8, cap: 'Main axis locked in' },
    { d: 1.9, cap: 'Projecting every point onto that axis' },
    { d: 1.7, cap: 'Fewer dimensions — the spread is kept' },
  ],
  tri: [
    { d: 1.1, cap: 'Your data — many variables at once' },
    { d: 2.2, cap: 'Sample triplets: A is closer to B than to C' },
    { d: 2.0, cap: 'Move points to satisfy the triplets' },
    { d: 1.8, cap: 'Clusters — and the global layout — are kept' },
  ],
  mds: [
    { d: 1.1, cap: 'Your data — many variables at once' },
    { d: 2.2, cap: 'Measure every pairwise distance' },
    { d: 1.9, cap: 'Arrange points so distances still match' },
    { d: 1.6, cap: 'Relative distances are preserved' },
  ],
  iso: [
    { d: 1.2, cap: 'Data lying on a curved manifold' },
    { d: 1.6, cap: 'Connect each point to its neighbors' },
    { d: 2.2, cap: 'Distances follow the curve — not the shortcut' },
    { d: 1.8, cap: 'Unroll the manifold flat' },
    { d: 1.5, cap: 'Geodesic distances preserved' },
  ],
  lle: [
    { d: 1.2, cap: 'Data lying on a curved manifold' },
    { d: 2.0, cap: 'Describe each point by its neighbors' },
    { d: 1.9, cap: 'Unfold, keeping each patch intact' },
    { d: 1.5, cap: 'Local geometry preserved' },
  ],
  ltsa: [
    { d: 1.2, cap: 'Data lying on a curved manifold' },
    { d: 1.9, cap: 'Fit a tangent line to each neighborhood' },
    { d: 2.0, cap: 'Align the tangents into one flat space' },
    { d: 1.5, cap: 'Curved structure, flattened' },
  ],
  topo: [
    { d: 1.1, cap: 'Your data — many variables at once' },
    { d: 2.2, cap: 'Build the minimum spanning tree' },
    { d: 1.9, cap: 'Lay out points, keeping the tree intact' },
    { d: 1.5, cap: 'Topology preserved' },
  ],
  umap: [
    { d: 1.1, cap: 'High-dimensional data' },
    { d: 1.7, cap: 'Connect each point to its nearest neighbors' },
    { d: 2.2, cap: 'Neighbors pull together into groups' },
    { d: 1.8, cap: 'Clusters — and the gaps between them — stay meaningful' },
  ],
  sammon: [
    { d: 1.1, cap: 'Your data — many variables at once' },
    { d: 2.0, cap: 'Weigh distances — near pairs matter most' },
    { d: 1.9, cap: 'Arrange points, pinning close pairs first' },
    { d: 1.5, cap: 'Small distances preserved' },
  ],
  tsne: [
    { d: 1.1, cap: 'High-dimensional data' },
    { d: 1.6, cap: 'Measure who sits close to whom' },
    { d: 2.4, cap: 'Pull neighbors in, push the rest away' },
    { d: 1.8, cap: 'Tight clusters form — gaps aren’t to scale' },
  ],
};

export function isPreviewKey(key: string): key is PreviewKey {
  return Object.prototype.hasOwnProperty.call(PREVIEW_META, key);
}

/** Unknown keys fall back to the PCA preview. */
export function resolvePreviewKey(key: string): PreviewKey {
  return isPreviewKey(key) ? key : 'pca';
}
