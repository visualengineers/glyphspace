"""
Configuration-based data preprocessing for GlyphSpace
Processes data according to wizard configuration with progress reporting

Processing order (see apply_cleaning and apply_feature_engineering):
  1. missing values are filled per column,
  2. outliers are capped per column (detected on the original values),
  3. rows are dropped: missing values of 'remove_rows' columns, outliers of
     'remove' columns (and, legacy, any missing value with cleaning.removeMissing),
  4. duplicate rows are dropped (cleaning.removeDuplicates),
  5. columns are encoded (one-hot, label, normalize, standardize, dates, booleans),
  6. features are scaled; missing values still left (strategy 'keep') are ignored
     by the scaling and become 0 in the scaled features.
The tooltip values are the original values: "" where the original is missing.
"""

import json
import math
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder

# Shared with Step 3's outlier count. The worker writes preprocessing_processor.py
# to the Pyodide FS when the file is profiled, which precedes every processing run.
from preprocessing_processor import find_outliers

# NOTE: Removed PCA, IncrementalPCA, TSNE imports - now handled by DruidJS in JavaScript
# All dimensionality reduction is done in the browser for better UX

# Feature building progress reporting and chunking
FEATURE_BUILD_CHUNK_SIZE = 5000    # Process and report progress in chunks for better responsiveness

# Tooltip value of a missing original value (the dashboard shows it as "missing").
MISSING_VALUE_TEXT = ''
# Bins of the numeric histograms in the dataset meta.
HISTOGRAM_BINS = 20
# Category labels of a boolean column's codes 0.0 and 1.0 when a code does not occur.
BOOLEAN_LABELS = ('False', 'True')

# Progress callback - will be set by worker
progress_callback = None

def set_progress_callback(callback):
    global progress_callback
    progress_callback = callback

def report_progress(step, progress, message=''):
    """Report progress to worker"""
    if progress_callback:
        progress_callback(step, progress, message)


def process_with_config(file_name, config_json, output_file=None):
    """
    Process CSV file according to wizard configuration
    Returns DatasetCollection JSON or writes to file
    """
    try:
        config = json.loads(config_json) if isinstance(config_json, str) else config_json

        report_progress('Loading data', 5, f'Reading {file_name}')

        # Read CSV
        df = pd.read_csv(file_name)
        # Duplicates are judged on the file's own columns (like Step 3's count):
        # a generated ID is unique per row and would hide every duplicate.
        csv_columns = list(df.columns)

        # Add ID column if missing
        if 'ID' not in df.columns:
            df.insert(0, 'ID', df.index.astype(str))
        else:
            # Ensure ID is first column
            cols = list(df.columns)
            cols.insert(0, cols.pop(cols.index('ID')))
            df = df[cols]

        report_progress('Data loaded', 10, f'{len(df)} rows, {len(df.columns)} columns')

        # Step 1: Data Cleaning
        report_progress('Cleaning data', 15, 'Handling missing values, outliers and duplicates')
        df_cleaned = apply_cleaning(df, config, duplicate_subset=csv_columns)
        if df_cleaned.empty:
            raise Exception(
                "No rows are left after cleaning: the missing-value, outlier and duplicate "
                "settings remove every row. Keep or fill missing values, or keep or cap outliers, "
                "in the configure step."
            )
        removed = len(df) - len(df_cleaned)
        report_progress('Data cleaned', 25, f'{len(df_cleaned):,} rows kept, {removed:,} removed')

        # Step 2: Feature Engineering
        report_progress('Encoding features', 30, 'Converting categorical variables')
        df_processed, feature_names, feature_categories, df_encoded = apply_feature_engineering(df_cleaned, config)
        report_progress('Features encoded', 50, f'{len(feature_names)} features created')

        # Step 3: Compute Projections
        report_progress('Computing PCA', 60, 'Dimensionality reduction')
        projections = compute_projections(df_processed, config)
        report_progress('Projections computed', 80, f'{len(projections)} projection(s) created')

        # Step 4: Build DatasetCollection
        report_progress('Building dataset', 85, 'Creating visualization format')
        # Original (unfilled) values of the rows that survived cleaning, so the
        # tooltip values stay aligned with the processed rows after drops.
        df_original = df.loc[df_cleaned.index]
        dataset = build_dataset_collection(df_original, df_processed, feature_names, feature_categories, projections,
                                           config, df_encoded=df_encoded)
        report_progress('Dataset built', 95, 'Finalizing...')

        if output_file:
            with open(output_file, 'w') as f:
                json.dump(dataset, f)
            report_progress('Complete', 100, 'Processing successful')
            return output_file
        else:
            report_progress('Complete', 100, 'Processing successful')
            return json.dumps(dataset)

    except Exception as e:
        # `from None` suppresses the implicit exception chain: without it, the
        # formatted traceback that reaches the JS side (via Pyodide's PythonError)
        # includes both the original exception's text and this wrapped message,
        # so any offending-column names inside it (K7) get counted/listed twice.
        raise Exception(f"Failed to process data: {str(e)}") from None


