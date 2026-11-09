import type { Mock } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SAMPLE_DATA_URL, SAMPLE_FILE_NAME, SAMPLE_LOAD_ERROR, Step1UploadComponent } from './step1-upload.component';
import { PreprocessingService } from '../../services/preprocessing.service';
import { ToastService } from '../../../services/toast.service';
import { DataProfile } from '../../models/column-statistics';
import { PreprocessingState } from '../../models/preprocessing-state';
import { createTestPreprocessingService } from '../../testing/preprocessing-test-helpers';

describe('Step1UploadComponent', () => {
  let fixture: ComponentFixture<Step1UploadComponent>;
  let service: PreprocessingService;
  let toast: ToastService;
  let profileData: Mock;
  let el: HTMLElement;

  const PROFILE: DataProfile = {
    fileName: SAMPLE_FILE_NAME,
    fileSize: 2048,
    totalRows: 1599,
    totalColumns: 13,
    columns: [],
    qualityScore: 100,
    duplicateCount: 0,
    previewRows: [],
  };

  function query<T extends HTMLElement>(selector: string): T {
    const found = el.querySelector<T>(selector);
    if (!found) throw new Error(`${selector} not rendered`);
    return found;
  }

  /** Response stand-in whose body resolves on a zone-tracked promise (a real body streams natively). */
  function csvResponse(status = 200): Response {
    const blob = new Blob(['ID,alcohol\n0,9.4\n'], { type: 'text/csv' });
    return { ok: status >= 200 && status < 300, status, blob: () => Promise.resolve(blob) } as unknown as Response;
  }

  /** Waits until the upload finished (File.arrayBuffer() resolves outside zone tracking). */
  async function settle(): Promise<void> {
    const deadline = Date.now() + 3000;
    while (fixture.componentInstance.isLoading) {
      if (Date.now() > deadline) throw new Error('upload did not finish');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.clear();
    profileData = vi.fn().mockResolvedValue(PROFILE);
    service = createTestPreprocessingService({ profileData, pruneFiles: () => Promise.resolve() });
    toast = new ToastService();

    await TestBed.configureTestingModule({
      imports: [Step1UploadComponent],
      providers: [
        { provide: PreprocessingService, useValue: service },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Step1UploadComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    toast.clear();
    localStorage.clear();
  });

  it('makes "Browse Files" a real button that opens the hidden file picker', () => {
    const browse = query<HTMLButtonElement>('button.upload-button');
    const input = query<HTMLInputElement>('input[type="file"]');
    const pick = vi.spyOn(input, 'click').mockImplementation(() => undefined);

    browse.click();

    expect(browse.type).toBe('button');
    expect(browse.textContent?.trim()).toBe('Browse Files');
    expect(pick).toHaveBeenCalledTimes(1);
    expect(input.accept).toContain('.csv');
  });

  it('announces errors with role="alert" and the loading state with role="status"', () => {
    const component = fixture.componentInstance;
    component.error = 'Please upload a CSV file.';
    component.isLoading = true;
    fixture.detectChanges();

    expect(query('.error-message').getAttribute('role')).toBe('alert');
    expect(query('.loading-state').getAttribute('role')).toBe('status');
  });

  it('rejects non-CSV files with a visible error', async () => {
    const input = query<HTMLInputElement>('input[type="file"]');
    const file = new File(['x'], 'data.parquet');
    Object.defineProperty(input, 'files', { value: [file] });

    input.dispatchEvent(new Event('change'));
    await settle();

    expect(query('.error-message').textContent).toContain('Please upload a CSV file.');
    expect(profileData).not.toHaveBeenCalled();
  });

  it('shows the sample data source attribution', () => {
    expect(query('.sample-attribution').textContent?.trim()).toBe(
      'Sample: Wine Quality (red), P. Cortez et al., UCI Machine Learning Repository, CC BY 4.0'
    );
  });

  it('feeds the sample CSV through the same path as a user upload', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(csvResponse());
    const loadCSV = vi.spyOn(service, 'loadCSV');

    query<HTMLButtonElement>('.btn-sample').click();
    await settle();

    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(SAMPLE_DATA_URL);
    const file = loadCSV.mock.lastCall?.[0];
    expect(file?.name).toBe(SAMPLE_FILE_NAME);
    expect(file?.type).toBe('text/csv');
    expect(fixture.componentInstance.profile).toEqual(PROFILE);
    expect(query('.profile-title h3').textContent).toContain('Data Loaded Successfully');
  });

  it('offers an undo toast when the sample replaces an already loaded file', async () => {
    (service as unknown as { updateState(u: Partial<PreprocessingState>): void }).updateState({
      dataProfile: { ...PROFILE, fileName: 'mine.csv' },
    });
    fixture.detectChanges();
    vi.spyOn(window, 'fetch').mockResolvedValue(csvResponse());
    const undoToast = vi.spyOn(toast, 'showUndo').mockImplementation(() => undefined);

    fixture.componentInstance.chooseDifferentFile();
    fixture.detectChanges();
    query<HTMLButtonElement>('.btn-sample').click();
    await settle();

    expect(undoToast).toHaveBeenCalledExactlyOnceWith('File replaced', expect.any(Function));
  });

  it('shows an error when the sample cannot be downloaded', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(csvResponse(404));
    const loadCSV = vi.spyOn(service, 'loadCSV').mockResolvedValue(PROFILE);

    query<HTMLButtonElement>('.btn-sample').click();
    await settle();

    expect(loadCSV).not.toHaveBeenCalled();
    expect(fixture.componentInstance.isLoading).toBe(false);
    const error = query('.error-message');
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain(SAMPLE_LOAD_ERROR);
  });

  it('names its help icons after their topic', () => {
    expect(query('.requirements .help-icon').getAttribute('aria-label')).toBe('Help: File requirements');
  });

  it('hides decorative Material icons from assistive technology', () => {
    const icons = Array.from(el.querySelectorAll('.material-icons'));
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach(icon => expect(icon.getAttribute('aria-hidden'), icon.textContent ?? '').toBe('true'));
  });
});
