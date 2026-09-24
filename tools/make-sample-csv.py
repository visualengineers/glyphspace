"""
Regenerates the wizard's "Try with sample data" file from the bundled wine
dataset. Run from the repository root:

    python tools/make-sample-csv.py

Reads src/assets/data/wineqr.15012026.feature.json (raw values per item, keyed
by feature id) and .schema.json (feature id -> column label) and writes
src/assets/samples/wine-quality-red.csv with a leading "ID" column followed by
the features in schema order.

Source data: Wine Quality (red), P. Cortez et al., UCI Machine Learning
Repository, CC BY 4.0.
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "assets" / "data"
FEATURE_FILE = DATA_DIR / "wineqr.15012026.feature.json"
SCHEMA_FILE = DATA_DIR / "wineqr.15012026.schema.json"
OUTPUT_FILE = ROOT / "src" / "assets" / "samples" / "wine-quality-red.csv"


def load_json(path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def feature_ids_in_order(labels):
    """Feature ids sorted numerically ("1", "2", ..., "12"), not lexically."""
    return sorted(labels, key=int)


def build_rows(items, feature_ids):
    for item in items:
        values = item["values"]
        missing = [fid for fid in feature_ids if fid not in values]
        if missing:
            raise ValueError(f"Item {item['id']} lacks feature ids {missing}")
        yield [item["id"], *(values[fid] for fid in feature_ids)]


def main():
    labels = load_json(SCHEMA_FILE)["label"]
    items = load_json(FEATURE_FILE)
    feature_ids = feature_ids_in_order(labels)
    header = ["ID", *(labels[fid] for fid in feature_ids)]

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(header)
        writer.writerows(build_rows(items, feature_ids))

    print(f"Wrote {OUTPUT_FILE.relative_to(ROOT)}: {len(items)} rows x {len(header)} columns")


if __name__ == "__main__":
    main()
