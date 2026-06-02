import { DataType } from './data-type.enum';

export interface ColumnStatistics {
  name: string;
  dataType: DataType;
  count: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;

  // Numeric statistics
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  q1?: number;
  q3?: number;
  stdDev?: number;
  variance?: number;

  // Categorical statistics
  topValues?: { value: string; count: number }[];

  // Histogram data
  histogram?: HistogramData;

  // Sample values
  sampleValues?: string[];
}

export interface HistogramData {
  bins: number[];
  counts: number[];
  binEdges: number[];
  labels?: string[];
}

export interface DataProfile {
  totalRows: number;
  totalColumns: number;
  fileSize: number;
  fileName: string;
  columns: ColumnStatistics[];
  qualityScore: number;
  duplicateCount: number;
  previewRows: Record<string, unknown>[];
}
