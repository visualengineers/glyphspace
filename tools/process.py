import sys
import re
import umap
import os
import math
import random
from sklearn.manifold import TSNE
import json
import pandas as pd
from pandas.api.types import is_numeric_dtype
from pandas.api.types import is_string_dtype
import numpy as np
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from sklearn.decomposition import PCA
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler

datafolder = "./src/assets/data/"
datasetcollection = "./src/default-dataset.ts"

ENUMERATE_THRESHOLD = 20

def is_enumerate(col):
    if pd.api.types.is_string_dtype(col):
        return True

    # Mixed object column with strings
    if col.dtype == "object":
        if col.dropna().apply(lambda v: isinstance(v, str)).any():
            return True

    return col.nunique(dropna=True) <= ENUMERATE_THRESHOLD

def current_timestamp():
    return datetime.now().strftime("%d%m%Y")

def add_id_column_if_missing(df):
    # only one id column allowed, hence the next(..., None)
    id_col = next((col for col in df.columns if col.strip().lower() == "id"), None)

    if id_col:
        # pole position for id_col
        if df.columns[0] != id_col:
            cols = list(df.columns)
            cols.insert(0, cols.pop(cols.index(id_col)))
            df = df[cols]
        # rename
        if id_col != "ID":
            df.rename(columns={id_col: "ID"}, inplace=True)
    else:
        # add
        df.insert(0, "ID", df.index.astype(str))
    return df

def discover_datasets() -> str:
    """
    Scans FS for all dataset files matching pattern:
    <base>.<timestamp>.<type>[.<subtype>].json
    Groups them and returns a nested JSON summary.
    """
    pattern = re.compile(
        r"^(?P<base>.+?)\.(?P<time>\d{8})\.(?P<type>\w+)(?:\.(?P<subtype>\w+))?\.json$"
    )

    grouped = defaultdict(lambda: defaultdict(dict))  # { base: { time: { type/subtype: filename } } }

    for file in os.listdir(datafolder):
        if not file.endswith(".json"):
            continue

        match = pattern.match(file)
        if not match:
            continue

        base = match.group("base")
        time = match.group("time")
        ftype = match.group("type")
        subtype = match.group("subtype")

        if subtype:
            grouped[base][time].setdefault(ftype, {})[subtype] = file
        else:
            grouped[base][time][ftype] = file

    # Now assemble the final JSON structure
    result = []
    for base, time_map in grouped.items():
        items = []
        for time, algos in sorted(time_map.items()):
            items.append({
                "algorithms": algos,
                "time": time
            })

        result.append({
            "dataset": base,
            "source": "local",
            "items": items
        })

    filename = datasetcollection
    with open(filename, 'w', encoding='utf-8') as f:
        f.write('import { DatasetCollection } from "./app/shared/interfaces/dataset-collection";\n\n')
        f.write('export const DEFAULT_DATASETCOLLECTION: DatasetCollection = ')
        json.dump(result, f, indent=4)

    return json.dumps(result, indent=4)

def generate_schema(df, output_path_base):
    # Drop ID column (assumed to be the first)
    feature_columns = df.columns[1:]
    column_indices = list(range(1, len(feature_columns) + 1))  # Start at 1
    types = {}
    for idx, col in zip(column_indices, feature_columns):
        if is_enumerate(df[col]):
            types[str(idx)] = "categorical"
        else:
            types[str(idx)] = "numeric"

    schema = {
        "color": str(column_indices[0]) if column_indices else None,
        "glyph": [str(i) for i in column_indices[:5]],
        "label": {str(i): name for i, name in zip(column_indices, feature_columns)},
        "types": types,
        "tooltip": [str(i) for i in column_indices],
        "variantcontext": {
            "1": {
                "description": "standard context",
                "id": "1"
            }
        }
    }

    filename = f"{output_path_base}.schema.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(schema, f, indent=4)

    print(f"Schema file written: {filename}")

