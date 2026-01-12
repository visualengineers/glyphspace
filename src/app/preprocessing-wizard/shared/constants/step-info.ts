/**
 * Step information for preprocessing wizard
 * Provides title and purpose statement for each step
 */

export interface StepInfo {
  title: string;
  purpose: string;
}

export const STEP_INFO: Record<number, StepInfo> = {
  0: {
    title: 'Upload Data',
    purpose: 'Upload your CSV or Parquet file to begin analyzing and preparing your data for visualization'
  },
  1: {
    title: 'Select Columns',
    purpose: 'Choose which columns to include in your visualization. Deselect ID fields and irrelevant columns.'
  },
  2: {
    title: 'Clean Data',
    purpose: 'Remove or fix data quality issues like missing values, outliers, and duplicate rows.'
  },
  3: {
    title: 'Configure Features',
    purpose: 'Configure how data is encoded for visualization and select 5 features for your glyphs.'
  },
  4: {
    title: 'Projection Settings',
    purpose: 'Choose dimensionality reduction methods to create 2D visualizations from your multi-dimensional data.'
  },
  5: {
    title: 'Review & Process',
    purpose: 'Review your configuration and process the data. This creates the final visualization-ready dataset.'
  }
};
