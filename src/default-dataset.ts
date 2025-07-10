import { DatasetCollection } from "./app/shared/interfaces/dataset-collection";

export const DEFAULT_DATASETCOLLECTION: DatasetCollection = [
    {
        "dataset": "wineqr",
        "source": "local",
        "items": [
            {
                "algorithms": {
                    "position": {
                        "tsne": "wineqr.09072025.position.tsne.json",
                        "pca": "wineqr.09072025.position.pca.json",
                        "umap": "wineqr.09072025.position.umap.json"
                    },
                    "meta": "wineqr.09072025.meta.json",
                    "feature": "wineqr.09072025.feature.json",
                    "schema": "wineqr.09072025.schema.json"
                },
                "time": "09072025"
            }
        ]
    }
]