def generate_features(df, output_path_base, cardinality_threshold = 1):
    # First, keep a copy of original values as strings for "values"
    df_values = df.astype(str).fillna("0")  # NaN replaced by string "0"

    feature_cols = df.columns[1:]  # exclude ID column

    # Detect potential date columns by dtype or name (adjust heuristics as needed)
    date_cols = []
    for col in feature_cols:
        # Heuristic: If dtype is object and column name contains 'date' or 'time' (case-insensitive)
        if (df[col].dtype == 'object' or not pd.api.types.is_numeric_dtype(df[col])) and (('date' in col.lower()) or ('time' in col.lower())):
            date_cols.append(col)

    # Convert date columns to UNIX timestamps (seconds since epoch)
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], errors='coerce')  # parse dates, invalid become NaT
        df[col] = df[col].apply(lambda x: x.timestamp() if pd.notnull(x) else None)  # convert to float timestamp
        print(df[col])

    encoded_df = pd.DataFrame()
    encoders = {}
    
    feature_col_map = []  # Mapping

    for col in feature_cols:
        col_data = df[col]

        if col in date_cols:
            encoded_df[col] = col_data.fillna(0).astype(float)
            feature_col_map.append(col)

        elif not pd.api.types.is_numeric_dtype(col_data):
            col_data_filled = col_data.fillna("0").astype(str)
            nunique = col_data_filled.nunique()

            if nunique <= cardinality_threshold: # LabelEncoder assumes ordinal categories which is too strong an assumption
                dummies = pd.get_dummies(col_data_filled, prefix=col)
                encoded_df = pd.concat([encoded_df, dummies.astype(float)], axis=1)
                feature_col_map.extend(dummies.columns.tolist())
            else:
                le = LabelEncoder()
                encoded = le.fit_transform(col_data_filled)
                encoders[col] = le
                encoded_df[col] = encoded
                feature_col_map.append(col)
        else:
            encoded_df[col] = col_data.fillna(0).astype(float)
            feature_col_map.append(col)

    # Normalize features
    normalized_df = encoded_df.copy()
    for col in normalized_df.columns:
        col_min = normalized_df[col].min()
        col_max = normalized_df[col].max()
        if col_max - col_min == 0:
            normalized_df[col] = 0.0
        else:
            normalized_df[col] = (normalized_df[col] - col_min) / (col_max - col_min)

    # Threshold for small values
    threshold = 1e-3
    normalized_df = normalized_df.mask(normalized_df.abs() < threshold, 0.0)

    features_list = []
    for idx, row in df.iterrows():
        id_value = row["ID"]

        feature_dict = {str(i + 1): float(normalized_df.iloc[idx, i]) for i in range(len(normalized_df.columns))}
        value_dict = {}
        for i, orig_col in enumerate(feature_col_map):
            if orig_col in df_values.columns:
                value = df_values.iloc[idx, df_values.columns.get_loc(orig_col)]
            elif "_" in orig_col and orig_col.rsplit("_", 1)[0] in df_values.columns:
                base_col, category = orig_col.rsplit("_", 1)
                value = "1" if df_values.iloc[idx, df_values.columns.get_loc(base_col)] == category else "0"
            else:
                value = "0"
            value_dict[str(i + 1)] = value


        features_list.append({
            "defaultcontext": "1",
            "features": {
                "1": feature_dict
            },
            "id": id_value,
            "values": value_dict
        })

    filename = f"{output_path_base}.feature.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(features_list, f, indent=4)
    print(f"Feature file written: {filename}")

    # Build the DataFrame to return, including the ID column + normalized features
    features_df = normalized_df.copy()
    features_df.insert(0, "ID", df["ID"])

    return features_df

def generate_meta(df, features_df, output_path_base):
    feature_cols = features_df.columns[1:]  # Skip ID column
    meta_features = {}

    for i, col in enumerate(feature_cols):
        col_data = features_df[col]
        enumerate_col = is_enumerate(df[col])

        # --- Categories ---
        if enumerate_col:
            unique_vals = df[col].dropna().unique()
            
            # Try numeric sort first
            try:
                categories = sorted(unique_vals, key=lambda x: float(x))
                # Convert to strings for JSON
                categories = [str(v) for v in categories]
            except ValueError:
                # fallback: lexicographic sort
                categories = sorted([str(v) for v in unique_vals])
        else:
            categories = []

        # --- Numeric conversion for stats ---
        if is_numeric_dtype(df[col]):
            col_numeric = col_data.fillna(0)
        else:
            col_numeric = pd.to_numeric(col_data, errors="coerce").fillna(0)

        # Compute statistics
        col_min = float(col_numeric.min())
        col_max = float(col_numeric.max())
        col_median = float(col_numeric.median())
        col_variance = float(col_numeric.var(ddof=0))  # population variance
        col_std = float(col_numeric.std(ddof=0))        # population std dev

        # Histogram (20 bins, density=True)
        counts, bin_edges = np.histogram(col_numeric, bins=20, density=True)
        histogram = {str(j): float(count) for j, count in enumerate(counts)}

        # Add to meta
        meta_features[str(i + 1)] = {
            "histogram": histogram,
            "categories": categories,
            "max": col_max,
            "min": col_min,
            "median": col_median,
            "variance": col_variance,
            "deviation": col_std
        }

    meta = {"features": meta_features}

    filename = f"{output_path_base}.meta.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=4)
    print(f"Meta file written: {filename}")

