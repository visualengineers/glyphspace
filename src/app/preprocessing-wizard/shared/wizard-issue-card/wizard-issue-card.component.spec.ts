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
    step: 2,
    anchorId: 'wizard-anchor-columns',
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
    // Collapsed: the raw text is not in the DOM at all.
    expect(el.querySelector('.technical-detail')).toBeNull();
    expect(text()).not.toContain('could not convert string to float');

    // Expand.
    component.toggleTechnical();
    fixture.detectChanges();

    const pre = el.querySelector('.technical-detail');
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('could not convert string to float');
  });

  it('does not render the technical toggle when there is no raw detail', () => {
    component.issue = { ...blockingIssue, raw: undefined };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.technical-toggle')).toBeNull();
  });

  it('emits fix with the issue when the "Fix in Schritt N" button is clicked', () => {
    const el = fixture.nativeElement as HTMLElement;
    let emitted: WizardIssue | undefined;
    component.fix.subscribe(i => (emitted = i));
    (el.querySelector('.btn-fix') as HTMLButtonElement).click();
    expect(emitted).toBe(component.issue);
    // The button labels the responsible step (step index 2 → "Schritt 3").
    expect((el.querySelector('.btn-fix') as HTMLElement).textContent).toContain('Schritt 3');
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
