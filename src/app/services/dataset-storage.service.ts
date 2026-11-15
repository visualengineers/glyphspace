import { Injectable, InjectionToken, inject } from '@angular/core';
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

/** What the dataset list needs of a stored dataset, without its data. */
export interface StoredDatasetSummary {
  name: string;
  timestamp: string;
  projections: string[];
}

/** Name of the IndexedDB database; tests give each run its own. */
export const DATASET_DB_NAME = new InjectionToken<string>('DATASET_DB_NAME', {
  providedIn: 'root',
  factory: () => 'glyphspace-datasets',
});

// Version 2 added the store of item image archives.
const DB_VERSION = 2;
const STORE_NAME = 'datasets';
/** ZIP archives of item images (Image glyph type), by dataset name. */
const THUMBNAIL_STORE = 'thumbnails';
const BLOCKED_MESSAGE = 'The saved datasets are in use by another tab of an older version of GlyphSpace';

/**
 * Datasets processed by the wizard, kept across sessions in IndexedDB.
 *
 * Writes (`saveDataset`, `deleteDataset`) reject when IndexedDB fails, also when
 * a transaction is aborted (Chrome reports a full quota that way), so callers can
 * tell the user. Reads log the failure and return nothing. The connection is
 * closed when another tab upgrades or deletes the database, and reopened on the
 * next request.
 */
@Injectable({ providedIn: 'root' })
export class DatasetStorageService {
  private readonly dbName = inject(DATASET_DB_NAME);
  /** The open connection, once there is one. */
  private connection: IDBDatabase | null = null;
  /** The open request in progress. */
  private opening: Promise<IDBDatabase> | null = null;
  /** An older version in another tab blocks the upgrade of the open request in progress. */
  private blocked = false;

  async saveDataset(dataset: StoredDataset): Promise<void> {
    await this.transaction(STORE_NAME, 'readwrite', tx => tx.objectStore(STORE_NAME).put(dataset));
  }

  async getDataset(name: string): Promise<StoredDataset | undefined> {
    try {
      return await this.transaction<StoredDataset | undefined>(STORE_NAME, 'readonly', tx =>
        tx.objectStore(STORE_NAME).get(name)
      );
    } catch (error) {
      console.warn('[DatasetStorage] Failed to get dataset:', error);
      return undefined;
    }
  }

  /**
   * Name, time and projections of every stored dataset. Walks the store with a
   * cursor, so only one dataset is in memory at a time.
   */
  async getDatasetSummaries(): Promise<StoredDatasetSummary[]> {
    const summaries: StoredDatasetSummary[] = [];
    try {
      await this.transaction(STORE_NAME, 'readonly', tx => {
        const request = tx.objectStore(STORE_NAME).openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return;
          const stored = cursor.value as StoredDataset;
          summaries.push({
            name: stored.name,
            timestamp: stored.timestamp,
            projections: Object.keys(stored.positions ?? {}),
          });
          cursor.continue();
        };
        return request;
      });
      return summaries;
    } catch (error) {
      console.warn('[DatasetStorage] Failed to list the stored datasets:', error);
      return [];
    }
  }

  /** Deletes the dataset and its image archive. */
  async deleteDataset(name: string): Promise<void> {
    await this.transaction([STORE_NAME, THUMBNAIL_STORE], 'readwrite', tx => {
      tx.objectStore(STORE_NAME).delete(name);
      return tx.objectStore(THUMBNAIL_STORE).delete(name);
    });
  }

  /** Keeps the ZIP archive of a dataset's item images. A failure is logged: the images then last for the session. */
  async saveThumbnailArchive(name: string, archive: Blob): Promise<void> {
    try {
      await this.transaction(THUMBNAIL_STORE, 'readwrite', tx => tx.objectStore(THUMBNAIL_STORE).put(archive, name));
    } catch (error) {
      console.warn('[DatasetStorage] Failed to save the image archive:', error);
    }
  }

  /** Removes the ZIP archive of a dataset's item images, if there is one. A failure is logged. */
  async deleteThumbnailArchive(name: string): Promise<void> {
    try {
      await this.transaction(THUMBNAIL_STORE, 'readwrite', tx => tx.objectStore(THUMBNAIL_STORE).delete(name));
    } catch (error) {
      console.warn('[DatasetStorage] Failed to delete the image archive:', error);
    }
  }

  async getThumbnailArchive(name: string): Promise<Blob | undefined> {
    try {
      return await this.transaction<Blob | undefined>(THUMBNAIL_STORE, 'readonly', tx =>
        tx.objectStore(THUMBNAIL_STORE).get(name)
      );
    } catch (error) {
      console.warn('[DatasetStorage] Failed to read the image archive:', error);
      return undefined;
    }
  }

  /**
   * Run `work` in a transaction. Resolves with the result of the request `work`
   * returns once the transaction has committed; rejects when it fails, is aborted,
   * or cannot be started (a synchronous throw, e.g. from a closing connection).
   */
  private async transaction<T>(
    stores: string | string[],
    mode: IDBTransactionMode,
    work: (tx: IDBTransaction) => IDBRequest | void
  ): Promise<T | undefined> {
    const db = await this.openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      const request = work(tx);
      tx.oncomplete = () => resolve((request?.result ?? undefined) as T | undefined);
      tx.onerror = () => reject(tx.error ?? request?.error ?? new Error('IndexedDB request failed'));
      tx.onabort = () => reject(tx.error ?? new DOMException('The IndexedDB transaction was aborted', 'AbortError'));
    });
  }

  private openDb(): Promise<IDBDatabase> {
    if (this.connection) return Promise.resolve(this.connection);
    // A tab that still runs an older version keeps the database open and blocks
    // the upgrade. Fail at once instead of queueing behind it; the blocked open
    // completes, and is used from then on, once that tab closes the database.
    if (this.blocked) return Promise.reject(new Error(BLOCKED_MESSAGE));
    if (!this.opening) {
      const opening = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(this.dbName, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'name' });
          }
          if (!db.objectStoreNames.contains(THUMBNAIL_STORE)) {
            db.createObjectStore(THUMBNAIL_STORE);
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          this.blocked = false;
          // Another tab upgrades or deletes the database: let it, and reopen on the next request.
          db.onversionchange = () => {
            db.close();
            this.forgetConnection(db);
          };
          // The browser closed the connection (e.g. the storage was cleared).
          db.onclose = () => this.forgetConnection(db);
          this.connection = db;
          resolve(db);
        };
        request.onerror = () => {
          this.blocked = false;
          reject(request.error);
        };
        request.onblocked = () => {
          this.blocked = true;
          reject(new Error(BLOCKED_MESSAGE));
        };
      });
      this.opening = opening;
      void opening.then(
        () => this.forgetOpening(opening),
        () => this.forgetOpening(opening)
      );
    }
    return this.opening;
  }

  private forgetOpening(opening: Promise<IDBDatabase>): void {
    if (this.opening === opening) this.opening = null;
  }

  private forgetConnection(db: IDBDatabase): void {
    if (this.connection === db) this.connection = null;
  }
}