# Missing-value strategies that fill nothing. 'keep' leaves missing values to the
# encoding (text becomes a 'missing' category; numbers, dates and booleans stay
# missing through the scaling and become 0 after it); 'remove_rows' drops the
# rows after all fills; the legacy 'drop' (older configs and the default when a
# column has no strategy) only drops them together with cleaning.removeMissing.
_NO_FILL_STRATEGIES = ('keep', 'remove_rows', 'drop')
_BOOLEAN_FILL_TEXT = {'true': True, '1': True, 'false': False, '0': False}


def apply_cleaning(df: pd.DataFrame, config: dict, duplicate_subset: list | None = None) -> pd.DataFrame:
    """Apply data cleaning based on configuration.

    Missing values are filled and outliers capped per column; then the rows of
    'remove_rows' missing values and 'remove' outliers (enabled columns only)
    are dropped, followed by the legacy cleaning.removeMissing and by duplicates.
    The row index is kept, so df.loc[result.index] are the surviving original rows.

    duplicate_subset: the columns that make a row a duplicate (the file's own
    columns); None compares all columns of df.
    """
    df_clean = df.copy()
    cleaning_config = config.get('cleaning', {})
    column_configs = {col['name']: col for col in config.get('columns', [])}
    rows_to_drop = pd.Series(False, index=df.index)

    for col in df_clean.columns:
        if col == 'ID':
            continue
        col_config = column_configs.get(col, {})
        before = df_clean[col]
        column = _fill_missing(before, col_config)
        if col_config.get('enabled', True):
            if col_config.get('missingValueStrategy') == 'remove_rows':
                rows_to_drop = rows_to_drop | column.isna()
            column, outlier_rows = _apply_outlier_strategy(df[col], column, col_config)
            rows_to_drop = rows_to_drop | outlier_rows
        # Assign a changed column back: a chained `df[col].fillna(..., inplace=True)`
        # silently does nothing under pandas Copy-on-Write (the default in pandas 3).
        if column is not before:
            df_clean[col] = column

    if rows_to_drop.any():
        df_clean = df_clean.loc[~rows_to_drop]

    # Legacy: drop rows with any remaining NaN if configured
    if cleaning_config.get('removeMissing', False):
        df_clean = df_clean.dropna()

    if cleaning_config.get('removeDuplicates', False):
        df_clean = _drop_duplicates(df, df_clean, duplicate_subset)

    return df_clean


def _fill_missing(column: pd.Series, col_config: dict) -> pd.Series:
    """The column with its missing values filled according to its strategy."""
    strategy = col_config.get('missingValueStrategy', 'drop')
    if strategy in _NO_FILL_STRATEGIES or not column.isna().any():
        return column
    if strategy == 'fill_mean':
        return column.fillna(column.mean()) if pd.api.types.is_numeric_dtype(column) else column
    if strategy == 'fill_median':
        return column.fillna(column.median()) if pd.api.types.is_numeric_dtype(column) else column
    if strategy == 'fill_mode':
        mode = column.mode()
        return _fill_with(column, mode[0] if not mode.empty else 0)
    if strategy == 'fill_zero':
        return column.fillna(0)
    if strategy == 'fill_value':
        return _fill_with(column, _typed_fill_value(column, col_config.get('missingValueFillValue', 0)))
    raise ValueError(f"Unknown missing-value strategy '{strategy}' for column '{column.name}'")


def _fill_with(column: pd.Series, value) -> pd.Series:
    if isinstance(value, (bool, np.bool_)):
        # Filling an object column of booleans would downcast it (deprecated in pandas 2).
        return column.astype('boolean').fillna(bool(value))
    return column.fillna(value)


