import { Injectable } from '@angular/core';
import { Observable, from, of, switchMap } from 'rxjs';
import { DataProcessorService } from './data-processor';
import { DatasetStorageService } from './dataset-storage.service';
import { DatasetCollectionService } from './dataset-collection.service';
import { ThumbnailImage, ThumbnailResolver } from '../glyph/glyph-render-config';

/** Image files of an archive by item id: "17.png" is the image of item 17. */
type ArchiveIndex = Map<string, string>;

const IMAGE_FILE = /^(.+)\.(jpe?g|png|webp)$/i;

/** The item id each image file stands for (its name without extension), mapped to its path in the worker. */
export function indexImages(folder: string, images: readonly string[]): ArchiveIndex {
  const index: ArchiveIndex = new Map();
  for (const image of [...images].sort()) {
    const id = IMAGE_FILE.exec(image)?.[1];
    if (id !== undefined && !index.has(id)) index.set(id, `${folder}/${image}`);
  }
  return index;
}

/**
 * Item images for the Image glyph type. Bundled datasets ship theirs in
 * assets/thumbnails/<dataset>/<id>.jpg. Datasets from the wizard get them from
 * an uploaded ZIP archive when they are opened in the dashboard: it is unpacked
 * in the worker and kept in IndexedDB, so a dataset restored in a later session
 * finds its images again.
 */
@Injectable({ providedIn: 'root' })
export class ThumbnailService implements ThumbnailResolver {
  private archives = new Map<string, Promise<ArchiveIndex | null>>();
  private nextFolder = 0;

  constructor(
    private dataProcessor: DataProcessorService,
    private storage: DatasetStorageService,
    private collections: DatasetCollectionService
  ) {}

  /**
   * Use the images in `archive` for `dataset` from now on, also in later
   * sessions. Returns the number of item images found in it.
   */
  async attachArchive(dataset: string, archive: Blob): Promise<number> {
    const index = this.unpack(archive);
    this.archives.set(dataset, index);
    await this.storage.saveThumbnailArchive(dataset, archive);
    return (await index)?.size ?? 0;
  }

  /**
   * `dataset` has no item images: drop any archive kept under its name, e.g. one
   * an earlier version of the wizard stored for a dataset that was never opened.
   */
  async detachArchive(dataset: string): Promise<void> {
    // Known at once, before the stored archive is gone, so no image of it shows.
    this.archives.set(dataset, Promise.resolve(null));
    await this.storage.deleteThumbnailArchive(dataset);
  }

  /**
   * Whether the dataset has item images for the Image glyph type: a bundled
   * dataset says so in the dataset list, a processed one has an image archive.
   */
  async hasImages(dataset: string): Promise<boolean> {
    const entry = this.collections.getCollectionEntry(dataset);
    if (entry == null) return false;
    if (entry.source === 'local') return entry.images === true;
    const index = this.archives.get(dataset);
    if (index) return ((await index)?.size ?? 0) > 0;
    return (await this.storage.getThumbnailArchive(dataset)) != null;
  }

  /**
   * Drop the images of a deleted dataset from memory (the stored archive goes
   * with the dataset). The one place that releases a dataset's unpacked images.
   */
  forget(dataset: string): void {
    this.archives.delete(dataset);
  }

  requestThumb(dataset: string, id: string): Observable<ThumbnailImage | null> {
    if (this.collections.getCollectionEntry(dataset)?.source === 'local') {
      return this.bundledThumb(dataset, id);
    }
    return from(this.archiveOf(dataset)).pipe(
      switchMap(index => {
        const file = index?.get(id);
        return file ? this.dataProcessor.requestThumb(file) : of(null);
      })
    );
  }

  /** The unpacked archive of a dataset; one stored in IndexedDB is unpacked on first use. */
  private archiveOf(dataset: string): Promise<ArchiveIndex | null> {
    let index = this.archives.get(dataset);
    if (!index) {
      index = this.storage.getThumbnailArchive(dataset).then(archive => (archive ? this.unpack(archive) : null));
      this.archives.set(dataset, index);
    }
    return index;
  }

  private async unpack(archive: Blob): Promise<ArchiveIndex | null> {
    const folder = `thumbnails-${this.nextFolder++}`;
    try {
      return indexImages(folder, await this.dataProcessor.unzip(folder, archive));
    } catch (error) {
      console.warn('[ThumbnailService] The image archive could not be unpacked:', error);
      return null;
    }
  }

  private bundledThumb(dataset: string, id: string): Observable<ThumbnailImage | null> {
    return new Observable<ThumbnailImage | null>(subscriber => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        subscriber.next(image);
        subscriber.complete();
      };
      image.onerror = () => {
        subscriber.next(null);
        subscriber.complete();
      };
      image.src = `assets/thumbnails/${encodeURIComponent(dataset)}/${encodeURIComponent(id)}.jpg`;
    });
  }
}
