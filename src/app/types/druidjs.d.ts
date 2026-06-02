/**
 * TypeScript type definitions for @saehrimnir/druidjs
 * DruidJS - A JavaScript Library for Dimensionality Reduction
 * https://github.com/saehm/DruidJS
 */

declare module '@saehrimnir/druidjs' {
  /**
   * PCA - Principal Component Analysis
   * Fast linear dimensionality reduction
   */
  export class PCA {
    constructor(data: number[][], components?: number);
    transform(): number[][];
  }

  /**
   * FastMap - Distance-preserving projection
   * Maintains pairwise distances between datapoints
   * (Not currently used - IsoMap is primary)
   */
  export class FASTMAP {
    constructor(data: number[][], dimensions?: number);
    transform(): number[][];
  }

  /**
   * t-SNE - t-Distributed Stochastic Neighbor Embedding
   * Preserves local structure for cluster discovery
   */
  export class TSNE {
    constructor(
      data: number[][],
      parameters?: {
        d?: number; // Output dimensions (default: 2)
        perplexity?: number; // Balances local vs global (default: 30)
        epsilon?: number; // Learning rate (default: 10)
        iterations?: number; // Number of iterations (default: 1000)
      }
    );
    transform(): number[][];
  }

  /**
   * UMAP - Uniform Manifold Approximation and Projection
   * Balances local and global structure
   */
  export class UMAP {
    constructor(
      data: number[][],
      parameters?: {
        d?: number; // Output dimensions (default: 2)
        n_neighbors?: number; // Number of neighbors (default: 15)
        min_dist?: number; // Minimum distance (default: 0.1)
        local_connectivity?: number; // Local connectivity (default: 1)
      }
    );
    transform(): number[][];
  }

  /**
   * Additional DR methods available in DruidJS
   */
  export class MDS {
    constructor(data: number[][], dimensions?: number);
    transform(): number[][];
  }

  /**
   * ISOMAP - Isometric Feature Mapping
   * Non-linear manifold learning preserving geodesic distances
   * (Primary projection method)
   */
  export class ISOMAP {
    constructor(data: number[][], dimensions?: number);
    transform(): number[][];
  }

  export class LLE {
    constructor(data: number[][], parameters?: { d?: number; neighbors?: number });
    transform(): number[][];
  }
}
