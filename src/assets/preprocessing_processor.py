"""
Data Preprocessing Processor for GlyphSpace
Handles CSV profiling, cleaning, and transformation in the browser via Pyodide
"""

import json
import math
import re
import warnings
from typing import NamedTuple

import pandas as pd
import numpy as np

TOP_VALUES_LIMIT = 10


# --- Reading the upload and writing JSON for the JS side -----------------------------


def read_csv(file_name) -> pd.DataFrame:
    """Read an uploaded CSV the same way for profiling, analysis and processing.

    The id column (see is_id_column) is read as text, so ids keep their leading
    zeros ("007") and long digit strings (tweet ids) stay exact: pandas would read
    them as numbers, and the item ids, the positions and the image file names
    would no longer match. Every other column is parsed as pandas does.
    """
    header = pd.read_csv(file_name, nrows=0).columns
    return pd.read_csv(file_name, dtype={col: str for col in header if is_id_column(col)})


def to_json(value) -> str:
    """Strict JSON for the JS side, whose JSON.parse rejects the NaN and Infinity
    that json.dumps writes by default: non-finite numbers become null."""
    try:
        return json.dumps(value, allow_nan=False)
    except ValueError:  # a NaN or infinity somewhere; rare, so only then walk the value
        return json.dumps(_finite_json(value), allow_nan=False)


def _finite_json(value):
    """The value with every non-finite float replaced by None."""
    if isinstance(value, (float, np.floating)):
        return float(value) if math.isfinite(value) else None
    if isinstance(value, dict):
        return {key: _finite_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_finite_json(item) for item in value]
    return value


def _finite_items(stats: dict) -> dict:
    """The statistics that are finite numbers. The profile's numeric fields are
    optional, so an undefined statistic (the sd of a single value) is left out."""
    return {key: value for key, value in stats.items() if math.isfinite(value)}


def _finite_numbers(series: pd.Series) -> pd.Series:
    """The column's finite numbers: missing, non-numeric and infinite values left out."""
    numbers = pd.to_numeric(series, errors='coerce').astype('float64')
    return numbers[np.isfinite(numbers)]


# --- Dates -------------------------------------------------------------------------

# A date that starts with its year (ISO 8601 and similar): never day first.
_YEAR_FIRST = re.compile(r'^\s*\d{4}[-/.]')
# A date that starts with its day or month: 1-2 digits, a separator, 1-2 digits, the year.
_DAY_MONTH = re.compile(r'^\s*(\d{1,2})([./-])(\d{1,2})[./-]\d{2,4}')


def parse_dates(values: pd.Series) -> pd.Series:
    """The dates of a column; values that are no date become NaT.

    The one parser for dates: the type detection, the profile, the encoding and
    the meta all use it, so a column detected as dates is encoded as the same
    dates. Values that start with the year are parsed year-month-day. For the
    others, the data decides whether the day comes first (see _day_first): with a
    fixed month-first reading, 13/04/2021 would not parse and 01/04/2021 would be
    the 4th of January. Each group is parsed with one inferred format, and value
    by value only when that leaves some unparsed (a column of mixed formats).
    """
    if pd.api.types.is_datetime64_any_dtype(values):
        return values
    texts = values[values.notna()].astype(str)
    year_first = texts.str.match(_YEAR_FIRST)
    parts = []
    for group, day_first in ((texts[year_first], False), (texts[~year_first], None)):
        if not group.empty:
            parts.append(_parse_dates_as(group, _day_first(group) if day_first is None else day_first))
    if not parts:
        return pd.Series(pd.NaT, index=values.index, dtype='datetime64[ns]')
    if any(isinstance(part.dtype, pd.DatetimeTZDtype) for part in parts):
        parts = [_in_utc(part) for part in parts]
    return pd.concat([part.dt.as_unit('ns') for part in parts]).reindex(values.index)


def _day_first(texts: pd.Series) -> bool:
    """Whether dates like 01/04/2021 put the day first.

    A first number above 12 can only be a day (day first); a second number above
    12 too (month first). When that evidence is even, dates written with dots
    (01.04.2021) are day first; otherwise month first, pandas' default.
    """
    parts = texts.str.extract(_DAY_MONTH).dropna()
    if parts.empty:
        return False
    day_first = int((parts[0].astype(int) > 12).sum())
    month_first = int((parts[2].astype(int) > 12).sum())
    if day_first != month_first:
        return day_first > month_first
    return bool((parts[1] == '.').any())


