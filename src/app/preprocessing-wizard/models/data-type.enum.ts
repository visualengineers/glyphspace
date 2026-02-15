export enum DataType {
  Numeric = 'numeric',
  Categorical = 'categorical',
  Text = 'text',
  Date = 'date',
  Boolean = 'boolean',
  ID = 'id',
  Coordinate = 'coordinate',
  Unknown = 'unknown'
}

export enum EncodingMethod {
  None = 'none',
  OneHot = 'onehot',
  Label = 'label',
  Normalize = 'normalize',
  Standardize = 'standardize'
}

export enum ScalingMethod {
  None = 'none',
  MinMax = 'minmax',
  Standard = 'standard',
  Robust = 'robust'
}

export enum MissingValueStrategy {
  Keep = 'keep',
  RemoveRows = 'remove_rows',
  FillMean = 'fill_mean',
  FillMedian = 'fill_median',
  FillMode = 'fill_mode',
  FillValue = 'fill_value'
}

export enum OutlierStrategy {
  Keep = 'keep',
  Remove = 'remove',
  Cap = 'cap'
}

export enum OutlierMethod {
  IQR_1_5 = 'iqr_1.5',
  IQR_2_0 = 'iqr_2.0',
  IQR_3_0 = 'iqr_3.0',
  ZScore_2 = 'zscore_2',
  ZScore_3 = 'zscore_3',
  ZScore_4 = 'zscore_4'
}

export function getDataTypeBadgeClass(dataType: DataType | undefined): string {
  return `badge-${dataType}`;
}
