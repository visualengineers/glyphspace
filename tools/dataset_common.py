"""
Dataset file generation for the local CSV import (tools/process.py).

Writes GlyphSpace dataset files named <base>.<ddmmyyyy>.<type>[.<subtype>].json.
plan_features decides the columns of the feature matrix once; the schema labels
and types, the feature and tooltip values and the meta entries all follow it,
so entry i of each file describes the same (encoded) column.
"""

import json
import math
import os
import random
import re
from collections import Counter, defaultdict
from datetime import datetime
from typing import Any, NamedTuple

import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import LabelEncoder

# Columns with at most this many distinct values are treated as categorical.
ENUMERATE_THRESHOLD = 20

# Normalized feature values below this magnitude are written as 0.0.
SMALL_VALUE_THRESHOLD = 1e-3

# Missing coordinates are replaced by random ones within the data range +- this margin.
COORDINATE_BUFFER = 1.0

# Tooltip value of a missing original value (the dashboard shows it as "missing").
MISSING_VALUE_TEXT = ""

# Missing text is encoded as this category of its own.
MISSING_TEXT_CATEGORY = "0"

LONGITUDE_NAMES = {"longitude", "lon", "längengrad"}
LATITUDE_NAMES = {"latitude", "lat", "breitengrad"}

DATASET_FILE_PATTERN = re.compile(
    r"^(?P<base>.+?)\.(?P<time>\d{8})\.(?P<type>\w+)(?:\.(?P<subtype>\w+))?\.json$"
)


class FeatureColumn(NamedTuple):
    """One column of the feature matrix and the imported column it encodes."""

    name: str  # schema label: the source column, or "<source>_<category>" when one-hot encoded
    source: str  # the imported column
    encoding: str  # "number", "date", "label" or "onehot"
    schema_type: str  # "categorical" or "numeric", from the imported values
    category: str | None = None  # the value a one-hot column flags


def current_timestamp() -> str:
    return datetime.now().strftime("%d%m%Y")


def write_json(filename: str, data: Any) -> None:
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def is_enumerate(col: pd.Series) -> bool:
    """True if a column should be treated as categorical."""
    if pd.api.types.is_string_dtype(col):
        return True

    # Mixed object column with strings
    if col.dtype == "object":
        if col.dropna().apply(lambda v: isinstance(v, str)).any():
            return True

    return col.nunique(dropna=True) <= ENUMERATE_THRESHOLD


