import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';

/** The bundled DruidJS version, named in the LGPL notice; `tools/tests/licenses.test.mjs` checks it. */
export const DRUIDJS_VERSION = '0.9.0';

/**
 * The menu bar's "About" button and the dialog it opens: the app's licence, the source and licence of
 * the bundled data, and the notices for the third-party software the site ships (`licenses/`,
 * `pyodide/THIRD-PARTY-LICENSES.txt`, `3rdpartylicenses.txt`).
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly druidVersion = DRUIDJS_VERSION;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  /** A click on the backdrop reaches the dialog element itself; the content fills the dialog's box. */
  onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }
}