def _typed_fill_value(column: pd.Series, value):
    """The fill value converted to the column's type.

    The wizard sends fill values as text; filling a numeric column with a string
    would turn it into a text column (which is then one-hot encoded).
    """
    if pd.api.types.is_numeric_dtype(column):
        try:
            number = float(str(value).strip())
        except ValueError:
            number = math.nan
        if not math.isfinite(number):
            raise ValueError(
                f"Column '{column.name}': the fill value '{value}' is not a number. "
                f"Enter a number or choose another missing-value strategy."
            )
        return number
    # True/False with missing values is read as an object column of booleans.
    if pd.api.types.infer_dtype(column, skipna=True) == 'boolean':
        flag = _BOOLEAN_FILL_TEXT.get(str(value).strip().lower())
        if flag is None:
            raise ValueError(
                f"Column '{column.name}': the fill value '{value}' is not true or false. "
                f"Enter true or false or choose another missing-value strategy."
            )
        return flag
    return value


def _apply_outlier_strategy(original: pd.Series, cleaned: pd.Series,
                            col_config: dict) -> tuple[pd.Series, pd.Series]:
    """Apply the column's outlier strategy; returns (column, rows to drop).

    Outliers are flagged on the original values by find_outliers, the function
    behind Step 3's outlier count, so exactly the counted rows are removed or
    capped (values filled in for missing ones are never flagged). 'cap' clips the
    flagged values to the detection bounds; 'remove' marks their rows for dropping.
    """
    strategy = col_config.get('outlierStrategy', 'keep')
    no_rows = pd.Series(False, index=cleaned.index)
    if strategy == 'keep':
        return cleaned, no_rows
    if strategy not in ('remove', 'cap'):
        raise ValueError(f"Unknown outlier strategy '{strategy}' for column '{cleaned.name}'")

    outliers = find_outliers(original, col_config.get('outlierMethod', 'iqr_1.5'))
    if strategy == 'remove':
        return cleaned, outliers.mask
    if not outliers.mask.any():
        return cleaned, no_rows
    if not pd.api.types.is_numeric_dtype(cleaned):
        raise ValueError(f"Column '{cleaned.name}': outliers can only be capped in a numeric column")
    values = cleaned.astype('float64')
    return values.where(~outliers.mask, values.clip(outliers.lower, outliers.upper)), no_rows


def _drop_duplicates(df_original: pd.DataFrame, df_clean: pd.DataFrame, subset: list | None) -> pd.DataFrame:
    """Drop duplicate rows, keeping the first. With a subset, rows are compared on
    their original values in those columns, like Step 3's duplicate count, so
    filled or capped values cannot turn distinct rows into duplicates."""
    if subset is None:
        return df_clean.drop_duplicates()
    duplicated = df_original.loc[df_clean.index, subset].duplicated()
    return df_clean.loc[~duplicated]


def _resolve_base_col(col, column_configs):
    """Resolve a feature column name to its base column config.
    Tries exact match first, then prefix match for one-hot encoded columns (e.g. city_NYC → city)."""
    if col in column_configs:
        return col
    for name in column_configs:
        if col.startswith(name + '_'):
            return name
    return None


