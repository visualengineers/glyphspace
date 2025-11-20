import { DatasetCollection } from "./app/shared/interfaces/dataset-collection";

export const DEFAULT_DATASETCOLLECTION: DatasetCollection = [
    {
        "dataset": "nutrients",
        "source": "local",
        "items": [
            {
                "algorithms": {
                    "feature": "nutrients.20112025.feature.json",
                    "meta": "nutrients.20112025.meta.json",
                    "position": {
                        "umap": "nutrients.20112025.position.umap.json",
                        "tsne": "nutrients.20112025.position.tsne.json",
                        "pca": "nutrients.20112025.position.pca.json"
                    },
                    "schema": "nutrients.20112025.schema.json"
                },
                "time": "20112025"
            }
        ]
    },
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