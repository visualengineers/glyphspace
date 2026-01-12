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
    coordinate: 'Geographic coordinates (latitude/longitude)'
  },

  // Encoding Methods
  encoding: {
    none: {
      short: 'Keep original values without transformation',
      when: 'Use for: Data that is already numeric',
      example: ''
    },
    oneHot: {
      short: 'Create separate binary columns for each category',
      when: 'Use for: Categorical data with few distinct values (&lt;10)',
      example: '<strong>Example:</strong> \'Color: Red, Blue\' becomes two columns: <code>Red=1/0</code>, <code>Blue=1/0</code>'
    },
    label: {
      short: 'Convert categories to integer codes',
      when: 'Use for: Categorical data with many distinct values',
      example: '<strong>Example:</strong> <code>\'Red\'=0</code>, <code>\'Blue\'=1</code>, <code>\'Green\'=2</code>'
    },
    normalize: {
      short: 'Scale values to 0-1 range',
      when: 'Use for: Numeric data when you want all values between 0 and 1',
      example: '<strong>Example:</strong> Values 10-100 become 0.0-1.0'
    },
    standardize: {
      short: 'Transform to zero mean and unit variance (Z-score)',
      when: 'Use for: Numeric data following a normal distribution',
      example: '<strong>Example:</strong> Values are centered around 0 with standard deviation of 1'
    }
  },

  // Scaling Methods
  scaling: {
    none: {
      short: 'No scaling applied',
      when: 'Use when: Data is already in desired range or scaling not needed'
    },
    standard: {
      short: 'Centers data around 0 with standard deviation of 1 (Z-score)',
      when: 'Best for: Normally distributed data without major outliers'
    },
    minMax: {
      short: 'Scales to exact 0-1 range',
      when: 'Best for: When you need values in specific range. Warning: Sensitive to outliers'
    },
    robust: {
      short: 'Uses median and IQR instead of mean and standard deviation',
      when: 'Best for: Data with outliers - more resilient than standard scaling'
    }
  },

  // Missing Value Strategies
  missingValues: {
    keep: 'Leave missing values as-is. May cause issues in some visualizations or algorithms.',
    removeRows: 'Delete entire rows that contain missing values. <strong>⚠ Warning: Data Loss</strong>',
    fillMean: 'Replace missing values with the average (mean). Only works for numeric columns.',
    fillMedian: 'Replace missing values with the middle value (median). More robust to outliers than mean.',
    fillMode: 'Replace missing values with the most common value. Works for both numeric and categorical data.',
    fillValue: 'Specify a custom value to use for all missing entries.'
  },

  // Outlier Detection Methods
  outlierMethods: {
    iqr_1_5: '<strong>IQR (1.5x)</strong> - Standard method<br/>Flags values beyond 1.5× the box plot whiskers (Q1-1.5×IQR or Q3+1.5×IQR).<br/><em>Most commonly used, balanced approach</em>',
    iqr_2_0: '<strong>IQR (2.0x)</strong> - More relaxed<br/>Catches only extreme outliers beyond 2× the IQR.<br/><em>Use when you want to keep more data</em>',
    iqr_3_0: '<strong>IQR (3.0x)</strong> - Very lenient<br/>Minimal outlier detection - only catches very extreme values.<br/><em>Use when outliers might be legitimate</em>',
    zscore_2: '<strong>Z-Score (2σ)</strong> - Strict<br/>Flags values more than 2 standard deviations from the mean.<br/><em>Catches ~5% of data in normal distribution</em>',
    zscore_3: '<strong>Z-Score (3σ)</strong> - Standard<br/>Flags values more than 3 standard deviations from the mean.<br/><em>Balanced statistical method, catches ~0.3% in normal distribution</em>',
    zscore_4: '<strong>Z-Score (4σ)</strong> - Lenient<br/>Only catches values very far from the mean (4+ standard deviations).<br/><em>Very conservative approach</em>'
  },

  // Outlier Strategies
  outlierStrategies: {
    keep: 'Keep all outliers in your data. They may skew visualizations but preserve original information.',
    remove: 'Delete rows containing outlier values. <strong>⚠ Warning: Data Loss</strong>',
    cap: 'Limit outliers to boundary values (cap at threshold). Preserves row count while reducing extreme values.'
  },

  // Projection Methods
  projections: {
    pca: {
      name: 'PCA (Principal Component Analysis)',
      when: 'Shows immediately',
      description: 'Fast linear dimensionality reduction that captures the directions of maximum variance in your data.',
      bestFor: [
        'Quick initial exploration',
        'Understanding overall data structure',
        'Identifying main patterns and outliers',
        'Linear relationships between features'
      ],
      characteristics: 'Creates smooth, broad patterns. Points far apart in PCA are genuinely different.',
      speed: 'Very fast (&lt;1 second for most datasets)',
      technical: 'Computes eigenvalues of covariance matrix. Always runs first to provide immediate visualization.'
    },

    fastmap: {
      name: 'FastMap',
      when: 'Computes in background, notifies when ready',
      description: 'Distance-preserving projection that maintains pairwise distances between datapoints.',
      bestFor: [
        'Preserving relative distances',
        'Understanding data clusters',
        'Faster alternative to MDS',
        'Medium-sized datasets'
      ],
      characteristics: 'Tries to keep distances proportional. Faster than t-SNE but less detail.',
      speed: 'Medium (few seconds for &lt;10k rows)',
      technical: 'Uses pivot-based distance preservation. Good balance between speed and quality.'
    },

    tsne: {
      name: 't-SNE (t-Distributed Stochastic Neighbor Embedding)',
      when: 'Computes in background, may take minutes',
      description: 'Focuses on preserving local neighborhoods - great for finding clusters and structure.',
      bestFor: [
        'Discovering clusters and groups',
        'Revealing local structure',
        'Visualizing high-dimensional data',
        'Pattern recognition'
      ],
      characteristics: 'Emphasizes local relationships. Clusters are meaningful, but distances between clusters are not.',
      speed: 'Slow (seconds to minutes depending on dataset size)',
      parameters: {
        perplexity: 'Balances local vs. global structure (5-50). Higher = more global context.',
        iterations: 'More iterations = better quality, but slower (500-5000)'
      },
      technical: 'Uses gradient descent to minimize KL divergence. Computationally intensive.',
      warnings: [
        'Global structure (distances between clusters) may be misleading',
        'Different runs may produce different results',
        'Can be very slow on large datasets (&gt;10k rows)'
      ]
    },

    umap: {
      name: 'UMAP (Uniform Manifold Approximation and Projection)',
      when: 'Computes in background',
      description: 'Balances both local and global structure - faster than t-SNE with comparable quality.',
      bestFor: [
        'Balancing local and global structure',
        'Preserving more global relationships than t-SNE',
        'Faster results on large datasets',
        'General-purpose visualization'
      ],
      characteristics: 'Maintains both cluster structure AND meaningful distances between clusters.',
      speed: 'Slow (but faster than t-SNE)',
      parameters: {
        neighbors: 'Size of local neighborhood (2-200). Higher = more global structure.',
        minDist: 'Minimum distance between points (0.0-0.99). Lower = tighter clusters.'
      },
      technical: 'Based on Riemannian geometry and topological data analysis.',
      warnings: [
        'Can be memory-intensive for very large datasets',
        'JavaScript version may differ slightly from Python implementation'
      ]
    },

    backgroundProcessing: {
      title: 'How Background Processing Works',
      description: `
        <strong>Immediate Start:</strong> After data cleaning, PCA runs immediately and loads into the dashboard.
        You can start exploring your data right away.<br/><br/>

        <strong>Background Computation:</strong> While you explore the PCA view, other selected projections
        (FastMap, t-SNE, UMAP) compute in the background without blocking your workflow.<br/><br/>

        <strong>Notifications:</strong> When each projection finishes, you'll see a notification with an
        option to switch to that view. The projection is automatically added to the dropdown.<br/><br/>

        <strong>Progress Tracking:</strong> Check the projection status indicator in the top-right corner
        of the dashboard to see which projections are ready, computing, or pending.
      `
    }
  },

  // Projection Parameters
  parameters: {
    tsnePerplexity: `<strong>Perplexity</strong> controls neighborhood size for t-SNE<br/><br/>
      • <strong>Low (5-15):</strong> Focuses on very local clusters, may create many small groups<br/>
      • <strong>Medium (20-40):</strong> Balanced view (recommended for most cases)<br/>
      • <strong>High (40-50):</strong> Emphasizes global structure, fewer larger groups<br/><br/>
      <em>💡 Rule of thumb:</em> Use 30 for datasets with 1,000-10,000 rows`,

    tsneIterations: `<strong>Iterations</strong> - number of optimization steps<br/><br/>
      More iterations = better quality but slower processing<br/><br/>
      • <strong>250-500:</strong> Fast preview, may not fully converge<br/>
      • <strong>1000:</strong> Standard quality (recommended)<br/>
      • <strong>2000+:</strong> High quality for final visualization<br/><br/>
      <em>If the plot still shows movement, try increasing iterations</em>`,

    tsneLearningRate: `<strong>Learning Rate</strong> controls optimization speed<br/><br/>
      200 is a safe default for most datasets<br/><br/>
      • Too low (50-100): Slow convergence, may get stuck<br/>
      • Good (150-300): Balanced optimization<br/>
      • Too high (500+): May miss fine structure<br/><br/>
      <em>💡 If visualization looks compressed, try 100-150. If too spread out, try 300-500</em>`,

    umapNeighbors: `<strong>N Neighbors</strong> controls local vs global structure<br/><br/>
      • <strong>Low (2-10):</strong> Focus on local structure, detailed clusters<br/>
      • <strong>Medium (15-30):</strong> Balanced view (recommended)<br/>
      • <strong>High (50+):</strong> More global structure, smoother layout`,

    umapMinDist: `<strong>Min Distance</strong> controls cluster tightness<br/><br/>
      • <strong>Low (0.0-0.1):</strong> Tight, dense clusters<br/>
      • <strong>Medium (0.1-0.3):</strong> Balanced<br/>
      • <strong>High (0.4-0.99):</strong> Loose, spread out points<br/><br/>
      <em>Lower values emphasize cluster structure</em>`
  },

  // Table Column Headers
  tableHeaders: {
    type: 'Data type detected automatically based on column values.<br/><br/><strong>Numeric:</strong> Numbers<br/><strong>Categorical:</strong> Limited distinct values<br/><strong>Text:</strong> Free-form text',
    missing: 'Percentage of rows with no value in this column.<br/><br/><strong>&gt;50% missing</strong> may indicate poor data quality and could cause issues.',
    unique: 'Number of distinct (different) values in this column.<br/><br/><strong>High uniqueness</strong> in categorical columns can cause performance issues with one-hot encoding.',
    distribution: 'Visual representation of value distribution.<br/><br/><strong>Sparkline:</strong> Shows frequency of top categorical values<br/><strong>Box plot:</strong> Shows numeric quartiles and outliers',
    statistics: 'Summary statistics for numeric columns.<br/><br/>Includes min, max, mean, median, and standard deviation.'
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
      <em>Optional - leave unselected for uniform color across all glyphs</em>`,

    projection: `<strong>What is dimensionality reduction?</strong><br/><br/>
      Your data might have dozens or hundreds of dimensions (columns). Dimensionality reduction creates a 2D visualization that preserves important patterns and relationships.<br/><br/>
      Think of it as creating a meaningful "map" of your multi-dimensional data that you can actually see and explore.`,

    smartDefaults: `<strong>Smart Defaults</strong> are automatically set based on your data types:<br/><br/>
      • <strong>Numeric columns:</strong> Normalized with Min-Max scaling<br/>
      • <strong>Categorical (few values):</strong> One-Hot encoding<br/>
      • <strong>Categorical (many values):</strong> Label encoding<br/>
      • <strong>Text/ID columns:</strong> Excluded from projection<br/><br/>
      <em>You can change any of these if needed</em>`
  }
};
