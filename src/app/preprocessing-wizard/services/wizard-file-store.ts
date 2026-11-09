import { Injectable } from '@angular/core';

const DB_NAME = 'glyphspace-wizard-files';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * Keeps the files uploaded to the wizard in IndexedDB, by file name. The wizard
 * settings survive a page reload in localStorage, but the worker's file system
 * starts empty; this store lets the wizard put the file back.
 * Best effort: when IndexedDB is unavailable, nothing is stored and load()
 * finds nothing.
 */
@Injectable({ providedIn: 'root' })
export class WizardFileStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  async save(name: string, file: Blob): Promise<void> {
    await this.run('readwrite', store => store.put(file, name));
  }

  async load(name: string): Promise<Blob | undefined> {
    return this.run<Blob | undefined>('readonly', store => store.get(name));
  }

  /** Delete every stored file not named in `keep`. */
  async prune(keep: readonly string[]): Promise<void> {
    const names = (await this.run<IDBValidKey[]>('readonly', store => store.getAllKeys())) ?? [];
    const obsolete = names.filter(name => !keep.includes(String(name)));
    await Promise.all(obsolete.map(name => this.run('readwrite', store => store.delete(name))));
  }

  private async run<T>(
    mode: IDBTransactionMode,
    request: (store: IDBObjectStore) => IDBRequest
  ): Promise<T | undefined> {
    try {
      const db = await this.openDb();
      return await new Promise<T>((resolve, reject) => {
        const req = request(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.warn('[WizardFileStore] IndexedDB request failed:', error);
      return undefined;
    }
  }

  private openDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error);
        };
      });
    }
    return this.dbPromise;
  }
}
