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
