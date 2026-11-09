"""
Data Preprocessing Processor for GlyphSpace
Handles CSV profiling, cleaning, and transformation in the browser via Pyodide
"""

import json
from typing import NamedTuple

import pandas as pd
import numpy as np

TOP_VALUES_LIMIT = 10


class OutlierDetection(NamedTuple):
    """Outliers of one column.

    mask: True for outlier rows, aligned with the column's index (missing and
        non-numeric values are never outliers).
    lower, upper: the detection bounds; capping clips outliers to them.
    """
    mask: pd.Series
    lower: float
    upper: float


def find_outliers(values: pd.Series, method: str) -> OutlierDetection:
    """Flag outliers of a raw column with `method` ('iqr_<k>' or 'zscore_<k>').

    Shared by detect_outliers (the count shown in Step 3) and the pipeline
    (preprocessing_processor_config), so the rows the pipeline removes or caps
    are exactly the rows counted in the wizard. IQR flags values outside
    [Q1 - k*IQR, Q3 + k*IQR]; z-score flags |x - mean| / sd > k, with the sample
    standard deviation.
    """
    numeric = pd.to_numeric(values, errors='coerce').dropna()
    # Booleans (a bool column, or True/False objects when values are missing)
    # have no outliers; quantiles of a bool column fail with "numpy boolean subtract".
    if numeric.empty or pd.api.types.infer_dtype(values, skipna=True) == 'boolean':
        return OutlierDetection(pd.Series(False, index=values.index), np.nan, np.nan)

    if method.startswith('iqr'):
        multiplier = float(method.split('_')[1])
        q1 = numeric.quantile(0.25)
        q3 = numeric.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - multiplier * iqr
        upper = q3 + multiplier * iqr
        flagged = (numeric < lower) | (numeric > upper)
    elif method.startswith('zscore'):
        threshold = int(method.split('_')[1])
        mean = numeric.mean()
        sd = numeric.std()
        flagged = np.abs((numeric - mean) / sd) > threshold
        lower = mean - threshold * sd
        upper = mean + threshold * sd
    else:
        raise Exception(f"Unknown outlier detection method: {method}")

    return OutlierDetection(flagged.reindex(values.index, fill_value=False), float(lower), float(upper))


def _is_text_dtype(series):
    """True for object columns and for dedicated string dtypes (pandas 3 infers
    `str` instead of `object` for text columns)."""
    return pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series)


def _epoch_seconds(date_series):
    """Integer seconds since the epoch. Normalises to nanosecond resolution first:
    pandas 3 no longer parses dates to `datetime64[ns]` by default, so a plain
    int64 cast would not be in nanoseconds."""
    return date_series.dt.as_unit('ns').astype('int64') // 10**9


def _top_values(series, n=TOP_VALUES_LIMIT):
    """The n most frequent values as [{'value': str, 'count': int}]."""
    return [
        {'value': str(val), 'count': int(count)}
        for val, count in series.value_counts().head(n).items()
    ]


def detect_data_type(series):
    """Detect the data type of a pandas Series"""
    if series.name and str(series.name).lower() == 'id':
        return 'id'

    # Check for coordinate columns by name (before numeric check, since coordinates are numeric)
    col_name_lower = str(series.name).lower()
    if col_name_lower in ['latitude', 'longitude', 'lat', 'lon', 'lng', 'long']:
        return 'coordinate'

    # Check if numeric
    if pd.api.types.is_numeric_dtype(series):
        # Check if boolean (0/1 only)
        unique_vals = series.dropna().unique()
        if len(unique_vals) <= 2 and set(unique_vals).issubset({0, 1, True, False}):
            return 'boolean'
        return 'numeric'

    # Try parsing as datetime
    if _is_text_dtype(series):
        try:
            sample = series.dropna().head(100)
            parsed = pd.to_datetime(sample, errors='coerce', format='mixed')
            if parsed.notna().sum() / len(sample) > 0.5:
                return 'date'
        except:
            pass

    # Check cardinality for categorical vs text
    unique_count = series.nunique()
    total_count = len(series)

    if unique_count == 1:
        return 'categorical'

    # If average string length is long, treat as text regardless of cardinality
    avg_length = series.dropna().astype(str).str.len().mean()
    if avg_length > 50:
        return 'text'

    if unique_count / total_count < 0.5:  # Less than 50% unique
        return 'categorical'

    return 'text'


