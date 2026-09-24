"""
Local CSV import: writes a dataset into src/assets/data/ and regenerates
src/default-dataset.ts. Run from the repository root:

    python tools/process.py <input_file.csv>

The dataset file generation lives in tools/dataset_common.py, next to this script.
"""

import json
import sys
from pathlib import Path

# umap (numba/llvmlite) must be imported before numpy/pandas/sklearn: on Windows,
# llvmlite's DLL fails to initialise (WinError 1114) when those are loaded first.
import umap  # isort: skip

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# Local module: Python puts this script's directory (tools/) first on sys.path.
from dataset_common import (
    add_id_column_if_missing,
    collect_datasets,
    current_timestamp,
    extract_projection_features,
    generate_epsg_positions,
    generate_features,
    generate_meta,
    generate_pca_positions,
    generate_schema,
    generate_tsne_positions,
    generate_xy_positions,
    plan_features,
    positions_from_embedding,
    write_json,
)

datafolder = "./src/assets/data/"
datasetcollection = "./src/default-dataset.ts"

SOURCE = "local"
GLYPH_LIMIT = 5
CARDINALITY_THRESHOLD = 1  # text columns are label encoded unless constant
HISTOGRAM_BINS = 20


def discover_datasets() -> str:
    """Write the DatasetCollection of all files in datafolder to src/default-dataset.ts."""
    result = collect_datasets(datafolder, SOURCE)

    with open(datasetcollection, "w", encoding="utf-8") as f:
        f.write('import { DatasetCollection } from "./app/shared/interfaces/dataset-collection";\n\n')
        f.write("export const DEFAULT_DATASETCOLLECTION: DatasetCollection = ")
        json.dump(result, f, indent=4)

    return json.dumps(result, indent=4)


def generate_umap_positions(df: pd.DataFrame, output_path_base: str) -> None:
    if "ID" not in df.columns:
        print("No 'ID' column found; cannot compute UMAP positions.")
        return

    # Drop ID and keep only numeric columns
    df_numeric = df.drop(columns=["ID"], errors="ignore").select_dtypes(include=[np.number])
    if df_numeric.empty:
        print("No numeric features available for UMAP.")
        return

    # Fill NaNs with 0 and normalize
    features = StandardScaler().fit_transform(df_numeric.fillna(0))
    embedding = umap.UMAP(n_components=2, random_state=42).fit_transform(features)

    filename = f"{output_path_base}.position.umap.json"
    write_json(filename, positions_from_embedding(df, embedding))
    print(f"UMAP position file written: {filename}")


def process_csv_file(input_csv_path: str) -> None:
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
    output_path_base = f"{datafolder}{csv_path.stem}.{current_timestamp()}"

    # Generate files; schema, features and meta follow the same planned feature columns
    columns = plan_features(df, CARDINALITY_THRESHOLD)
    generate_schema(columns, output_path_base, glyph_limit=GLYPH_LIMIT)
    features_df = generate_features(df, columns, output_path_base)  # converts df's date columns
    feature_data = extract_projection_features(df, features_df)
    generate_meta(features_df, columns, df, output_path_base, histogram_bins=HISTOGRAM_BINS)
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