def apply_feature_engineering(df, config):
    """Apply encoding and scaling based on configuration

    Missing values that no strategy filled stay NaN through the encoding of numbers,
    dates and booleans, so the scaling ignores them, and become 0 in the scaled
    features (text gets a 'missing' category instead).

    Returns:
        tuple: (scaled_df, feature_names, feature_categories, encoded_df)
            - scaled_df: DataFrame with encoded and scaled features (no NaN)
            - feature_names: List of feature column names
            - feature_categories: Dict mapping feature name -> list of category labels, indexed by code
              (label-encoded and boolean features)
            - encoded_df: the encoded features before scaling (category codes stay integers,
              missing values stay NaN)
    """
    column_configs = {col['name']: col for col in config.get('columns', [])}

    # Separate ID and feature columns
    id_col = df['ID']
    feature_cols = [col for col in df.columns if col != 'ID']
    enabled_cols = [col for col in feature_cols if column_configs.get(col, {}).get('enabled', True)]

    # Guard against the one-hot explosion (wizard error class K7): a text column
    # that is near-unique (an ID, title, name or free-text field) would expand
    # into one feature column per distinct value and exhaust the browser's
    # (Pyodide) memory. Detect these up front and fail fast with a clear,
    # actionable message naming every offending column, instead of an opaque
    # numpy MemoryError deep inside pandas.concat.
    MAX_ONEHOT_UNIQUE = 500
    onehot_offenders = []
    for col in enabled_cols:
        col_config = column_configs.get(col, {})
        encoding = col_config.get('encoding', 'none')
        data_type = col_config.get('dataType', 'unknown')
        col_data = df[col]
        is_onehot = encoding == 'onehot' or (
            encoding == 'none'
            and data_type not in ('date', 'boolean')
            and not pd.api.types.is_numeric_dtype(col_data)
        )
        if is_onehot:
            n_unique = col_data.fillna('missing').astype(str).nunique()
            if n_unique > MAX_ONEHOT_UNIQUE:
                onehot_offenders.append((col, n_unique))
    if onehot_offenders:
        listed = ", ".join(f"'{name}' ({n} distinct values)" for name, n in onehot_offenders)
        raise Exception(
            f"These columns have too many distinct values to one-hot encode: {listed}. "
            f"Each would expand into that many feature columns, which exceeds the in-browser memory. "
            f"Deselect them in the column step, or switch their encoding to label."
        )

    # PHASE 1: Encoding - collect all encoded columns in a list
    encoded_dfs = []
    feature_names = []
    feature_categories = {}  # Track categories for label-encoded features

    for col in enabled_cols:
        col_config = column_configs.get(col, {})
        encoding = col_config.get('encoding', 'none')
        data_type = col_config.get('dataType', 'unknown')
        col_data = df[col]

        # Date columns: convert to numeric timestamps regardless of encoding setting
        if data_type == 'date':
            date_series = pd.to_datetime(col_data, errors='coerce')
            # Replace NaT before int64 conversion (NaT becomes -9223372036854775808)
            mask = date_series.isna()
            date_series = date_series.fillna(pd.Timestamp('1970-01-01'))
            # seconds since epoch; as_unit('ns') because pandas 3 infers a coarser resolution
            col_numeric = date_series.dt.as_unit('ns').astype('int64').astype(float) / 10**9
            # Missing dates stay missing (not 1970-01-01), so they do not stretch the scaling
            col_numeric = col_numeric.mask(mask).rename(col)
            encoded_dfs.append(col_numeric.to_frame())
            feature_names.append(col)

        # Boolean columns: 0.0 = False, 1.0 = True; missing values stay missing
        elif data_type == 'boolean' or col_data.dtype == 'bool' or col_data.dtype == 'boolean':
            col_numeric = col_data.astype(float)
            encoded_dfs.append(col_numeric.to_frame())
            feature_names.append(col)
            # Store boolean categories so sidebar shows names instead of 0/1
            feature_categories[col] = _boolean_categories(col_data, col_numeric)

        # One-hot encoding
        elif encoding == 'onehot' or (encoding == 'none' and not pd.api.types.is_numeric_dtype(col_data)):
            col_data_filled = col_data.fillna('missing').astype(str)
            dummies = pd.get_dummies(col_data_filled, prefix=col)
            encoded_dfs.append(dummies.astype(float))
            feature_names.extend(dummies.columns.tolist())

        # Label encoding
        elif encoding == 'label':
            col_data_filled = col_data.fillna('missing').astype(str)
            le = LabelEncoder()
            # Keep the row index: after dropped rows (removeMissing/removeDuplicates) a
            # fresh RangeIndex would misalign in the concat below.
            encoded_series = pd.Series(le.fit_transform(col_data_filled).astype(float), name=col, index=col_data.index)
            encoded_dfs.append(encoded_series.to_frame())
            feature_names.append(col)
            # Store the category labels (sorted alphabetically by LabelEncoder)
            feature_categories[col] = le.classes_.tolist()

        # Numeric rescaling chosen as the column's encoding (missing values stay missing)
        elif encoding in ('normalize', 'standardize'):
            col_numeric = _rescale(pd.to_numeric(col_data, errors='coerce'), encoding)
            encoded_dfs.append(col_numeric.to_frame())
            feature_names.append(col)

        else:
            # Numeric (no encoding or already numeric); missing values stay missing
            col_numeric = pd.to_numeric(col_data, errors='coerce')
            encoded_dfs.append(col_numeric.to_frame())
            feature_names.append(col)

    # Single concat at the end
    encoded_df = pd.concat(encoded_dfs, axis=1)

    # PHASE 2: Scaling - batch by scaling method
    scaling_groups = {}
    for col in encoded_df.columns:
        base = _resolve_base_col(col, column_configs)
        col_config = column_configs.get(base, {}) if base else {}
        scaling = col_config.get('scaling', 'none')

        if scaling not in scaling_groups:
            scaling_groups[scaling] = []
        scaling_groups[scaling].append(col)

    # Apply scaling in batches
    scaled_dfs = [_scale(encoded_df[cols], scaling) for scaling, cols in scaling_groups.items()]

    # Combine all scaled data
    scaled_df = pd.concat(scaled_dfs, axis=1)

    # Preserve original column order; missing values become 0 in the scaled space
    scaled_df = scaled_df[feature_names].fillna(0.0)

    # Add ID back
    scaled_df.insert(0, 'ID', id_col.values)

    return scaled_df, feature_names, feature_categories, encoded_df