def _parse_dates_as(texts: pd.Series, day_first: bool) -> pd.Series:
    with warnings.catch_warnings():
        # "Could not infer format": pandas then parses value by value, as wanted.
        warnings.simplefilter('ignore', UserWarning)
        parsed = _to_datetime(texts, day_first, None)
        if parsed.isna().any():
            parsed = _to_datetime(texts, day_first, 'mixed')
    return parsed


def _to_datetime(texts: pd.Series, day_first: bool, date_format) -> pd.Series:
    try:
        return pd.to_datetime(texts, errors='coerce', dayfirst=day_first, format=date_format)
    except ValueError:  # several time zones: pandas needs them converted to one
        return pd.to_datetime(texts, errors='coerce', dayfirst=day_first, format=date_format, utc=True)


def _in_utc(dates: pd.Series) -> pd.Series:
    if isinstance(dates.dtype, pd.DatetimeTZDtype):
        return dates.dt.tz_convert('UTC')
    return dates.dt.tz_localize('UTC')


def epoch_seconds(dates: pd.Series) -> pd.Series:
    """Seconds since the epoch as floats; NaT becomes NaN. Independent of the
    resolution pandas parsed the dates to and of their time zone."""
    return (dates - pd.Timestamp('1970-01-01', tz=dates.dt.tz)) / pd.Timedelta(seconds=1)


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


def _top_values(series, n=TOP_VALUES_LIMIT):
    """The n most frequent values as [{'value': str, 'count': int}]."""
    return [
        {'value': str(val), 'count': int(count)}
        for val, count in series.value_counts().head(n).items()
    ]


def is_id_column(name) -> bool:
    """Whether a column holds the item ids: it is named "id" in any case.

    The same rule as the CLI's add_id_column_if_missing (tools/dataset_common.py).
    """
    return str(name).strip().lower() == 'id'


def detect_data_type(series):
    """Detect the data type of a pandas Series"""
    if series.name is not None and is_id_column(series.name):
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

    # Try parsing as datetime, with the parser the encoding uses
    if _is_text_dtype(series):
        sample = series.dropna().head(100)
        try:
            if not sample.empty and parse_dates(sample).notna().sum() / len(sample) > 0.5:
                return 'date'
        except Exception:
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

    # Numeric statistics (coordinates are numeric values too), over the finite
    # numbers: a column without any has none, and an undefined statistic (the sd
    # of a single value) is left out instead of becoming NaN, which JSON can't hold.
    if data_type in ['numeric', 'coordinate']:
        numbers = _finite_numbers(series)
        if not numbers.empty:
            stats.update(_finite_items({
                'min': float(numbers.min()),
                'max': float(numbers.max()),
                'mean': float(numbers.mean()),
                'median': float(numbers.median()),
                'q1': float(numbers.quantile(0.25)),
                'q3': float(numbers.quantile(0.75)),
                'stdDev': float(numbers.std()),
                'variance': float(numbers.var())
            }))

            # Simple histogram (up to 50 bins)
            counts, bin_edges = np.histogram(numbers, bins=min(50, numbers.nunique()))
            stats['histogram'] = {
                'bins': list(range(len(counts))),
                'counts': [float(c) for c in counts],
                'binEdges': [float(e) for e in bin_edges]
            }

    # Date statistics
    elif data_type == 'date':
        date_series = parse_dates(series).dropna()
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
                timestamps = epoch_seconds(date_series)
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


def _fallback_profile(series: pd.Series, error: Exception) -> dict:
    """The profile of a column whose statistics failed: its counts, typed as text.

    The column is listed all the same. Left out of the profile, the wizard would
    have no settings for it, and processing rejects a column without settings.
    """
    total_count = len(series)
    non_null_count = int(series.notna().sum())
    return {
        'name': series.name,
        'dataType': 'text',
        'count': non_null_count,
        'missingCount': total_count - non_null_count,
        'missingPercentage': float((total_count - non_null_count) / total_count * 100) if total_count else 0.0,
        'uniqueCount': int(series.nunique()),
        'sampleValues': [str(v) for v in series.dropna().unique()[:10]],
        'profileError': str(error),
    }


