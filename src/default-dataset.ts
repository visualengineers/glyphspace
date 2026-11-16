import { DatasetCollection } from './app/shared/interfaces/dataset-collection';

export const DEFAULT_DATASETCOLLECTION: DatasetCollection = [
  {
    dataset: 'wineqr',
    source: 'local',
    items: [
      {
        algorithms: {
          feature: 'wineqr.15012026.feature.json',
          meta: 'wineqr.15012026.meta.json',
          position: {
            umap: 'wineqr.15012026.position.umap.json',
            pca: 'wineqr.15012026.position.pca.json',
            tsne: 'wineqr.15012026.position.tsne.json',
          },
          schema: 'wineqr.15012026.schema.json',
        },
        time: '15012026',
      },
    ],
    images: true,
  },
  {
    dataset: 'nutrients',
    source: 'local',
    items: [
      {
        algorithms: {
          feature: 'nutrients.15012026.feature.json',
          meta: 'nutrients.15012026.meta.json',
          position: {
            umap: 'nutrients.15012026.position.umap.json',
            pca: 'nutrients.15012026.position.pca.json',
            tsne: 'nutrients.15012026.position.tsne.json',
          },
          schema: 'nutrients.15012026.schema.json',
        },
        time: '15012026',
      },
    ],
  },
];
