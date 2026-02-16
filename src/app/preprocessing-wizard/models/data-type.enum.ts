export enum DataType {
  Numeric = 'numeric',
  Categorical = 'categorical',
  Text = 'text',
  Date = 'date',
  Boolean = 'boolean',
  ID = 'id',
  Coordinate = 'coordinate',
  Unknown = 'unknown',
}

export enum EncodingMethod {
  None = 'none',
  OneHot = 'onehot',
  Label = 'label',
  Normalize = 'normalize',
  Standardize = 'standardize',
}

export enum ScalingMethod {
  None = 'none',
  MinMax = 'minmax',
  Standard = 'standard',
  Robust = 'robust',
}

export enum MissingValueStrategy {
  Keep = 'keep',
  RemoveRows = 'remove_rows',
  FillMean = 'fill_mean',
  FillMedian = 'fill_median',
  FillMode = 'fill_mode',
  FillValue = 'fill_value',
}

export enum OutlierStrategy {
  Keep = 'keep',
  Remove = 'remove',
  Cap = 'cap',
}

export enum OutlierMethod {
  IQR_1_5 = 'iqr_1.5',
  IQR_2_0 = 'iqr_2.0',
  IQR_3_0 = 'iqr_3.0',
  ZScore_2 = 'zscore_2',
  ZScore_3 = 'zscore_3',
  ZScore_4 = 'zscore_4',
}

export function getDataTypeBadgeClass(dataType: DataType | undefined): string {
  return `badge-${dataType}`;
}

export function getDataTypeLabel(dataType: DataType): string {
  const labels: Record<DataType, string> = {
    [DataType.Numeric]: 'Numeric',
    [DataType.Categorical]: 'Categorical',
    [DataType.Text]: 'Text',
    [DataType.Date]: 'Date',
    [DataType.Boolean]: 'Boolean',
    [DataType.ID]: 'ID',
    [DataType.Coordinate]: 'Coordinate',
    [DataType.Unknown]: 'Unknown',
  };
  return labels[dataType] || 'Unknown';
}

export function getEncodingLabel(method: EncodingMethod): string {
  const labels: Record<EncodingMethod, string> = {
    [EncodingMethod.None]: 'None',
    [EncodingMethod.OneHot]: 'One-Hot',
    [EncodingMethod.Label]: 'Label',
    [EncodingMethod.Normalize]: 'Normalize',
    [EncodingMethod.Standardize]: 'Standardize',
  };
  return labels[method] || 'Unknown';
}

export function getScalingLabel(method: ScalingMethod): string {
  const labels: Record<ScalingMethod, string> = {
    [ScalingMethod.None]: 'None',
    [ScalingMethod.Standard]: 'Standard',
    [ScalingMethod.MinMax]: 'Min-Max',
    [ScalingMethod.Robust]: 'Robust',
  };
  return labels[method] || 'Unknown';
}

export function getDataTypeColor(dataType: DataType): string {
  switch (dataType) {
    case DataType.Numeric:
      return '#16A34A';
    case DataType.Categorical:
      return '#7C3AED';
    case DataType.Text:
      return '#8BC34A';
    case DataType.Date:
      return '#EA580C';
    case DataType.Boolean:
      return '#00bcd4';
    case DataType.ID:
      return '#888888';
    default:
      return '#888888';
  }
}