def profile_column(series):
    """Generate statistics for a single column"""
    total_count = len(series)
    non_null_count = series.notna().sum()
    missing_count = total_count - non_null_count
    missing_percentage = (missing_count / total_count * 100) if total_count > 0 else 0
    unique_count = series.nunique()

    data_type = detect_data_type(series)

    stats = {
        'name': series.name,
        'dataType': data_type,
        'count': int(non_null_count),
        'missingCount': int(missing_count),
        'missingPercentage': float(missing_percentage),
        'uniqueCount': int(unique_count)
    }

    # Numeric statistics (coordinates are numeric values too)
    if data_type in ['numeric', 'coordinate']:
        numeric_series = pd.to_numeric(series, errors='coerce')
        stats.update({
            'min': float(numeric_series.min()) if not numeric_series.empty else 0,
            'max': float(numeric_series.max()) if not numeric_series.empty else 0,
            'mean': float(numeric_series.mean()) if not numeric_series.empty else 0,
            'median': float(numeric_series.median()) if not numeric_series.empty else 0,
            'q1': float(numeric_series.quantile(0.25)) if not numeric_series.empty else 0,
            'q3': float(numeric_series.quantile(0.75)) if not numeric_series.empty else 0,
            'stdDev': float(numeric_series.std()) if not numeric_series.empty else 0,
            'variance': float(numeric_series.var()) if not numeric_series.empty else 0
        })

        # Simple histogram (50 bins)
        if not numeric_series.empty:
            counts, bin_edges = np.histogram(numeric_series.dropna(), bins=min(50, unique_count))
            stats['histogram'] = {
                'bins': list(range(len(counts))),
                'counts': [float(c) for c in counts],
                'binEdges': [float(e) for e in bin_edges]
            }

    # Date statistics
    elif data_type == 'date':
        date_series = pd.to_datetime(series, errors='coerce').dropna()
        if not date_series.empty:
            # Sort dates for earliest/latest
            sorted_dates = date_series.sort_values()
            stats['sampleValues'] = [str(sorted_dates.iloc[0]), str(sorted_dates.iloc[-1])]
            # Store min/max as epoch milliseconds for JS Date compatibility
            stats['min'] = int(sorted_dates.iloc[0].timestamp() * 1000)
            stats['max'] = int(sorted_dates.iloc[-1].timestamp() * 1000)

            # Create histogram by binning dates into time periods
            # Use 20 bins across the date range
            if len(date_series) > 1:
                # Convert to numeric timestamps for histogram
                timestamps = _epoch_seconds(date_series)
                counts, bin_edges = np.histogram(timestamps, bins=min(20, len(date_series.unique())))

                # Create labels showing date ranges for each bin
                bin_labels = []
                for i in range(len(counts)):
                    start_date = pd.Timestamp(bin_edges[i], unit='s').strftime('%d/%m/%y')
                    end_date = pd.Timestamp(bin_edges[i + 1], unit='s').strftime('%d/%m/%y')
                    bin_labels.append(f"{start_date}–{end_date}")

                stats['histogram'] = {
                    'bins': list(range(len(counts))),
                    'counts': [float(c) for c in counts],
                    'binEdges': [float(e) for e in bin_edges],
                    'labels': bin_labels
                }

    # Boolean statistics (at most two distinct values)
    elif data_type == 'boolean':
        stats['topValues'] = _top_values(series)

    # Categorical statistics
    elif data_type in ['categorical', 'text']:
        # For both categorical and text, show top 10 values for distribution visualization
        stats['topValues'] = _top_values(series)
        # For text, compute average string length
        if data_type == 'text':
            str_lengths = series.dropna().astype(str).str.len()
            stats['mean'] = float(str_lengths.mean()) if not str_lengths.empty else 0

    # Sample values (if not already set)
    if 'sampleValues' not in stats:
        sample_values = series.dropna().unique()[:10]
        stats['sampleValues'] = [str(v) for v in sample_values]

    return stats