def _display_rows(rows_df: pd.DataFrame) -> list[dict]:
    """Rows for a table in the wizard (the preview, sample duplicates): missing
    values as "" and infinite numbers as text ("inf"), since JSON has no infinity."""
    # As objects first: filling a number column with text is an error in pandas 4.
    rows = rows_df.astype(object).where(rows_df.notna(), '').to_dict('records')
    return [
        {key: str(value) if isinstance(value, float) and not math.isfinite(value) else value
         for key, value in row.items()}
        for row in rows
    ]


def profile_data(file_name):
    """Profile a CSV file and return statistics"""
    try:
        df = read_csv(file_name)

        # Calculate quality score
        total_cells = df.shape[0] * df.shape[1]
        non_null_cells = df.notna().sum().sum()
        quality_score = (non_null_cells / total_cells * 100) if total_cells > 0 else 0

        # Detect duplicates
        duplicate_count = df.duplicated().sum()

        # Profile each column; every column is listed, also one whose statistics fail
        columns_stats = []
        for col in df.columns:
            try:
                columns_stats.append(profile_column(df[col]))
            except Exception as e:
                print(f"Error profiling column {col}: {str(e)}")
                columns_stats.append(_fallback_profile(df[col], e))

        profile = {
            'fileName': file_name,
            'fileSize': 0,  # Will be set by the worker
            'totalRows': int(df.shape[0]),
            'totalColumns': int(df.shape[1]),
            'qualityScore': float(quality_score),
            'duplicateCount': int(duplicate_count),
            'columns': columns_stats,
            'previewRows': _display_rows(df.head(10))
        }

        return to_json(profile)

    except Exception as e:
        raise Exception(f"Failed to profile data: {str(e)}")


def compute_histogram(file_name, column_name, bins=50):
    """Compute histogram for a specific column"""
    try:
        df = read_csv(file_name)

        if column_name not in df.columns:
            raise Exception(f"Column {column_name} not found")

        series = _finite_numbers(df[column_name])

        if series.empty:
            return to_json({'bins': [], 'counts': [], 'binEdges': []})

        counts, bin_edges = np.histogram(series, bins=bins)

        histogram = {
            'bins': list(range(len(counts))),
            'counts': [float(c) for c in counts],
            'binEdges': [float(e) for e in bin_edges]
        }

        return to_json(histogram)

    except Exception as e:
        raise Exception(f"Failed to compute histogram: {str(e)}")


def detect_outliers(file_name, column_name, method='iqr_1.5'):
    """Detect outliers in a numeric column"""
    try:
        df = read_csv(file_name)

        if column_name not in df.columns:
            raise Exception(f"Column {column_name} not found")

        if pd.to_numeric(df[column_name], errors='coerce').dropna().empty:
            return to_json({'outlierIndices': [], 'outlierCount': 0})

        outliers = find_outliers(df[column_name], method).mask
        outlier_indices = outliers[outliers].index.tolist()

        result = {
            'outlierIndices': [int(i) for i in outlier_indices],
            'outlierCount': int(outliers.sum()),
            'method': method
        }

        return to_json(result)

    except Exception as e:
        raise Exception(f"Failed to detect outliers: {str(e)}")


def detect_duplicates(file_name, subset_columns=None):
    """Detect duplicate rows in the dataset"""
    try:
        df = read_csv(file_name)

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
            sample_duplicates = _display_rows(duplicate_rows)

        result = {
            'duplicateCount': duplicate_count,
            'duplicateIndices': [int(i) for i in duplicate_indices],
            'totalRows': int(len(df)),
            'percentage': float((duplicate_count / len(df) * 100)) if len(df) > 0 else 0,
            'sampleDuplicates': sample_duplicates
        }

        return to_json(result)

    except Exception as e:
        raise Exception(f"Failed to detect duplicates: {str(e)}")


# Export functions for Pyodide
__all__ = ['profile_data', 'compute_histogram', 'detect_outliers', 'detect_duplicates', 'find_outliers',
           'is_id_column', 'read_csv', 'to_json', 'parse_dates', 'epoch_seconds']
