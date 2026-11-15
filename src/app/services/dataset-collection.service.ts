import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatasetCollection, DatasetCollectionEntry } from '../shared/interfaces/dataset-collection';
import { DEFAULT_DATASETCOLLECTION } from '../../default-dataset';

@Injectable({ providedIn: 'root' })
export class DatasetCollectionService {
  private dataSetCollectionSubject = new BehaviorSubject<DatasetCollection>(DEFAULT_DATASETCOLLECTION);
  dataSetCollectionSubject$ = this.dataSetCollectionSubject.asObservable();

  getCollection(): DatasetCollection {
    return this.dataSetCollectionSubject.getValue();
  }

  /**
   * Add datasets, or items of a dataset, to the collection. An incoming item
   * replaces the item of the same dataset and time, like
   * `DatasetCacheService.buildDataSet` replaces that timestamp's data: its
   * projections are exactly the incoming ones, so a projection left out of a
   * rebuilt dataset is no longer offered.
   */
  setDatasetCollection(newCollection: DatasetCollection): void {
    const currentCollection = this.getCollection() ?? [];

    const datasetMap = new Map<string, DatasetCollectionEntry>();

    for (const entry of currentCollection) {
      datasetMap.set(entry.dataset, { ...entry, items: [...entry.items] });
    }

    for (const incoming of newCollection) {
      const existing = datasetMap.get(incoming.dataset);

      if (existing) {
        for (const incomingItem of incoming.items) {
          const index = existing.items.findIndex(item => item.time === incomingItem.time);
          if (index >= 0) existing.items[index] = incomingItem;
          else existing.items.push(incomingItem);
        }
      } else {
        datasetMap.set(incoming.dataset, { ...incoming, items: [...incoming.items] });
      }
    }

    this.dataSetCollectionSubject.next(Array.from(datasetMap.values()));
  }

  getCollectionEntry(name: string | undefined): DatasetCollectionEntry | undefined {
    if (!name) return undefined;
    return this.getCollection().find(c => c.dataset === name);
  }

  getDataSetNames(): string[] {
    const collection = this.getCollection() ?? [];
    return collection.map(entry => entry.dataset);
  }

  getTimestamps(name: string): string[] {
    const result: string[] = [];
    const collection = this.getCollectionEntry(name);
    if (collection) {
      collection.items.forEach(it => {
        result.push(it.time);
      });
    }
    return result;
  }

  getPositions(name: string, time?: string): string[] {
    const result: string[] = [];
    const collection = this.getCollectionEntry(name);
    if (collection) {
      const item = time ? collection.items.find(it => it.time === time) : collection.items.at(0);
      if (item) {
        result.push(...Object.keys(item.algorithms.position));
      }
    }
    return result;
  }

  removeDataset(datasetName: string): void {
    const updated = this.getCollection().filter(c => c.dataset !== datasetName);
    this.dataSetCollectionSubject.next(updated);
  }

  notifyChange(): void {
    this.dataSetCollectionSubject.next([...this.getCollection()]);
  }
}