def generate_epsg_positions(df, output_path_base):
    # Possible column name variants for longitude and latitude
    lon_names = {"longitude", "lon", "breitengrad"}
    lat_names = {"latitude", "lat", "längengrad"}

    # Normalize columns to lowercase for matching
    cols_lower = {col.lower(): col for col in df.columns}

    lon_col = next((cols_lower[name] for name in lon_names if name in cols_lower), None)
    lat_col = next((cols_lower[name] for name in lat_names if name in cols_lower), None)

    if lon_col is None or lat_col is None:
        print("Longitude or latitude columns not found; skipping EPSG position file.")
        return
    
    # Get valid latitude and longitude ranges from the dataset
    valid_lats = pd.to_numeric(df[lat_col], errors='coerce').dropna()
    valid_lons = pd.to_numeric(df[lon_col], errors='coerce').dropna()

    if valid_lats.empty or valid_lons.empty:
        print("No valid coordinates to infer fallback range from.")
        return

    BUFFER = 1.0
    LAT_RANGE = (valid_lats.min() - BUFFER, valid_lats.max() + BUFFER)
    LON_RANGE = (valid_lons.min() - BUFFER, valid_lons.max() + BUFFER)

    positions = []
    for _, row in df.iterrows():
        id_val = row["ID"]

        try:
            x_val = float(row[lon_col])
        except (ValueError, TypeError):
            x_val = float('nan')

        try:
            y_val = float(row[lat_col])
        except (ValueError, TypeError):
            y_val = float('nan')

        # Replace NaN values with random coordinates
        if pd.isna(x_val) or math.isnan(x_val):
            x_val = random.uniform(*LON_RANGE)
        if pd.isna(y_val) or math.isnan(y_val):
            y_val = random.uniform(*LAT_RANGE)

        positions.append({
            "id": id_val,
            "position": {
                "x": x_val,
                "y": y_val
            }
        })

    if not positions:
        print("No valid positions found; skipping EPSG position file.")
        return

    filename = f"{output_path_base}.position.epsg.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(positions, f, indent=4)

    print(f"EPSG position file written: {filename}")

def generate_xy_positions(df, output_path_base):
    """
    Search for <prefix>-x / <prefix>-y column pairs (case‑insensitive).
    For each pair, output {output_path_base}.position.<prefix>.json
    with id / x / y for all rows that have *both* coordinates numeric.
    """
    # Map lower–case names to original names
    cols_lower = {c.lower(): c for c in df.columns}

    # Gather prefixes that have both “-x” and “-y”
    prefixes = []
    for name in cols_lower:
        if name.endswith("-x"):
            prefix = name[:-2]
            if prefix + "-y" in cols_lower:
                prefixes.append(prefix)

    if not prefixes:
        print("No '<prefix>-x' / '<prefix>-y' pairs found – skipping.")
        return

    for prefix in prefixes:
        x_col = cols_lower[prefix + "-x"]
        y_col = cols_lower[prefix + "-y"]

        # Build a small DataFrame with ID, x, y
        coords = df[[ "ID", x_col, y_col ]].copy()

        # Convert x and y to numeric, invalid values -> NaN
        coords[[x_col, y_col]] = coords[[x_col, y_col]].apply(
            lambda s: pd.to_numeric(s, errors="coerce")
        )

        # Keep only rows with *both* coordinates present
        coords = coords.dropna(subset=[x_col, y_col])

        if coords.empty:
            print(f"No valid coordinates for prefix '{prefix}' – file not written.")
            continue

        # Build output list
        positions = []
        for _, row in coords.iterrows():
            id_val = row["ID"]

            positions.append({
                "id": id_val,
                "position": {
                    "x": float(row[x_col]),
                    "y": float(row[y_col])
                }
            })

        filename = f"{output_path_base}.position.{prefix}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(positions, f, indent=4)

        print(f"XY position file written: {filename}")