def profile_data(file_name):
    """Profile a CSV file and return statistics"""
    try:
        # Note: Parquet files are converted to CSV in the worker before calling this function
        df = pd.read_csv(file_name)

        # Calculate quality score
        total_cells = df.shape[0] * df.shape[1]
        non_null_cells = df.notna().sum().sum()
        quality_score = (non_null_cells / total_cells * 100) if total_cells > 0 else 0

        # Detect duplicates
        duplicate_count = df.duplicated().sum()

        # Profile each column
        columns_stats = []
        for col in df.columns:
            try:
                col_stats = profile_column(df[col])
                columns_stats.append(col_stats)
            except Exception as e:
                print(f"Error profiling column {col}: {str(e)}")
                continue

        # Preview rows (first 10)
        preview_rows = df.head(10).fillna('').to_dict('records')

        profile = {
            'fileName': file_name,
            'fileSize': 0,  # Will be set by the worker
            'totalRows': int(df.shape[0]),
            'totalColumns': int(df.shape[1]),
            'qualityScore': float(quality_score),
            'duplicateCount': int(duplicate_count),
            'columns': columns_stats,
            'previewRows': preview_rows
        }

        return json.dumps(profile)

    except Exception as e:
        raise Exception(f"Failed to profile data: {str(e)}")


def compute_histogram(file_name, column_name, bins=50):
    """Compute histogram for a specific column"""
    try:
        df = pd.read_csv(file_name)

        if column_name not in df.columns:
            raise Exception(f"Column {column_name} not found")

        series = pd.to_numeric(df[column_name], errors='coerce').dropna()

        if series.empty:
            return json.dumps({'bins': [], 'counts': [], 'binEdges': []})

        counts, bin_edges = np.histogram(series, bins=bins)

        histogram = {
            'bins': list(range(len(counts))),
            'counts': [float(c) for c in counts],
            'binEdges': [float(e) for e in bin_edges]
        }

        return json.dumps(histogram)

    except Exception as e:
        raise Exception(f"Failed to compute histogram: {str(e)}")


def detect_outliers(file_name, column_name, method='iqr_1.5'):
    """Detect outliers in a numeric column"""
    try:
        df = pd.read_csv(file_name)

        if column_name not in df.columns:
            raise Exception(f"Column {column_name} not found")

        if pd.to_numeric(df[column_name], errors='coerce').dropna().empty:
            return json.dumps({'outlierIndices': [], 'outlierCount': 0})

        outliers = find_outliers(df[column_name], method).mask
        outlier_indices = outliers[outliers].index.tolist()

        result = {
            'outlierIndices': [int(i) for i in outlier_indices],
            'outlierCount': int(outliers.sum()),
            'method': method
        }

        return json.dumps(result)

    except Exception as e:
        raise Exception(f"Failed to detect outliers: {str(e)}")


def detect_duplicates(file_name, subset_columns=None):
    """Detect duplicate rows in the dataset"""
    try:
        df = pd.read_csv(file_name)

        # If subset_columns is provided, check only those columns
        if subset_columns:
            duplicates = df.duplicated(subset=subset_columns, keep='first')
        else:
            # Check all columns
            duplicates = df.duplicated(keep='first')

        duplicate_indices = df[duplicates].index.tolist()
        duplicate_count = int(duplicates.sum())

        # Get sample of duplicate rows (first 5)
        sample_duplicates = []
        if duplicate_count > 0:
            duplicate_rows = df[duplicates].head(5)
            sample_duplicates = duplicate_rows.fillna('').to_dict('records')

        result = {
            'duplicateCount': duplicate_count,
            'duplicateIndices': [int(i) for i in duplicate_indices],
            'totalRows': int(len(df)),
            'percentage': float((duplicate_count / len(df) * 100)) if len(df) > 0 else 0,
            'sampleDuplicates': sample_duplicates
        }

        return json.dumps(result)

    except Exception as e:
        raise Exception(f"Failed to detect duplicates: {str(e)}")


# Export functions for Pyodide
__all__ = ['profile_data', 'compute_histogram', 'detect_outliers', 'detect_duplicates', 'find_outliers']
