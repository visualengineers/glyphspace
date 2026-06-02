import { DatasetCollectionService } from './dataset-collection.service';
import { DatasetCollectionEntry } from '../shared/interfaces/dataset-collection';

function makeEntry(dataset: string, time: string, positions: Record<string, string> = {}): DatasetCollectionEntry {
  return {
    dataset,
    source: 'local',
    items: [
      {
        time,
        algorithms: {
          schema: `${dataset}/schema`,
          meta: `${dataset}/meta`,
          feature: `${dataset}/feature`,
          position: positions,
        },
      },
    ],
  };
}

describe('DatasetCollectionService', () => {
  let service: DatasetCollectionService;

  beforeEach(() => {
    service = new DatasetCollectionService();
  });

  it('should have a default collection', () => {
    const names = service.getDataSetNames();
    expect(names.length).toBeGreaterThan(0);
  });

  it('should add new datasets via setDatasetCollection', () => {
    const entry = makeEntry('test-ds', 't1', { pca: 'test-ds/pca' });
    service.setDatasetCollection([entry]);

    expect(service.getDataSetNames()).toContain('test-ds');
  });

  it('should merge positions when adding to existing dataset', () => {
    const entry1 = makeEntry('ds1', 't1', { pca: 'ds1/pca' });
    service.setDatasetCollection([entry1]);

    const entry2 = makeEntry('ds1', 't1', { tsne: 'ds1/tsne' });
    service.setDatasetCollection([entry2]);

    const positions = service.getPositions('ds1');
    expect(positions).toContain('pca');
    expect(positions).toContain('tsne');
  });

  it('should add new timestamps to existing dataset', () => {
    const entry1 = makeEntry('ds1', 't1');
    service.setDatasetCollection([entry1]);

    const entry2 = makeEntry('ds1', 't2');
    service.setDatasetCollection([entry2]);

    const timestamps = service.getTimestamps('ds1');
    expect(timestamps).toContain('t1');
    expect(timestamps).toContain('t2');
  });

  it('should return entry by name', () => {
    const entry = makeEntry('my-ds', 't1');
    service.setDatasetCollection([entry]);

    const result = service.getCollectionEntry('my-ds');
    expect(result).toBeTruthy();
    expect(result?.dataset).toBe('my-ds');
  });

  it('should return undefined for unknown dataset', () => {
    expect(service.getCollectionEntry('nonexistent')).toBeUndefined();
  });

  it('should remove a dataset', () => {
    const entry = makeEntry('removable', 't1');
    service.setDatasetCollection([entry]);
    expect(service.getDataSetNames()).toContain('removable');

    service.removeDataset('removable');
    expect(service.getDataSetNames()).not.toContain('removable');
  });

  it('should return positions for a dataset', () => {
    const entry = makeEntry('ds1', 't1', { pca: 'ds1/pca', tsne: 'ds1/tsne' });
    service.setDatasetCollection([entry]);

    const positions = service.getPositions('ds1');
    expect(positions).toContain('pca');
    expect(positions).toContain('tsne');
  });

  it('should emit on observable when collection changes', (done: DoneFn) => {
    let emitCount = 0;
    service.dataSetCollectionSubject$.subscribe(() => {
      emitCount++;
      if (emitCount === 2) {
        // Initial + one setDatasetCollection
        done();
      }
    });

    service.setDatasetCollection([makeEntry('new-ds', 't1')]);
  });
});
