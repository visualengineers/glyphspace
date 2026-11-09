import {
  LAST_STEP_INDEX,
  WIZARD_STEPS,
  WizardStepId,
  getStepInfo,
  stepIdAt,
  stepIndex,
  stepLabel,
  stepNumber,
} from './step-info';

describe('wizard step registry', () => {
  const ORDER: WizardStepId[] = ['upload', 'columns', 'features', 'projection', 'appearance', 'review'];

  it('lists the six steps in wizard order', () => {
    expect(WIZARD_STEPS.map(step => step.id)).toEqual(ORDER);
    expect(LAST_STEP_INDEX).toBe(5);
  });

  it('gives every step a title and a purpose', () => {
    WIZARD_STEPS.forEach(step => {
      expect(step.title.trim(), step.id).not.toBe('');
      expect(step.purpose.trim(), step.id).not.toBe('');
    });
  });

  it('titles the split visualization steps "Projection" and "Glyphs & Color"', () => {
    expect(getStepInfo('projection').title).toBe('Projection');
    expect(getStepInfo('appearance').title).toBe('Glyphs & Color');
    expect(getStepInfo('review').title).toBe('Review & Process');
  });

  it('describes the upload step as CSV only (the only accepted format)', () => {
    const purpose = getStepInfo('upload').purpose;
    expect(purpose).toContain('CSV');
    expect(purpose).not.toMatch(/parquet/i);
  });

  it('maps ids to indices and back', () => {
    ORDER.forEach((id, index) => {
      expect(stepIndex(id)).toBe(index);
      expect(stepIdAt(index)).toBe(id);
    });
  });

  it('returns null for an index outside the registry', () => {
    expect(stepIdAt(-1)).toBeNull();
    expect(stepIdAt(6)).toBeNull();
  });

  it('numbers steps from 1 for display', () => {
    expect(stepNumber('upload')).toBe(1);
    expect(stepNumber('projection')).toBe(4);
    expect(stepNumber('appearance')).toBe(5);
    expect(stepNumber('review')).toBe(6);
  });

  it('builds "Step N (Title)" references', () => {
    expect(stepLabel('projection')).toBe('Step 4 (Projection)');
    expect(stepLabel('appearance')).toBe('Step 5 (Glyphs & Color)');
  });

  it('throws for an unknown id instead of returning a wrong step', () => {
    expect(() => getStepInfo('visualization' as WizardStepId)).toThrowError(/Unknown wizard step/);
  });
});
