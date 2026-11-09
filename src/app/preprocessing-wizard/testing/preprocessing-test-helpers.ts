import type { Mocked } from 'vitest';
import { createSpyObj } from '../../../testing/create-spy-obj';
import { DataLoaderService } from '../../services/data-loader.service';
import { DataProcessorService } from '../../services/data-processor';
import { ToastService } from '../../services/toast.service';
import { PreprocessingService } from '../services/preprocessing.service';

/**
 * A PreprocessingService on stub collaborators, outside Angular DI. The data
 * loader reports no existing dataset names; `dataProcessor` carries only the
 * DataProcessorService members a spec relies on (none by default).
 */
export function createTestPreprocessingService(dataProcessor: object = {}): PreprocessingService {
  const dataLoader = { getDataSetNames: () => [] as string[] } as unknown as DataLoaderService;
  return new PreprocessingService(dataProcessor as DataProcessorService, dataLoader);
}

/**
 * Mount a step's host element in a box laid out like the wizard shell: a
 * fixed-height scroller (`.wizard-content`) around a positioned, flexing step
 * container (`.step-container`). Returns the scroller, so a spec can check that
 * the step fits it without an outer scrollbar. The default height is about the
 * shell's content area in a 1300 px tall window. The caller removes it.
 */
export function mountInShellLayout(stepHost: HTMLElement, height = 800): HTMLElement {
  const scroller = document.createElement('div');
  scroller.style.cssText = `height: ${height}px; width: 1200px; overflow-y: auto; display: flex; flex-direction: column;`;
  const container = document.createElement('div');
  container.style.cssText = 'position: relative; flex: 1; display: flex; flex-direction: column; min-height: 0;';
  stepHost.style.cssText = 'flex: 1; display: flex; flex-direction: column; min-height: 0;';
  container.appendChild(stepHost);
  scroller.appendChild(container);
  document.body.appendChild(scroller);
  return scroller;
}

/**
 * Asserts that `box` ends at the steps' shared bottom edge in a step mounted
 * with mountInShellLayout (only the step's bottom padding and the box's margin
 * lie between it and the area's bottom), and that the step itself does not
 * scroll.
 * - `areaBottom`: bottom of the step's content area; the scroller's bottom by
 *   default, or the top of a button bar the step renders itself (Step 6).
 * - `panels`: the visible boxes inside `box` (e.g. the two panels of a grid);
 *   each must end on the box's bottom edge too, not above it.
 */
export function expectFillsStep(
  scroller: HTMLElement,
  box: HTMLElement | null,
  options: { areaBottom?: number; panels?: Iterable<HTMLElement> } = {}
): void {
  if (!box) throw new Error('main box not rendered');
  const content = box.closest<HTMLElement>('.step-content');
  if (!content) throw new Error('main box is not inside .step-content');
  const areaBottom = options.areaBottom ?? scroller.getBoundingClientRect().bottom;
  const boxBottom = box.getBoundingClientRect().bottom;
  const expectedGap =
    parseFloat(getComputedStyle(content).paddingBottom) + parseFloat(getComputedStyle(box).marginBottom);
  expect(areaBottom - boxBottom).toBeCloseTo(expectedGap, 0);
  for (const panel of options.panels ?? []) {
    expect(Math.abs(panel.getBoundingClientRect().bottom - boxBottom), panel.className).toBeLessThanOrEqual(1);
  }
  expect(scroller.scrollHeight).toBeLessThanOrEqual(scroller.clientHeight);
}

/** A ToastService whose every public method is a mock. */
export function createToastServiceSpy(): Mocked<ToastService> {
  return createSpyObj<ToastService>('ToastService', [
    'show',
    'showUndo',
    'success',
    'error',
    'info',
    'warning',
    'pause',
    'resume',
    'remove',
    'clear',
  ]);
}