def _rescale(values: pd.Series, encoding: str) -> pd.Series:
    """'normalize': min-max to [0, 1]; 'standardize': z-score with the sample
    standard deviation (the sd shown in Step 3). Statistics ignore missing values,
    which stay NaN; a constant column (range or sd 0) becomes all 0."""
    if encoding == 'normalize':
        offset, spread = values.min(), values.max() - values.min()
    else:
        offset, spread = values.mean(), values.std()
    if pd.isna(spread) or spread == 0:
        return (values - offset) * 0.0
    return (values - offset) / spread


_SCALERS = {'standard': StandardScaler, 'minmax': MinMaxScaler, 'robust': RobustScaler}


def _scale(features: pd.DataFrame, scaling: str) -> pd.DataFrame:
    """The features scaled column by column. Missing values (NaN) are ignored by
    the fit and stay NaN; a constant column becomes 0.

    'normalize' is min-max to [0, 1], like 'minmax' (older configs).
    """
    if scaling == 'none':
        return features
    if scaling == 'normalize':
        col_min = features.min()
        col_range = features.max() - col_min
        return (features - col_min) / col_range.mask(col_range == 0, 1)
    if scaling not in _SCALERS:
        raise ValueError(f"Unknown scaling '{scaling}' for columns {', '.join(map(str, features.columns))}")
    # A column without any value has nothing to fit (the scalers warn about all-NaN
    # columns): 0 is where its missing values end up anyway.
    empty = features.columns[features.isna().all()]
    features = features.fillna({col: 0.0 for col in empty})
    scaled = _SCALERS[scaling]().fit_transform(features)
    return pd.DataFrame(scaled, columns=features.columns, index=features.index)


def _boolean_categories(values: pd.Series, codes: pd.Series) -> list[str]:
    """The category labels of a boolean column, indexed by code: [label of 0.0, label of 1.0].

    Each label is the column's own value behind the code ('False'/'True', or
    '0'/'1' for a 0/1 column); a code that does not occur gets BOOLEAN_LABELS.
    """
    labels = []
    for code, default in enumerate(BOOLEAN_LABELS):
        present = values[codes == code]
        labels.append(str(present.iloc[0]) if not present.empty else default)
    return labels


def compute_projections(df, config):
    """
    Compute dimensionality reduction projections with adaptive parameters

    Adaptive Optimizations:
    - IncrementalPCA: Used for datasets > 10,000 rows (memory efficient)
    - t-SNE Perplexity: Auto-adjusted - min(user_config, n_samples/3, 50)
    - t-SNE Iterations: Scaled down for larger datasets (25-100% of config)
    - t-SNE Hard Limit: 2,000 rows maximum (automatically skipped beyond)

    Progress Reporting:
    - Each method reports at 5-10% increments (55%, 60%, 65%, 75%)
    - Clear messages show dataset size and adaptive parameters used

    Args:
        df: Processed DataFrame with encoded/scaled features
        config: Configuration dict with 'projections' key

    Returns:
        List of projection dicts: [{'name': str, 'data': [...]}]
    """
    proj_config = config.get('projections', {})
    column_configs = {col['name']: col for col in config.get('columns', [])}

    # Get feature columns (exclude ID)
    feature_cols = [col for col in df.columns if col != 'ID']

    # Filter to columns marked for projection
    projection_cols = [
        col for col in feature_cols
        if column_configs.get(_resolve_base_col(col, column_configs) or col, {}).get('includeInProjection', True)
    ]

    if not projection_cols:
        projection_cols = feature_cols

    X = df[projection_cols].values
    id_values = df['ID'].values  # Vectorized ID extraction

    # Verify feature scaling for PCA (diagnostic)
    x_min, x_max = float(X.min()), float(X.max())
    x_mean, x_std = float(X.mean()), float(X.std())
    print(f'[PCA Input] Features: {X.shape[1]}, Range: [{x_min:.3f}, {x_max:.3f}], Mean: {x_mean:.3f}, Std: {x_std:.3f}')

    # =======================================================================
    # ALL PROJECTION CODE REMOVED - Now handled by DruidJS in JavaScript
    # =======================================================================
    #
    # This function now ONLY exports processed features to CSV for JavaScript
    # DruidJS will compute IsoMap, PCA, t-SNE, and UMAP in the browser
    #
    # Benefits:
    # - IsoMap loads immediately (non-linear manifold learning)
    # - Background projections don't freeze UI
    # - UMAP now works (not limited by Pyodide)
    # - Simpler Python code (just data cleaning/encoding)
    # =======================================================================

    n_samples = len(X)
    n_features = X.shape[1]

    # Export processed features to CSV for JavaScript projections
    report_progress('Exporting features for JavaScript projections', 60,
                   f'Preparing {n_features} features, {n_samples:,} rows for DruidJS')

    # Create DataFrame with ID column + all feature columns
    feature_df = pd.DataFrame(X, columns=projection_cols)
    feature_df.insert(0, 'ID', id_values)

    # Write to CSV in Pyodide virtual filesystem
    # JavaScript will read this file via worker communication
    feature_df.to_csv('processed_features.csv', index=False)

    report_progress('Features exported', 70,
                   f'Ready for JavaScript projections: {n_features} dims, {n_samples:,} rows')

    # Return empty projections list - projections will be computed in JavaScript
    # and added to the dataset after it's loaded into the dashboard
    return []


