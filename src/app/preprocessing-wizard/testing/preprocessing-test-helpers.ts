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
