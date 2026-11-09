import { WizardFileStore } from './wizard-file-store';

/** Runs against the browser's real IndexedDB. */
describe('WizardFileStore', () => {
  let store: WizardFileStore;

  beforeEach(async () => {
    store = new WizardFileStore();
    await store.prune([]);
  });

  afterEach(() => store.prune([]));

  it('returns a saved file by name', async () => {
    await store.save('wine.csv', new Blob(['a,b\n1,2\n'], { type: 'text/csv' }));

    expect(await (await store.load('wine.csv'))?.text()).toBe('a,b\n1,2\n');
  });

  it('finds nothing for an unknown name', async () => {
    expect(await store.load('missing.csv')).toBeUndefined();
  });

  it('prunes every file that is not kept', async () => {
    await store.save('a.csv', new Blob(['a']));
    await store.save('b.csv', new Blob(['b']));

    await store.prune(['b.csv']);

    expect(await store.load('a.csv')).toBeUndefined();
    expect(await (await store.load('b.csv'))?.text()).toBe('b');
  });
});