def _value_histogram(values: np.ndarray, value_range: tuple[float, float]) -> dict[str, float]:
    """Density histogram of a numeric feature's (known) values in HISTOGRAM_BINS bins.

    The bins span value_range, the feature's full range: the dashboard reads bin n
    as the n-th of HISTOGRAM_BINS equal parts of the [0, 1]-normalized feature.
    """
    if values.size == 0:
        return {str(j): 0.0 for j in range(HISTOGRAM_BINS)}
    # cast to float to handle boolean columns
    counts, _ = np.histogram(values.astype(float), bins=HISTOGRAM_BINS, range=value_range, density=True)
    return {str(j): float(count) for j, count in enumerate(counts)}


def build_dataset_collection(df_original, df_processed, feature_names, feature_categories, projections, config,
                             df_encoded=None):
    """Build DatasetCollection format from processed data with optimized performance

    Args:
        df_original: Original DataFrame before encoding
        df_processed: Processed DataFrame with encoded/scaled features
        feature_names: List of feature column names
        feature_categories: Dict mapping feature name -> list of category labels (for label-encoded features)
        projections: List of projection dicts
        config: Configuration dict
        df_encoded: Encoded features before scaling, for the category histograms
            (scaled category codes are negative or fractional) and to leave missing
            values (NaN there, 0 in df_processed) out of all histograms; defaults to df_processed
    """
    category_codes = df_encoded if df_encoded is not None else df_processed

    # Build column config lookup from config dict
    column_configs = {col['name']: col for col in config.get('columns', [])}

    # Extract all needed data as numpy arrays (vectorized)
    id_values = df_processed['ID'].values
    feature_values = df_processed[feature_names].values  # 2D array

    # Normalize all features to [0,1] for glyph rendering
    feat_min = feature_values.min(axis=0)
    feat_max = feature_values.max(axis=0)
    feat_range = feat_max - feat_min
    feat_range[feat_range == 0] = 1  # Avoid division by zero for constant columns
    normalized_features = (feature_values - feat_min) / feat_range

    # Pre-extract original column values for O(1) access (avoids slow pandas iloc)
    # This optimization provides 40-50% speedup for large datasets
    original_values_cache = {}
    base_col_list = []  # Pre-built list of base columns for each feature (array indexing)
    use_cache = []  # Boolean array indicating if we should use cache for this feature

    for col in feature_names:
        base_col = _resolve_base_col(col, column_configs) or col
        base_col_list.append(base_col)

        if base_col in df_original.columns:
            if base_col not in original_values_cache:
                # Cache the entire column as numpy array for O(1) access
                original_values_cache[base_col] = df_original[base_col].values
            use_cache.append(True)
        else:
            use_cache.append(False)

    # Build features list with optimized vectorized lookups and progress reporting
    features_list = []
    n_rows = len(df_processed)
    last_progress = 85
    n_features = len(feature_names)

    # Process in chunks for better progress reporting and responsiveness
    for idx in range(n_rows):
        # Always convert ID to string for consistency across the system
        row_id = str(id_values[idx])

        # Feature values (min-max normalized to [0,1]) for glyph rendering
        feature_dict = {str(i + 1): float(normalized_features[idx, i]) for i in range(n_features)}

        # Build value_dict - optimized with pre-built arrays
        value_dict = {}
        for i in range(n_features):
            if use_cache[i]:
                # Fast O(1) numpy array access - direct column from original data
                orig_val = original_values_cache[base_col_list[i]][idx]
                value_dict[str(i + 1)] = str(orig_val) if pd.notna(orig_val) else MISSING_VALUE_TEXT
            else:
                # Fallback for derived columns
                value_dict[str(i + 1)] = str(feature_values[idx, i])

        features_list.append({
            'id': row_id,
            'defaultcontext': '1',
            'features': {'1': feature_dict},
            'values': value_dict
        })

        # Progress reporting every FEATURE_BUILD_CHUNK_SIZE rows for better UX
        if (idx + 1) % FEATURE_BUILD_CHUNK_SIZE == 0:
            # Progress scales from 85% to 93% (8% total for feature building)
            progress = 85 + int(((idx + 1) / n_rows) * 8)
            if progress > last_progress:
                report_progress('Building dataset', progress,
                    f'Processing features: {idx + 1:,} / {n_rows:,} rows')
                last_progress = progress

    # Final progress update before metadata
    report_progress('Building dataset', 93, 'Computing metadata statistics')

    # Find color feature from user configuration
    # First, find which column is marked as color feature
    color_feature_name = None
    for col_name, col_config in column_configs.items():
        if col_config.get('isColorFeature', False):
            color_feature_name = col_name
            break

    # Then find its index in feature_names
    color_feature_idx = None
    if color_feature_name:
        for i, col in enumerate(feature_names):
            base_col = _resolve_base_col(col, column_configs) or col
            if base_col == color_feature_name:
                color_feature_idx = i + 1
                break

    # Build labels - simple mapping since label encoding is default (no one-hot explosion)
    improved_labels = {str(i + 1): col for i, col in enumerate(feature_names)}

    # Build glyph feature mapping from user selection
    user_glyph_features = config.get('glyphFeatures', [])
    glyph_feature_ids = []

    if user_glyph_features and 3 <= len(user_glyph_features) <= 12:
        # Map user-selected feature names to feature IDs (supports 3-12 features)
        for feature_name in user_glyph_features:
            try:
                # Find index in feature_names array (0-indexed)
                idx = feature_names.index(feature_name)
                # Schema uses 1-indexed IDs
                glyph_feature_ids.append(str(idx + 1))
            except ValueError:
                print(f'[WARNING] Glyph feature not found: {feature_name}')

        # Only pad if we have fewer than minimum (3)
        while len(glyph_feature_ids) < 3:
            glyph_feature_ids.append('1')  # Use first feature as fallback

        # Ensure we don't exceed maximum (12)
        glyph_feature_ids = glyph_feature_ids[:12]
    else:
        # Fallback: use first 5 features as default
        glyph_feature_ids = [str(i + 1) for i in range(min(5, len(feature_names)))]

    # Build tooltip array
    user_tooltip_features = config.get('tooltipFeatures', None)

    if user_tooltip_features:
        # Use user-defined tooltip features
        tooltip_features = []
        for feature_name in user_tooltip_features:
            try:
                idx = feature_names.index(feature_name)
                tooltip_features.append(str(idx + 1))
            except ValueError:
                print(f'[WARNING] Tooltip feature not found: {feature_name}')
    else:
        # Default: include all features (simplified - no one-hot duplicates with label encoding)
        tooltip_features = [str(i + 1) for i in range(len(feature_names))]

    # Get color scale mode from config (auto-detected in wizard)
    color_scale_mode = config.get('colorScaleMode', 'continuous')
    # Convert to boolean for compatibility: true = continuous (rangeColor), false = categorical (categoryColor)
    color_range_boolean = (color_scale_mode == 'continuous')
    # Get specific color scale ID (user-selected in wizard)
    color_scale_id = config.get('colorScaleId', None)

    # Build types mapping (feature ID -> original data type)
    feature_types = {}
    for i, col in enumerate(feature_names):
        base_col = _resolve_base_col(col, column_configs) or col
        col_config = column_configs.get(base_col, {})
        # Get original data type (before encoding/processing)
        original_type = col_config.get('dataType', 'unknown')

        # Map to schema-friendly type names
        type_map = {
            'numeric': 'numeric',
            'categorical': 'categorical',
            'text': 'text',
            'date': 'date',
            'time': 'date',  # Map time to date
            'boolean': 'boolean',
            'id': 'id',
            'coordinate': 'coordinate'
        }
        feature_types[str(i + 1)] = type_map.get(original_type, 'unknown')

    schema = {
        'color': str(color_feature_idx) if color_feature_idx else ('1' if feature_names else None),
        'glyph': glyph_feature_ids,  # User-defined or fallback to first 5
        'label': improved_labels,
        'tooltip': tooltip_features,  # User-defined or default
        'colorRange': color_range_boolean,  # Auto-detected color scale mode
        'colorScaleId': color_scale_id,  # Specific color scale ID selected by user
        'types': feature_types,  # NEW: Original data types for each feature
        'variantcontext': {
            '1': {
                'id': '1',
                'description': 'default context'
            }
        }
    }

    # Build meta - VECTORIZED statistics
    feature_data = df_processed[feature_names].values  # 2D array

    meta_features = {}
    for i, col in enumerate(feature_names):
        col_values = feature_data[:, i]  # Extract column as vector

        # Vectorized statistics
        col_min = float(np.min(col_values))
        col_max = float(np.max(col_values))
        col_median = float(np.median(col_values))
        col_variance = float(np.var(col_values))
        col_std = float(np.std(col_values))

        # Determine feature type and categories
        base_col = _resolve_base_col(col, column_configs) or col
        feature_type = feature_types.get(str(i + 1), 'numeric')
        categories = feature_categories.get(col, [])

        # Compute original min/max from pre-encoding data for human-readable tooltips
        original_min = col_min
        original_max = col_max
        if base_col in df_original.columns:
            orig_series = df_original[base_col]
            if pd.api.types.is_numeric_dtype(orig_series):
                orig_clean = orig_series.dropna()
                if len(orig_clean) > 0:
                    original_min = float(orig_clean.min())
                    original_max = float(orig_clean.max())
            elif feature_type == 'date':
                try:
                    date_series = pd.to_datetime(orig_series, errors='coerce', format='mixed').dropna()
                    if len(date_series) > 0:
                        # Store as epoch seconds for JS date formatting
                        original_min = float(date_series.min().timestamp())
                        original_max = float(date_series.max().timestamp())
                except Exception:
                    pass

        # Build histogram - different approach for categorical vs numeric.
        # Rows whose value is missing (a 0 placed by the pipeline) are not counted.
        known = category_codes[col].notna().to_numpy()
        if feature_type in ('categorical', 'boolean', 'text') and len(categories) > 0:
            # For categorical: one bin per category, count occurrences
            num_categories = len(categories)
            # Unscaled codes are integers 0 to num_categories-1 (booleans: always 2 categories)
            codes = category_codes[col].to_numpy()[known]
            counts = np.bincount(codes.astype(int), minlength=num_categories)
            # Normalize to density (proportions)
            total = counts.sum()
            histogram = {str(j): float(counts[j] / total) if total > 0 else 0.0 for j in range(num_categories)}
        else:
            histogram = _value_histogram(col_values[known], (col_min, col_max))

        meta_features[str(i + 1)] = {
            'type': feature_type,
            'histogram': histogram,
            'categories': categories,  # Empty list for numeric features
            'min': col_min,
            'max': col_max,
            'originalMin': original_min,
            'originalMax': original_max,
            'median': col_median,
            'variance': col_variance,
            'deviation': col_std
        }

    meta = {'features': meta_features}

    # Build positions from projections
    positions = {}
    for proj in projections:
        positions[proj['name']] = [
            {'id': p['id'], 'position': {'x': p['x'], 'y': p['y']}}
            for p in proj['data']
        ]

    # Build dataset collection
    dataset_name = config.get('datasetName', 'dataset')
    timestamp = config.get('timestamp', '00000000')

    dataset_collection = {
        'datasets': {
            f'{dataset_name}.{timestamp}': {
                'name': dataset_name,
                'features': features_list,
                'schema': schema,
                'meta': meta,
                'positions': positions
            }
        },
        'selectedDataset': f'{dataset_name}.{timestamp}'
    }

    return dataset_collection


# Export functions
__all__ = ['process_with_config', 'set_progress_callback']
