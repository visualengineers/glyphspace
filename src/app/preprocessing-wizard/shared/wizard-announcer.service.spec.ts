import { WizardAnnouncer } from './wizard-announcer.service';

describe('WizardAnnouncer', () => {
  it('routes messages to the polite or assertive region', async () => {
    const announcer = new WizardAnnouncer();

    announcer.announce('Step 2 of 6: Select Columns');
    announcer.announce('Processing failed', 'assertive');
    await Promise.resolve();

    expect(announcer.polite()).toBe('Step 2 of 6: Select Columns');
    expect(announcer.assertive()).toBe('Processing failed');
  });

  it('clears before re-announcing so an identical message is read again', async () => {
    const announcer = new WizardAnnouncer();
    announcer.announce('Saved');
    await Promise.resolve();

    announcer.announce('Saved');

    expect(announcer.polite()).toBe('');
    await Promise.resolve();
    expect(announcer.polite()).toBe('Saved');
  });
});