def generate_pca_positions(features_df, output_path_base):
    feature_cols = features_df.columns.difference(['ID'])
    feature_data = features_df[feature_cols].fillna(0).astype(float)

    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(feature_data)

    positions = []
    for idx, row in features_df.iterrows():
        id_val = row["ID"]

        positions.append({
            "id": id_val,
            "position": {
                "x": float(pca_result[idx, 0]),
                "y": float(pca_result[idx, 1])
            }
        })

    filename = f"{output_path_base}.position.pca.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(positions, f, indent=4)
    print(f"PCA positions written: {filename}")

def generate_tsne_positions(features_df, output_path_base):
    feature_cols = features_df.columns.difference(['ID'])
    feature_data = features_df[feature_cols].fillna(0).astype(float)

    tsne = TSNE(n_components=2, random_state=42, init='random')
    tsne_result = tsne.fit_transform(feature_data)

    positions = []
    for idx, row in features_df.iterrows():
        id_val = row["ID"]

        positions.append({
            "id": id_val,
            "position": {
                "x": float(tsne_result[idx, 0]),
                "y": float(tsne_result[idx, 1])
            }
        })

    filename = f"{output_path_base}.position.tsne.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(positions, f, indent=4)
    print(f"t-SNE positions written: {filename}")

    return filename

def generate_umap_positions(df, output_path_base):
    # Drop ID and keep only numeric columns
    if "ID" not in df.columns:
        print("No 'ID' column found; cannot compute UMAP positions.")
        return

    df_numeric = df.drop(columns=["ID"], errors='ignore').select_dtypes(include=[np.number])
    if df_numeric.empty:
        print("No numeric features available for UMAP.")
        return

    # Fill NaNs with 0 and normalize
    features = df_numeric.fillna(0)
    features = StandardScaler().fit_transform(features)

    reducer = umap.UMAP(n_components=2, random_state=42)
    embedding = reducer.fit_transform(features)

    positions = []
    for idx, row in df.iterrows():
        id_val = row["ID"]

        x, y = embedding[idx]
        positions.append({
            "id": id_val,
            "position": {
                "x": float(x),
                "y": float(y)
            }
        })

    filename = f"{output_path_base}.position.umap.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(positions, f, indent=4)

    print(f"UMAP position file written: {filename}")

def extract_projection_features(df, features_df):
    exclude_pattern = re.compile(r'^.+-(x|y)$|^thumb$')
    feature_cols = [
        col for col in features_df.columns
        if col != 'ID' and not exclude_pattern.match(col)
    ]

    result = features_df[feature_cols].fillna(0).astype(float)
    result.insert(0, "ID", df["ID"])
    return result

def process_csv_file(input_csv_path):
    csv_path = Path(input_csv_path)
    if not csv_path.exists():
        print(f"Error: File {csv_path} does not exist.")
        sys.exit(1)

    df = pd.read_csv(csv_path)

    df = add_id_column_if_missing(df)

    # Save CSV with ID column added
    output_csv_path = csv_path.with_name(f"{csv_path.stem}_with_id.csv")
    df.to_csv(output_csv_path, index=False)
    print(f"Updated CSV with ID saved: {output_csv_path}")

    # Prepare base for output files
    timestamp = current_timestamp()
    base_name = csv_path.stem
    output_path_base = f"{datafolder}{base_name}.{timestamp}"

    # Generate files
    generate_schema(df, output_path_base)
    features_df = generate_features(df, output_path_base)
    feature_data = extract_projection_features(df, features_df)    
    generate_meta(df, features_df, output_path_base)
    generate_pca_positions(feature_data, output_path_base)
    generate_umap_positions(feature_data, output_path_base)
    generate_tsne_positions(feature_data, output_path_base)
    generate_epsg_positions(df, output_path_base)
    generate_xy_positions(df, output_path_base)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process.py <input_file.csv>")
    else:
        print("Processing your data file")
        process_csv_file(sys.argv[1])

    print("Discovering datasets and write to default-dataset.ts")
    discover_datasets()

    