import { Injectable } from '@angular/core';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { GlyphMeta } from '../shared/interfaces/glyph-meta';
import { GlyphFeature } from '../shared/interfaces/glyph-feature';
import { GlyphPosition } from '../shared/interfaces/glyph-position';

export interface StoredDataset {
  name: string;
  timestamp: string;
  savedAt: number;
  schema: GlyphSchema;
  meta: GlyphMeta;
  features: GlyphFeature[];
  positions: Record<string, GlyphPosition[]>;
}

const DB_NAME = 'glyphspace-datasets';
const DB_VERSION = 1;
const STORE_NAME = 'datasets';

@Injectable({ providedIn: 'root' })
export class DatasetStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'name' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error);
        };
      });
    }
    return this.dbPromise;
  }

  async saveDataset(dataset: StoredDataset): Promise<void> {
    try {
      const db = await this.openDb();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(dataset);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('[DatasetStorage] Failed to save dataset:', error);
    }
  }

  async getDataset(name: string): Promise<StoredDataset | undefined> {
    try {
      const db = await this.openDb();
      return new Promise<StoredDataset | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(name);
        request.onsuccess = () => resolve(request.result ?? undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[DatasetStorage] Failed to get dataset:', error);
      return undefined;
    }
  }

  async getAllDatasets(): Promise<StoredDataset[]> {
    try {
      const db = await this.openDb();
      return new Promise<StoredDataset[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result ?? []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[DatasetStorage] Failed to get all datasets:', error);
      return [];
    }
  }

  async deleteDataset(name: string): Promise<void> {
    try {
      const db = await this.openDb();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('[DatasetStorage] Failed to delete dataset:', error);
    }
  }
}
