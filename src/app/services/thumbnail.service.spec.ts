import { firstValueFrom, of } from 'rxjs';
import { ThumbnailService, indexImages } from './thumbnail.service';
import { DataProcessorService } from './data-processor';
import { DatasetStorageService } from './dataset-storage.service';
import { DatasetCollectionService } from './dataset-collection.service';

describe('indexImages', () => {
  it('maps each item id to its picture, whatever the image format', () => {
    const index = indexImages('t0', ['17.jpg', '18.PNG', 'a b.webp', '19.jpeg', 'notes.txt', '.unpacked']);

    expect(Object.fromEntries(index)).toEqual({
      '17': 't0/17.jpg',
      '18': 't0/18.PNG',
      '19': 't0/19.jpeg',
      'a b': 't0/a b.webp',
    });
  });

  it('takes one picture per id', () => {
    expect(indexImages('t0', ['7.png', '7.jpg']).get('7')).toBe('t0/7.jpg');
  });
});

describe('ThumbnailService', () => {
  const bitmap = {} as ImageBitmap;
  let unzip: ReturnType<typeof vi.fn>;
  let requestThumb: ReturnType<typeof vi.fn>;
  let stored: Map<string, Blob>;
  let sources: Record<string, string>;
  let service: ThumbnailService;

  beforeEach(() => {
    unzip = vi.fn().mockResolvedValue(['1.png', '2.jpg']);
    requestThumb = vi.fn().mockReturnValue(of(bitmap));
    stored = new Map();
    sources = { wine: 'wasm' };
    service = new ThumbnailService(
      { unzip, requestThumb } as unknown as DataProcessorService,
      {
        saveThumbnailArchive: async (name: string, archive: Blob) => void stored.set(name, archive),
        getThumbnailArchive: async (name: string) => stored.get(name),
      } as unknown as DatasetStorageService,
      {
        getCollectionEntry: (name: string) => (sources[name] ? { source: sources[name] } : undefined),
      } as unknown as DatasetCollectionService
    );
  });

  const first = (dataset: string, id: string) => firstValueFrom(service.requestThumb(dataset, id));

  it('finds the pictures of an attached archive by item id', async () => {
    expect(await service.attachArchive('wine', new Blob(['zip']))).toBe(2);

    expect(await first('wine', '1')).toBe(bitmap);
    expect(requestThumb).toHaveBeenCalledWith(expect.stringMatching(/^thumbnails-\d+\/1\.png$/));
  });

  it('has no picture for an item missing from the archive', async () => {
    await service.attachArchive('wine', new Blob(['zip']));

    expect(await first('wine', '3')).toBeNull();
  });

  it('keeps the archive, so a later session unpacks it again on first use', async () => {
    await service.attachArchive('wine', new Blob(['zip']));
    unzip.mockClear();
    service.forget('wine'); // as in a new session

    expect(await first('wine', '2')).toBe(bitmap);
    expect(unzip).toHaveBeenCalledTimes(1);
  });

  it('has no pictures for a processed dataset without an archive', async () => {
    expect(await first('wine', '1')).toBeNull();
    expect(unzip).not.toHaveBeenCalled();
  });

  it('loads the pictures of a bundled dataset from the assets', async () => {
    sources['bundled'] = 'local';

    // No such asset in the test build: the request settles with no picture.
    const result = await firstValueFrom(service.requestThumb('bundled', '1'));

    expect(result).toBeNull();
    expect(unzip).not.toHaveBeenCalled();
  });
});
