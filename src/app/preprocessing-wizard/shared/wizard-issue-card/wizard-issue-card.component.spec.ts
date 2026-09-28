import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WizardIssueCardComponent } from './wizard-issue-card.component';
import { WizardIssue } from '../constants/wizard-error-classes';

/**
 * A3 — component test for the presentational issue card. Verifies that the
 * everyday-language title, WHY and FIX are always visible, that the raw
 * technical text is hidden until the user expands "Technical details", and
 * that the fix/dismiss outputs emit.
 */
describe('WizardIssueCardComponent', () => {
  let fixture: ComponentFixture<WizardIssueCardComponent>;
  let component: WizardIssueCardComponent;

  const blockingIssue: WizardIssue = {
    code: 'K1',
    severity: 'blocking',
    title: 'A projection column still contains text values',
    why: 'Text values ended up in the feature matrix.',
    fix: 'Set an encoding for that column in Step 3.',
    step: 'features',
    anchorId: 'wizard-anchor-features',
    raw: 'ValueError: could not convert string to float: "abc"',
  };

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardIssueCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardIssueCardComponent);
    component = fixture.componentInstance;
    component.issue = { ...blockingIssue };
    fixture.detectChanges();
  });

  it('renders the everyday title, WHY and FIX visibly', () => {
    const content = text();
    expect(content).toContain(blockingIssue.title);
    expect(content).toContain(blockingIssue.why);
    expect(content).toContain(blockingIssue.fix);
  });

  it('shows the class badge and a Blocking pill for a blocking issue', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.class-badge')?.textContent?.trim()).toBe('K1');
    expect(el.querySelector('.severity-pill')?.textContent?.trim()).toBe('Blocking');
  });

  it('hides the raw technical text until "Technical details" is expanded', () => {
    const el = fixture.nativeElement as HTMLElement;
    const pre = el.querySelector<HTMLElement>('.technical-detail');
    // Collapsed: rendered (so aria-controls resolves) but hidden.
    expect(pre?.hidden).toBe(true);
    expect(el.innerText).not.toContain('could not convert string to float');

    // Expand.
    component.toggleTechnical();
    fixture.detectChanges();

    expect(pre?.hidden).toBe(false);
    expect(pre?.textContent).toContain('could not convert string to float');
  });

  it('exposes the expanded state and the controlled region on the technical toggle', () => {
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector<HTMLButtonElement>('.technical-toggle');
    const pre = el.querySelector<HTMLElement>('.technical-detail');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(pre?.id).toBeTruthy();
    expect(toggle?.getAttribute('aria-controls')).toBe(pre?.id ?? '');

    toggle?.click();
    fixture.detectChanges();

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
  });

  it('hides the decorative icons from assistive technology', () => {
    const icons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.material-icons'));
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach(icon => expect(icon.getAttribute('aria-hidden')).toBe('true'));
  });

  it('does not render the technical toggle when there is no raw detail', () => {
    component.issue = { ...blockingIssue, raw: undefined };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.technical-toggle')).toBeNull();
  });

  it('emits fix with the issue when the "Fix in step N" button is clicked', () => {
    const el = fixture.nativeElement as HTMLElement;
    let emitted: WizardIssue | undefined;
    component.fix.subscribe(i => (emitted = i));
    (el.querySelector('.btn-fix') as HTMLButtonElement).click();
    expect(emitted).toBe(component.issue);
    // The button labels the responsible step with its number and title.
    expect((el.querySelector('.btn-fix') as HTMLElement).textContent).toContain(
      'Fix in step 3 · Configure Data & Features'
    );
  });

  it('derives the step number from the step id of the new layout', () => {
    component.issue = { ...blockingIssue, step: 'appearance' };
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('.btn-fix');
    expect(button?.textContent).toContain('Fix in step 5 · Glyphs & Color');
  });

  it('shows a Dismiss button only for dismissable issues and emits on click', () => {
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.btn-dismiss')).toBeNull();

    component.issue = { ...blockingIssue, dismissable: true };
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;

    let dismissed = false;
    component.dismiss.subscribe(() => (dismissed = true));
    (el.querySelector('.btn-dismiss') as HTMLButtonElement).click();
    expect(dismissed).toBe(true);
  });

  it('uses a custom severity label when provided', () => {
    component.severityLabel = 'Possible issue';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.severity-pill')?.textContent?.trim()).toBe(
      'Possible issue'
    );
  });
});
