/**
 * Centralized help text for preprocessing wizard
 * All explanations are written in plain language for beginner users
 */

export const HELP_TEXT = {
  // Data Types
  dataTypes: {
    numeric: 'Numbers that can be measured or counted. Examples: age, price, temperature',
    categorical: 'Limited distinct values or categories. Examples: color (red, blue, green), country names',
    text: 'Free-form text data. Examples: descriptions, comments, addresses',
    date: 'Date or datetime values. Examples: 2024-01-15, timestamps',
    boolean: 'True/False or Yes/No values',
    id: 'Unique identifiers for each row. Examples: customer ID, transaction number',
    coordinate: 'Geographic coordinates (latitude/longitude)',
    unknown: 'Data type could not be determined automatically',
  },

  // Encoding Methods
  encoding: {
    none: {
      short: 'Keep original values without transformation',
      when: 'Use for: Data that is already numeric',
      example: '',
    },
    oneHot: {
      short: 'Create separate binary columns for each category',
      when: 'Use for: Categorical data with few distinct values (&lt;10)',
      example:
        "<strong>Example:</strong> 'Color: Red, Blue' becomes two columns: <code>Red=1/0</code>, <code>Blue=1/0</code>",
    },
    label: {
      short: 'Convert categories to integer codes',
      when: 'Use for: Categorical data with many distinct values',
      example: "<strong>Example:</strong> <code>'Red'=0</code>, <code>'Blue'=1</code>, <code>'Green'=2</code>",
    },
    normalize: {
      short: 'Scale values to 0-1 range',
      when: 'Use for: Numeric data when you want all values between 0 and 1',
      example: '<strong>Example:</strong> Values 10-100 become 0.0-1.0',
    },
    standardize: {
      short: 'Transform to zero mean and unit variance (Z-score)',
      when: 'Use for: Numeric data following a normal distribution',
      example: '<strong>Example:</strong> Values are centered around 0 with standard deviation of 1',
    },
  },

  // Scaling Methods
  scaling: {
    none: {
      short: 'No scaling applied',
      when: 'Use when: Data is already in desired range or scaling not needed',
    },
    standard: {
      short: 'Centers data around 0 with standard deviation of 1 (Z-score)',
      when: 'Best for: Normally distributed data without major outliers',
    },
    minMax: {
      short: 'Scales to exact 0-1 range',
      when: 'Best for: When you need values in specific range. Warning: Sensitive to outliers',
    },
    robust: {
      short: 'Uses median and IQR instead of mean and standard deviation',
      when: 'Best for: Data with outliers - more resilient than standard scaling',
    },
  },

  // Missing Value Strategies
  missingValues: {
    keep: 'Leave missing values as-is. May cause issues in some visualizations or algorithms.',
    removeRows: 'Delete entire rows that contain missing values. <strong>⚠ Warning: Data Loss</strong>',
    fillMean: 'Replace missing values with the average (mean). Only works for numeric columns.',
    fillMedian: 'Replace missing values with the middle value (median). More robust to outliers than mean.',
    fillMode: 'Replace missing values with the most common value. Works for both numeric and categorical data.',
    fillValue: 'Specify a custom value to use for all missing entries.',
  },

  // Outlier Detection Methods
  outlierMethods: {
    iqr_1_5:
      '<strong>IQR (1.5x)</strong> - Standard method<br/>Flags values beyond 1.5× the box plot whiskers (Q1-1.5×IQR or Q3+1.5×IQR).<br/><em>Most commonly used, balanced approach</em>',
    iqr_2_0:
      '<strong>IQR (2.0x)</strong> - More relaxed<br/>Catches only extreme outliers beyond 2× the IQR.<br/><em>Use when you want to keep more data</em>',
    iqr_3_0:
      '<strong>IQR (3.0x)</strong> - Very lenient<br/>Minimal outlier detection - only catches very extreme values.<br/><em>Use when outliers might be legitimate</em>',
    zscore_2:
      '<strong>Z-Score (2σ)</strong> - Strict<br/>Flags values more than 2 standard deviations from the mean.<br/><em>Catches ~5% of data in normal distribution</em>',
    zscore_3:
      '<strong>Z-Score (3σ)</strong> - Standard<br/>Flags values more than 3 standard deviations from the mean.<br/><em>Balanced statistical method, catches ~0.3% in normal distribution</em>',
    zscore_4:
      '<strong>Z-Score (4σ)</strong> - Lenient<br/>Only catches values very far from the mean (4+ standard deviations).<br/><em>Very conservative approach</em>',
  },

  // Outlier Strategies
  outlierStrategies: {
    keep: 'Keep all outliers in your data. They may skew visualizations but preserve original information.',
    remove: 'Delete rows containing outlier values. <strong>⚠ Warning: Data Loss</strong>',
    cap: 'Limit outliers to boundary values (cap at threshold). Preserves row count while reducing extreme values.',
  },

  // Projection Methods
  projections: {
    pca: {
      name: 'PCA (Principal Component Analysis)',
      when: 'Shows immediately',
      description:
        'Fast linear dimensionality reduction that captures the directions of maximum variance in your data.',
      bestFor: [
        'Quick initial exploration',
        'Understanding overall data structure',
        'Identifying main patterns and outliers',
        'Linear relationships between features',
      ],
      characteristics: 'Creates smooth, broad patterns. Points far apart in PCA are genuinely different.',
      speed: 'Very fast (&lt;1 second for most datasets)',
      technical: 'Computes eigenvalues of covariance matrix. Always runs first to provide immediate visualization.',
    },

    fastmap: {
      name: 'FastMap',
      when: 'Available as background projection',
      description: 'Fast distance-preserving projection with O(n) complexity. Ideal for large datasets.',
      bestFor: [
        'Large datasets (40K+ items)',
        'Quick initial exploration',
        'Preserving pairwise distances',
        'When speed is critical',
      ],
      characteristics: 'Very fast projection that preserves distances. Great for initial exploration of large data.',
      speed: 'Very fast (sub-second even for 40K+ items)',
      technical:
        'Projects data to lower dimensions by selecting pivot points and computing distances. O(n) complexity.',
    },

    isomap: {
      name: 'IsoMap',
      when: 'Runs first and loads immediately',
      description: 'Non-linear manifold learning that preserves geodesic distances between datapoints.',
      bestFor: [
        'Non-linear data structures',
        'Preserving geodesic distances',
        'Revealing manifold structure',
        'General-purpose visualization',
      ],
      characteristics: 'Captures non-linear relationships. Better than PCA for curved manifolds.',
      speed: 'Fast (few seconds for most datasets)',
      technical: 'Builds neighborhood graph and computes shortest paths to preserve geodesic distances.',
    },

    tsne: {
      name: 't-SNE (t-Distributed Stochastic Neighbor Embedding)',
      when: 'Computes in background, may take minutes',
      description: 'Focuses on preserving local neighborhoods - great for finding clusters and structure.',
      bestFor: [
        'Discovering clusters and groups',
        'Revealing local structure',
        'Visualizing high-dimensional data',
        'Pattern recognition',
      ],
      characteristics:
        'Emphasizes local relationships. Clusters are meaningful, but distances between clusters are not.',
      speed: 'Slow (seconds to minutes depending on dataset size)',
      parameters: {
        perplexity: 'Balances local vs. global structure (5-50). Higher = more global context.',
        iterations: 'More iterations = better quality, but slower (500-5000)',
      },
      technical: 'Uses gradient descent to minimize KL divergence. Computationally intensive.',
      warnings: [
        'Global structure (distances between clusters) may be misleading',
        'Different runs may produce different results',
        'Can be very slow on large datasets (&gt;10k rows)',
      ],
    },

    umap: {
      name: 'UMAP (Uniform Manifold Approximation and Projection)',
      when: 'Computes in background',
      description: 'Balances both local and global structure - faster than t-SNE with comparable quality.',
      bestFor: [
        'Balancing local and global structure',
        'Preserving more global relationships than t-SNE',
        'Faster results on large datasets',
        'General-purpose visualization',
      ],
      characteristics: 'Maintains both cluster structure AND meaningful distances between clusters.',
      speed: 'Slow (but faster than t-SNE)',
      parameters: {
        neighbors: 'Size of local neighborhood (2-200). Higher = more global structure.',
        minDist: 'Minimum distance between points (0.0-0.99). Lower = tighter clusters.',
      },
      technical: 'Based on Riemannian geometry and topological data analysis.',
      warnings: [
        'Can be memory-intensive for very large datasets',
        'JavaScript version may differ slightly from Python implementation',
      ],
    },

    mds: {
      name: 'MDS (Multidimensional Scaling)',
      when: 'Computes in background',
      description: 'Classical metric scaling that preserves pairwise distances between all points.',
      bestFor: [
        'Preserving overall distance structure',
        'Creating interpretable layouts',
        'When global relationships matter more than clusters',
        'Comparing similarity between items',
      ],
      characteristics: 'Focuses on preserving distances. Similar items stay close together.',
      speed: 'Fast (few seconds)',
      technical: 'Minimizes stress function to preserve pairwise distances in lower dimensions.',
    },

    ltsa: {
      name: 'LTSA (Local Tangent Space Alignment)',
      when: 'Computes in background',
      description: 'Manifold learning method that uses local tangent spaces to understand curvature.',
      bestFor: [
        'Curved manifolds with smooth transitions',
        'When local geometry is complex',
        'Understanding intrinsic data structure',
        'Datasets with well-defined neighborhoods',
      ],
      characteristics: 'Better at handling curved manifolds than LLE. Uses local tangent approximations.',
      speed: 'Medium (few seconds to a minute)',
      technical: 'Computes local tangent spaces and aligns them to find global coordinates.',
    },

    trimap: {
      name: 'TriMap',
      when: 'Computes in background',
      description: 'Modern dimensionality reduction that preserves global structure using triplet constraints.',
      bestFor: [
        'Large datasets where t-SNE is too slow',
        'Preserving both local and global structure',
        'When cluster separation matters',
        'General-purpose visualization',
      ],
      characteristics: 'Good balance of speed and quality. Better global structure than t-SNE.',
      speed: 'Medium (faster than t-SNE)',
      technical: 'Uses triplet constraints to preserve relative distances.',
    },

    topomap: {
      name: 'TopoMap',
      when: 'Computes in background',
      description: 'Topology-preserving projection that maintains connectivity relationships.',
      bestFor: [
        'Preserving topological features',
        'When connectivity patterns matter',
        'Network-like data structures',
        'Understanding data shape',
      ],
      characteristics: 'Focuses on preserving the topological structure of the data.',
      speed: 'Medium',
      technical: 'Preserves topological features like connected components and holes.',
    },

    sammon: {
      name: 'Sammon Mapping',
      when: 'Computes in background',
      description: 'Non-linear projection that emphasizes preserving small distances.',
      bestFor: [
        'When small distances are more important than large ones',
        'Preserving local similarity',
        'Compact visualizations',
        'Data with meaningful local structure',
      ],
      characteristics: 'Puts more weight on preserving small distances. Good for local structure.',
      speed: 'Medium',
      technical: 'Minimizes Sammon stress with inverse weighting on original distances.',
    },

    backgroundProcessing: {
      title: 'How Background Processing Works',
      description: `
        <strong>Immediate Start:</strong> After data cleaning, FastMap runs immediately and loads into Glyphspace.
        FastMap is ideal for large datasets (40K+) due to its O(n) complexity.<br/><br/>

        <strong>Background Computation:</strong> While you explore with FastMap, other selected projections
        (PCA, IsoMap, MDS, t-SNE, UMAP, TriMap, etc.) compute in the background without blocking your workflow.<br/><br/>

        <strong>Notifications:</strong> When each projection finishes, you'll see a notification with an
        option to switch to that view. The projection is automatically added to the dropdown.<br/><br/>

        <strong>Progress Tracking:</strong> Check the projection status indicator in the top-right corner
        of Glyphspace to see which projections are ready, computing, or pending.
      `,
    },
  },

  // Projection Parameters (shown in Step 4 next to the sliders)
  parameters: {
    tsnePerplexity: `<strong>Perplexity</strong>: roughly how many neighbors t-SNE looks at for each point.<br/><br/>
      • <strong>Low (5–15):</strong> very local view; groups often split into small fragments<br/>
      • <strong>Around 30 (default):</strong> a good balance for most data<br/>
      • <strong>High (40–50):</strong> wider view; groups become smoother and rounder<br/><br/>
      <em>Rule of thumb: 30 works well for 1,000–10,000 rows.</em>`,

    tsneIterations: `<strong>Iterations</strong>: how long t-SNE keeps improving the layout.<br/><br/>
      • <strong>250–500:</strong> quick preview; the layout may not have settled yet<br/>
      • <strong>1000 (default):</strong> good quality for most data<br/>
      • <strong>2000+:</strong> a little better, but takes longer<br/><br/>
      <em>If groups still look smeared, try more iterations.</em>`,

    tsneLearningRate: `<strong>Learning rate</strong>: how big a step t-SNE takes when it moves points.<br/><br/>
      • <strong>Too low (50–100):</strong> slow, and may get stuck<br/>
      • <strong>Around 200 (default):</strong> safe for most data<br/>
      • <strong>Too high (500+):</strong> may miss fine structure<br/><br/>
      <em>If the picture looks squeezed, try 100–150; if it looks scattered, try 300–500.</em>`,

    umapNeighbors: `<strong>Number of neighbors</strong>: how many nearby points UMAP looks at for each point.<br/><br/>
      • <strong>Few (2–10):</strong> fine detail; groups may break into small pieces<br/>
      • <strong>Around 15 (default):</strong> a good balance for most data<br/>
      • <strong>Many (50+):</strong> the big picture; groups become looser and move closer together`,

    umapMinDist: `<strong>Minimum distance</strong>: how tightly UMAP may pack points together.<br/><br/>
      • <strong>Low (0–0.1):</strong> dense, tight clumps; groups are easy to tell apart<br/>
      • <strong>Medium (0.1–0.5):</strong> compact groups with some space between the points<br/>
      • <strong>High (0.5–0.99):</strong> points spread out evenly; shows the overall shape better<br/><br/>
      <em>The default is 0.1.</em>`,

    isomapNeighbors: `<strong>Neighbors</strong>: how many nearby points IsoMap connects to each point.<br/><br/>
      • <strong>0 = auto:</strong> about one tenth of the rows<br/>
      • <strong>Few (5–15):</strong> follows fine, curved structure; separate groups may lose their connection<br/>
      • <strong>Many (50+):</strong> smoother, more global layout that can cut across curves`,

    lleNeighbors: `<strong>Neighbors</strong>: how many nearby points LLE uses to rebuild each point.<br/><br/>
      • <strong>0 = auto:</strong> about one tenth of the rows<br/>
      • <strong>Few (5–10):</strong> very local; the layout can collapse into lines or dots<br/>
      • <strong>More (10–30):</strong> usually more stable<br/><br/>
      <em>Use more neighbors than the number of columns that really matter.</em>`,

    ltsaNeighbors: `<strong>Neighbors</strong>: how many nearby points LTSA uses to estimate the local shape.<br/><br/>
      • <strong>0 = auto:</strong> about one tenth of the rows<br/>
      • <strong>Few (5–15):</strong> follows detailed curves, but is less stable<br/>
      • <strong>Many (40+):</strong> smoother result that may miss small details`,
  },

  // Table Column Headers
  tableHeaders: {
    type: 'Data type detected automatically based on column values.<br/><br/><strong>Numeric:</strong> Numbers<br/><strong>Categorical:</strong> Limited distinct values<br/><strong>Text:</strong> Free-form text',
    missing:
      'Percentage of rows with no value in this column.<br/><br/><strong>&gt;50% missing</strong> may indicate poor data quality and could cause issues.',
    unique:
      'Number of distinct (different) values in this column.<br/><br/><strong>High uniqueness</strong> in categorical columns can cause performance issues with one-hot encoding.',
    distribution:
      'Visual representation of value distribution.<br/><br/>Shows a histogram of value frequencies for both numeric and categorical columns.',
    statistics:
      'Summary statistics for numeric columns.<br/><br/>Includes min, max, mean, median, and standard deviation.',
    // Configure Data & Features column headers
    encoding:
      'Defines how data values are transformed.<br/><br/><strong>Numeric data:</strong> Can be left as-is (None), scaled to a 0–1 range (Normalize), or centered and scaled to unit variance (Standardize).<br/><br/><strong>Categorical data:</strong> Can be converted to numeric IDs (Label) or to separate binary columns for each category (One-hot).',
    scaling:
      'Adjusts numeric values to make them comparable.<br/><br/><strong>None:</strong> No scaling<br/><strong>Standard:</strong> Standardization to mean 0 and unit variance<br/><strong>Min-Max:</strong> Scaling to a fixed range like 0–1<br/><strong>Robust:</strong> Scaling based on percentiles to reduce outlier effects',
    missingValues:
      'Controls how missing data is handled.<br/><br/><strong>Keep:</strong> Keep them as-is<br/><strong>Remove rows:</strong> Remove rows containing them<br/><strong>Fill mode:</strong> Fill with the most common value<br/><strong>Fill value:</strong> Fill with a custom value',
    outliers:
      "Controls how extreme values are handled. Two detection principles:<br/><br/><strong>IQR</strong> — compares values to the data's quartiles; good for skewed / non-normal data.<br/><strong>Z-Score</strong> — standard deviations from the mean; good for roughly normal data.<br/><br/>The label (Strict / Moderate / Relaxed) only describes how aggressive the threshold is <em>within</em> a method, so the same label can appear for both.<br/><br/><strong>Keep</strong> / <strong>Remove</strong> / <strong>Cap</strong> decide what happens to detected outliers.",
  },

  // General concepts
  general: {
    outliers: `<strong>What are outliers?</strong><br/><br/>
      Outliers are unusually high or low values that differ significantly from typical patterns in your data.<br/><br/>
      <strong>Example:</strong> A person aged 150 in a dataset of ages, or a price of $1,000,000 when most items cost $10-$50.<br/><br/>
      Outliers can be:<br/>
      • <strong>Errors:</strong> Data entry mistakes, measurement errors<br/>
      • <strong>Legitimate:</strong> Rare but valid extreme values<br/>
      • <strong>Important:</strong> Indicators of special cases or fraud`,

    duplicates: `<strong>What are duplicates?</strong><br/><br/>
      Duplicate rows have identical values in all columns. They represent the same data point entered multiple times.<br/><br/>
      Removing duplicates:<br/>
      • Reduces dataset size without losing information<br/>
      • Prevents over-representation of certain data points<br/>
      • Improves processing performance<br/><br/>
      <em>💡 Keep duplicates if they represent repeated events (e.g., multiple purchases by same customer)</em>`,

    glyphFeatures: `<strong>Why exactly 5 features?</strong><br/><br/>
      Each feature becomes one point on a 5-pointed star glyph, creating a visual pattern that lets you see 5 dimensions of data at a glance.<br/><br/>
      <strong>Star glyph visualization:</strong><br/>
      • Each ray = one feature<br/>
      • Ray length = feature value<br/>
      • Pattern shape = data characteristics<br/><br/>
      <em>💡 Tip: Select features with high variance (lots of variation) for the most informative visualizations</em>`,

    colorFeature: `<strong>Color Feature</strong> determines the color of each glyph in the visualization.<br/><br/>
      • <strong>Numeric:</strong> Creates a continuous color gradient (e.g., blue to red)<br/>
      • <strong>Categorical:</strong> Assigns distinct colors to each category<br/><br/>
      A sensible attribute is selected automatically (a small categorical group, or the most varied numeric column) — change it anytime.`,

    colorScale: `<strong>Color Scale</strong> is the palette used to map the color feature onto the glyphs.<br/><br/>
      It is <strong>purely cosmetic</strong> — it only changes how the visualization looks, not the underlying data or the projection.<br/><br/>
      <em>Pick a gradient for numeric features or a set of distinct colors for categories.</em>`,

    projection: `<strong>What is dimensionality reduction?</strong><br/><br/>
      Your data might have dozens or hundreds of dimensions (columns). Dimensionality reduction creates a 2D visualization that preserves important patterns and relationships.<br/><br/>
      Think of it as creating a meaningful "map" of your multi-dimensional data that you can actually see and explore.`,

    smartDefaults: `<strong>Smart Defaults</strong> are automatically set based on your data types:<br/><br/>
      • <strong>Numeric columns:</strong> Normalized with Min-Max scaling<br/>
      • <strong>Categorical (few values):</strong> One-Hot encoding<br/>
      • <strong>Categorical (many values):</strong> Label encoding<br/>
      • <strong>Text/ID columns:</strong> Excluded from projection<br/><br/>
      <em>You can change any of these if needed</em>`,
  },
};
