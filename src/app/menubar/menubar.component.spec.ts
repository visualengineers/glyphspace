import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MenuBarComponent } from './menubar.component';
import { DataLoaderService } from '../services/data-loader.service';
import { FilterService } from '../services/filter.service';
import { DataExportService } from '../services/data-export.service';
import { ConfigService } from '../services/config.service';

/** The menubar hosts the wizard dialog: opening, closing and returning focus (WCAG 2.4.3). */
describe('MenuBarComponent – wizard dialog host', () => {
  let fixture: ComponentFixture<MenuBarComponent>;
  let el: HTMLElement;
  const config = { modalOpen: false, loadedDataSubject$: new BehaviorSubject('') };

  function uploadButton(): HTMLButtonElement {
    const button = Array.from(el.querySelectorAll<HTMLButtonElement>('.icon-panel button')).find(b =>
      b.textContent?.includes('Upload')
    );
    if (!button) throw new Error('Upload button not rendered');
    return button;
  }

  beforeEach(async () => {
    config.modalOpen = false;
    await TestBed.configureTestingModule({
      imports: [MenuBarComponent],
      providers: [
        { provide: DataLoaderService, useValue: { dataSetCollectionSubject$: new BehaviorSubject([]) } },
        { provide: FilterService, useValue: {} },
        { provide: DataExportService, useValue: {} },
        { provide: ConfigService, useValue: config },
      ],
    })
      .overrideComponent(MenuBarComponent, { set: { imports: [FormsModule], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();
    fixture = TestBed.createComponent(MenuBarComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('announces that the Upload button opens a dialog', () => {
    expect(uploadButton().getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens the wizard overlay from the Upload button', () => {
    uploadButton().click();
    fixture.detectChanges();

    expect(fixture.componentInstance.showWizard).toBe(true);
    expect(config.modalOpen).toBe(true);
    expect(el.querySelector('.wizard-overlay')).not.toBeNull();
  });

  it('returns focus to the Upload button when the wizard closes', () => {
    // On narrow layouts Upload sits in the collapsible menu, which the user opened to reach it.
    fixture.componentInstance.menuOpen = true;
    fixture.detectChanges();
    uploadButton().click();
    fixture.detectChanges();
    (document.activeElement as HTMLElement | null)?.blur();

    fixture.componentInstance.closePreprocessingWizard();
    fixture.detectChanges();

    expect(fixture.componentInstance.showWizard).toBe(false);
    expect(config.modalOpen).toBe(false);
    expect(document.activeElement).toBe(uploadButton());
  });

  it('hides the decorative icons from assistive technology', () => {
    const icons = Array.from(el.querySelectorAll('.material-icons'));
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach(icon => expect(icon.getAttribute('aria-hidden'), icon.textContent ?? '').toBe('true'));
  });
});