def add_id_column_if_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Move the (single) id column to the front as "ID", or add one from the row index."""
    id_col = next((col for col in df.columns if col.strip().lower() == "id"), None)

    if id_col:
        # pole position for id_col
        if df.columns[0] != id_col:
            cols = list(df.columns)
            cols.insert(0, cols.pop(cols.index(id_col)))
            df = df[cols]
        if id_col != "ID":
            df = df.rename(columns={id_col: "ID"})
    else:
        df.insert(0, "ID", df.index.astype(str))
    return df


def _filled_text(col: pd.Series) -> pd.Series:
    """A text column as strings, with missing values as MISSING_TEXT_CATEGORY."""
    return col.fillna(MISSING_TEXT_CATEGORY).astype(str)


def plan_features(df: pd.DataFrame, cardinality_threshold: int) -> list[FeatureColumn]:
    """
    The columns of the feature matrix, in order: every column of df but the first
    (ID). Non-numeric columns named like a date or time become timestamps; other
    text columns with at most `cardinality_threshold` distinct values (missing
    counts as one) are one-hot encoded, one column per value, the rest label encoded.
    Plan before generate_features converts the date columns of df.
    """
    columns = []
    for col in df.columns[1:]:
        data = df[col]
        schema_type = "categorical" if is_enumerate(data) else "numeric"
        if pd.api.types.is_numeric_dtype(data):
            columns.append(FeatureColumn(col, col, "number", schema_type))
        elif "date" in col.lower() or "time" in col.lower():
            columns.append(FeatureColumn(col, col, "date", schema_type))
        else:
            categories = sorted(_filled_text(data).unique())
            # LabelEncoder assumes ordinal categories, which is too strong an assumption
            # for low-cardinality columns: one-hot encode those instead.
            if len(categories) <= cardinality_threshold:
                columns.extend(
                    FeatureColumn(f"{col}_{category}", col, "onehot", schema_type, category) for category in categories
                )
            else:
                columns.append(FeatureColumn(col, col, "label", schema_type))

    # Feature columns are looked up by name: two with the same name would misalign the files.
    shared = sorted(name for name, count in Counter(column.name for column in columns).items() if count > 1)
    if shared:
        raise ValueError(f"One-hot encoding would give several feature columns the name {', '.join(shared)}; "
                         f"rename these columns in the CSV file.")
    return columns


def generate_schema(columns: list[FeatureColumn], output_path_base: str, glyph_limit: int) -> str:
    """Write <base>.schema.json with one label and type per feature column (numbered from 1)."""
    indices = [str(i + 1) for i in range(len(columns))]

    schema = {
        "color": indices[0] if indices else None,
        "glyph": indices[:glyph_limit],
        "label": {idx: column.name for idx, column in zip(indices, columns)},
        "types": {idx: column.schema_type for idx, column in zip(indices, columns)},
        "tooltip": indices,
        "variantcontext": {"1": {"description": "standard context", "id": "1"}},
    }

    filename = f"{output_path_base}.schema.json"
    write_json(filename, schema)
    print(f"Schema file written: {filename}")
    return filename


def _convert_date_columns(df: pd.DataFrame, date_cols: list[str]) -> None:
    """Convert the date columns of df to UNIX timestamps, in place; invalid dates become missing."""
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], errors="coerce")  # parse dates, invalid become NaT
        df[col] = df[col].apply(lambda x: x.timestamp() if pd.notnull(x) else None)  # float timestamp


def _encode(df: pd.DataFrame, column: FeatureColumn) -> pd.Series:
    """Numeric encoding of one feature column; missing numbers and dates stay NaN."""
    data = df[column.source]
    if column.encoding == "onehot":
        return (_filled_text(data) == column.category).astype(float)
    if column.encoding == "label":
        return pd.Series(LabelEncoder().fit_transform(_filled_text(data)), index=data.index)
    return data.astype(float)  # a number, or a date converted to its timestamp


def _normalize_features(encoded_df: pd.DataFrame) -> pd.DataFrame:
    """
    Min-max normalize every column to [0, 1] and zero out tiny values. Missing values
    are left out of the range and placed at 0 afterwards (like the wizard's pipeline),
    so they do not squeeze the real values.
    """
    normalized_df = encoded_df.copy()
    for col in normalized_df.columns:
        col_min = normalized_df[col].min()
        col_max = normalized_df[col].max()
        if pd.isna(col_min) or col_max - col_min == 0:
            normalized_df[col] = 0.0
        else:
            normalized_df[col] = (normalized_df[col] - col_min) / (col_max - col_min)

    return normalized_df.mask(normalized_df.abs() < SMALL_VALUE_THRESHOLD, 0.0).fillna(0.0)


def _original_value(df_values: pd.DataFrame, idx: int, column: FeatureColumn) -> str:
    """Original value (as string) behind a feature column; one-hot columns map to "1"/"0",
    or to MISSING_VALUE_TEXT when the value of their source column is missing."""
    value = df_values.iloc[idx, df_values.columns.get_loc(column.source)]
    if column.category is None or value == MISSING_VALUE_TEXT:
        return value
    return "1" if value == column.category else "0"


def _feature_records(
    df: pd.DataFrame, df_values: pd.DataFrame, normalized_df: pd.DataFrame, columns: list[FeatureColumn]
) -> list[dict]:
    records = []
    for idx, row in df.iterrows():
        feature_dict = {str(i + 1): float(normalized_df.iloc[idx, i]) for i in range(len(normalized_df.columns))}
        value_dict = {str(i + 1): _original_value(df_values, idx, column) for i, column in enumerate(columns)}
        records.append({
            "defaultcontext": "1",
            "features": {"1": feature_dict},
            "id": row["ID"],
            "values": value_dict,
        })
    return records


def generate_features(df: pd.DataFrame, columns: list[FeatureColumn], output_path_base: str) -> pd.DataFrame:
    """
    Write <base>.feature.json for the planned columns and return the normalized
    features (with ID column). Converts the date columns of df in place.
    """
    # Original values as strings for "values"; a missing value is MISSING_VALUE_TEXT
    # (astype(str) alone writes "nan", or keeps NaN with pandas 3's str dtype)
    df_values = df.astype(str).mask(df.isna(), MISSING_VALUE_TEXT)

    _convert_date_columns(df, [column.source for column in columns if column.encoding == "date"])
    encoded_df = pd.DataFrame({column.name: _encode(df, column) for column in columns}, index=df.index)
    normalized_df = _normalize_features(encoded_df)

    filename = f"{output_path_base}.feature.json"
    write_json(filename, _feature_records(df, df_values, normalized_df, columns))
    print(f"Feature file written: {filename}")

    features_df = normalized_df.copy()
    features_df.insert(0, "ID", df["ID"])
    return features_df


def _categories(col: pd.Series) -> list[str]:
    """Sorted distinct values of a categorical column (numeric order if possible)."""
    if not is_enumerate(col):
        return []
    unique_vals = col.dropna().unique()
    try:
        return [str(v) for v in sorted(unique_vals, key=lambda x: float(x))]
    except ValueError:
        return sorted([str(v) for v in unique_vals])


def _label_categories(col: pd.Series) -> list[str]:
    """
    Category per LabelEncoder code: the sorted filled text, so missing values keep their
    own code. The filler is shown as "missing" unless the column really contains it.
    """
    real_values = set(col.dropna().astype(str))
    return [
        "missing" if value == MISSING_TEXT_CATEGORY and value not in real_values else value
        for value in sorted(_filled_text(col).unique())
    ]


def _meta_categories(column: FeatureColumn, source: pd.Series) -> list[str]:
    if column.encoding == "onehot":
        return []  # its 0/1 values are not category codes
    if column.encoding == "label":
        return _label_categories(source)
    return _categories(source)


def _column_meta(col_numeric: pd.Series, histogram_bins: int) -> dict:
    counts, _ = np.histogram(col_numeric, bins=histogram_bins, density=True)
    return {
        "histogram": {str(j): float(count) for j, count in enumerate(counts)},
        "max": float(col_numeric.max()),
        "min": float(col_numeric.min()),
        "median": float(col_numeric.median()),
        "variance": float(col_numeric.var(ddof=0)),  # population variance
        "deviation": float(col_numeric.std(ddof=0)),  # population std dev
    }


def generate_meta(
    features_df: pd.DataFrame,
    columns: list[FeatureColumn],
    source_df: pd.DataFrame,
    output_path_base: str,
    histogram_bins: int,
) -> str:
    """
    Write <base>.meta.json with the statistics of each feature column of features_df
    and the categories of its source column in source_df (none for a one-hot column:
    its 0/1 values are not category codes).
    """
    meta_features = {}

    for i, column in enumerate(columns):
        entry = _column_meta(features_df[column.name], histogram_bins)
        categories = _meta_categories(column, source_df[column.source])
        meta_features[str(i + 1)] = {"histogram": entry.pop("histogram"), "categories": categories, **entry}

    filename = f"{output_path_base}.meta.json"
    write_json(filename, {"features": meta_features})
    print(f"Meta file written: {filename}")
    return filename


def _coordinate_or_random(value: Any, value_range: tuple[float, float]) -> float:
    try:
        number = float(value)
    except (ValueError, TypeError):
        number = float("nan")
    if pd.isna(number) or math.isnan(number):
        number = random.uniform(*value_range)
    return number


def generate_epsg_positions(df: pd.DataFrame, output_path_base: str) -> str | None:
    """Write <base>.position.epsg.json from longitude/latitude columns, if present."""
    cols_lower = {col.lower(): col for col in df.columns}
    lon_col = next((cols_lower[name] for name in LONGITUDE_NAMES if name in cols_lower), None)
    lat_col = next((cols_lower[name] for name in LATITUDE_NAMES if name in cols_lower), None)

    if lon_col is None or lat_col is None:
        print("Longitude or latitude columns not found; skipping EPSG position file.")
        return None

    valid_lats = pd.to_numeric(df[lat_col], errors="coerce").dropna()
    valid_lons = pd.to_numeric(df[lon_col], errors="coerce").dropna()
    if valid_lats.empty or valid_lons.empty:
        print("No valid coordinates to infer fallback range from.")
        return None

    lat_range = (valid_lats.min() - COORDINATE_BUFFER, valid_lats.max() + COORDINATE_BUFFER)
    lon_range = (valid_lons.min() - COORDINATE_BUFFER, valid_lons.max() + COORDINATE_BUFFER)

    positions = []
    for _, row in df.iterrows():
        # x before y: keeps the order of the random draws for missing values
        x_val = _coordinate_or_random(row[lon_col], lon_range)
        y_val = _coordinate_or_random(row[lat_col], lat_range)
        positions.append({"id": row["ID"], "position": {"x": x_val, "y": y_val}})

    if not positions:
        print("No valid positions found; skipping EPSG position file.")
        return None

    filename = f"{output_path_base}.position.epsg.json"
    write_json(filename, positions)
    print(f"EPSG position file written: {filename}")
    return filename


def generate_xy_positions(df: pd.DataFrame, output_path_base: str) -> None:
    """
    Search for <prefix>-x / <prefix>-y column pairs (case-insensitive).
    For each pair, output {output_path_base}.position.<prefix>.json
    with id / x / y for all rows that have *both* coordinates numeric.
    """
    cols_lower = {c.lower(): c for c in df.columns}
    prefixes = [name[:-2] for name in cols_lower if name.endswith("-x") and name[:-2] + "-y" in cols_lower]

    if not prefixes:
        print("No '<prefix>-x' / '<prefix>-y' pairs found – skipping.")
        return

    for prefix in prefixes:
        x_col = cols_lower[prefix + "-x"]
        y_col = cols_lower[prefix + "-y"]

        coords = df[["ID", x_col, y_col]].copy()
        coords[[x_col, y_col]] = coords[[x_col, y_col]].apply(lambda s: pd.to_numeric(s, errors="coerce"))
        coords = coords.dropna(subset=[x_col, y_col])  # both coordinates required

        if coords.empty:
            print(f"No valid coordinates for prefix '{prefix}' – file not written.")
            continue

        positions = [
            {"id": row["ID"], "position": {"x": float(row[x_col]), "y": float(row[y_col])}}
            for _, row in coords.iterrows()
        ]
        filename = f"{output_path_base}.position.{prefix}.json"
        write_json(filename, positions)
        print(f"XY position file written: {filename}")


def positions_from_embedding(df: pd.DataFrame, embedding: np.ndarray) -> list[dict]:
    """Pair the rows of df (by position) with the 2-D points of an embedding."""
    return [
        {"id": row["ID"], "position": {"x": float(embedding[idx, 0]), "y": float(embedding[idx, 1])}}
        for idx, row in df.iterrows()
    ]


def _projection_input(features_df: pd.DataFrame) -> pd.DataFrame:
    feature_cols = features_df.columns.difference(["ID"])
    return features_df[feature_cols].fillna(0).astype(float)


def generate_pca_positions(features_df: pd.DataFrame, output_path_base: str) -> str:
    pca_result = PCA(n_components=2).fit_transform(_projection_input(features_df))

    filename = f"{output_path_base}.position.pca.json"
    write_json(filename, positions_from_embedding(features_df, pca_result))
    print(f"PCA positions written: {filename}")
    return filename


def generate_tsne_positions(features_df: pd.DataFrame, output_path_base: str) -> str:
    tsne = TSNE(n_components=2, random_state=42, init="random")
    tsne_result = tsne.fit_transform(_projection_input(features_df))

    filename = f"{output_path_base}.position.tsne.json"
    write_json(filename, positions_from_embedding(features_df, tsne_result))
    print(f"t-SNE positions written: {filename}")
    return filename


def collect_datasets(folder: str, source: str) -> list[dict]:
    """
    Scan folder for dataset files <base>.<timestamp>.<type>[.<subtype>].json
    and group them as [{dataset, source, items: [{algorithms, time}]}].
    """
    grouped = defaultdict(lambda: defaultdict(dict))  # { base: { time: { type/subtype: filename } } }

    for file in os.listdir(folder):
        match = DATASET_FILE_PATTERN.match(file) if file.endswith(".json") else None
        if not match:
            continue

        ftype, subtype = match.group("type"), match.group("subtype")
        algorithms = grouped[match.group("base")][match.group("time")]
        if subtype:
            algorithms.setdefault(ftype, {})[subtype] = file
        else:
            algorithms[ftype] = file

    return [
        {
            "dataset": base,
            "source": source,
            "items": [{"algorithms": algos, "time": time} for time, algos in sorted(time_map.items())],
        }
        for base, time_map in grouped.items()
    ]


def extract_projection_features(df: pd.DataFrame, features_df: pd.DataFrame) -> pd.DataFrame:
    """Features used for projections: everything but ID, <prefix>-x/-y columns and thumb."""
    exclude_pattern = re.compile(r"^.+-(x|y)$|^thumb$")
    feature_cols = [col for col in features_df.columns if col != "ID" and not exclude_pattern.match(col)]

    result = features_df[feature_cols].fillna(0).astype(float)
    result.insert(0, "ID", df["ID"])
    return result
