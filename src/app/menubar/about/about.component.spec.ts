import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent, DRUIDJS_VERSION } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let element: HTMLElement;

  const dialog = () => element.querySelector('dialog') as HTMLDialogElement;
  const links = () => Array.from(dialog().querySelectorAll('a')).map(a => a.getAttribute('href'));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (dialog().open) dialog().close();
  });

  it('opens the dialog from the menu bar button and closes it again', () => {
    expect(dialog().open).toBe(false);

    (element.querySelector('.about-btn') as HTMLButtonElement).click();
    expect(dialog().open).toBe(true);

    (dialog().querySelector('.close-btn') as HTMLButtonElement).click();
    expect(dialog().open).toBe(false);
  });

  it('closes on a click on the backdrop but not on its content', () => {
    fixture.componentInstance.open();

    (dialog().querySelector('.about-content') as HTMLElement).click();
    expect(dialog().open).toBe(true);

    dialog().click();
    expect(dialog().open).toBe(false);
  });

  it('names the DruidJS version and links its source and licence texts', () => {
    const notice = dialog().querySelector('.licence-druid')?.textContent ?? '';
    expect(notice).toContain(`DruidJS ${DRUIDJS_VERSION}`);
    expect(notice).toContain('LGPL');
    expect(links()).toContain(`https://github.com/saehm/DruidJS/tree/v${DRUIDJS_VERSION}`);
    expect(links()).toContain('licenses/README.txt');
  });

  it('attributes the wine data with its licence and says it was modified', () => {
    const text = dialog().querySelector('.data-wine')?.textContent ?? '';
    expect(text).toContain('Cortez');
    expect(text).toContain('CC BY 4.0');
    expect(text).toContain('Modified');
    expect(links()).toContain('https://creativecommons.org/licenses/by/4.0/');
  });

  it('links the licences of Pyodide, the Python packages and the bundled npm packages', () => {
    expect(links()).toEqual(expect.arrayContaining(['pyodide/THIRD-PARTY-LICENSES.txt', '3rdpartylicenses.txt']));
  });
});
