import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressStepperComponent, Step } from './progress-stepper.component';

describe('ProgressStepperComponent', () => {
  let fixture: ComponentFixture<ProgressStepperComponent>;
  let component: ProgressStepperComponent;
  let el: HTMLElement;

  const STEPS: Step[] = [
    { label: 'Upload Data', description: 'Upload your CSV file', summary: 'wine.csv · 1,599 rows', completed: true },
    { label: 'Select Columns', description: 'Choose columns', summary: '11 of 12 columns', completed: true },
    { label: 'Configure', description: 'Configure each column', summary: '11 columns configured', completed: false },
    { label: 'Projection', description: 'Pick methods', summary: '', completed: false },
  ];

  function render(currentStep: number, steps: Step[] = STEPS): void {
    component.steps = steps;
    component.currentStep = currentStep;
    fixture.detectChanges();
  }

  function buttons(): HTMLButtonElement[] {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('ol > li > button.step'));
  }

  function nameOf(button: HTMLButtonElement): string {
    const id = button.getAttribute('aria-labelledby') ?? '';
    return (document.getElementById(id)?.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProgressStepperComponent] });
    fixture = TestBed.createComponent(ProgressStepperComponent);
    component = fixture.componentInstance;
    component.vertical = true;
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the steps as an ordered list of buttons inside a labelled nav', () => {
    render(2);
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Wizard steps');
    expect(buttons().length).toBe(4);
    buttons().forEach(b => expect(b.type).toBe('button'));
  });

  it('marks only the current step with aria-current="step"', () => {
    render(2);
    expect(buttons().map(b => b.getAttribute('aria-current'))).toEqual([null, null, 'step', null]);
  });

  it('disables unreachable steps so they are no Tab stops', () => {
    render(
      1,
      STEPS.map((s, i) => ({ ...s, completed: i === 0 }))
    );
    // Reachable: up to the current step, completed steps, and the step after the last completed one.
    expect(buttons().map(b => b.disabled)).toEqual([false, false, true, true]);
  });

  it('emits the index of a reachable step on click', () => {
    render(2);
    const clicked: number[] = [];
    component.stepClick.subscribe((i: number) => clicked.push(i));
    buttons()[0].click();
    expect(clicked).toEqual([0]);
  });

  it('adds a visually hidden "(completed)" to completed steps and hides the check icon', () => {
    render(2);
    expect(nameOf(buttons()[0])).toBe('Upload Data (completed)');
    expect(nameOf(buttons()[2])).toBe('Configure');
    expect(buttons()[0].querySelector('.visually-hidden')?.textContent?.trim()).toBe('(completed)');
    expect(buttons()[0].querySelector('.step-circle')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the summary under completed steps and the purpose for the current one', () => {
    render(2);
    const detail = (i: number): string => buttons()[i].querySelector('.step-description')?.textContent?.trim() ?? '';
    expect(detail(0)).toBe('wine.csv · 1,599 rows');
    expect(detail(1)).toBe('11 of 12 columns');
    expect(detail(2)).toBe('Configure each column');
    expect(buttons()[0].querySelector('.step-summary')).not.toBeNull();
    expect(buttons()[2].querySelector('.step-summary')).toBeNull();
  });

  it('keeps the purpose for a completed step while it is the current one', () => {
    render(0);
    expect(buttons()[0].querySelector('.step-description')?.textContent?.trim()).toBe('Upload your CSV file');
  });

  it('describes each button by its detail line', () => {
    render(2);
    const button = buttons()[0];
    const detailId = button.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(detailId)?.textContent?.trim()).toBe('wine.csv · 1,599 rows');
  });
});
