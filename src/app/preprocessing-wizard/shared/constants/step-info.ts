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
    title: 'Configure Data & Features',
    purpose: 'Configure data cleaning, encoding, scaling, and projection settings for each column in a unified table view.'
  },
  3: {
    title: 'Visualization Settings',
    purpose: 'Select color and glyph features, choose projection methods, review your configuration, and process your data.'
  }
};
