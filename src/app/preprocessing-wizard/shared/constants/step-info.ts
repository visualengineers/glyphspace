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
    purpose: 'Upload your CSV or Parquet file to begin analyzing and preparing your data for visualization',
  },
  1: {
    title: 'Select Columns',
    purpose:
      'Choose which columns to keep under consideration for the analysis. Deselect ID fields and irrelevant columns.',
  },
  2: {
    title: 'Configure Data & Features',
    purpose:
      'Configure data types, encoding, scaling, outliers, and cleaning for each column. Select a column to view and edit its options.',
  },
  3: {
    title: 'Visualization Settings',
    purpose:
      'Choose which columns feed the projection and pick the projection methods, then configure glyph features and color mapping.',
  },
  4: {
    title: 'Review & Process',
    purpose: 'Review your configuration summary and process the data for visualization.',
  },
};
