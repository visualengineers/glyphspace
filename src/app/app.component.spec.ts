import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { ConfigService } from './services/config.service';
import { DataLoaderService } from './services/data-loader.service';

function createApp(): { app: AppComponent; remove$: Subject<number> } {
  const remove$ = new Subject<number>();
  const config = { removeCanvasSubject$: remove$.asObservable() } as unknown as ConfigService;
  const app = new AppComponent(config, {} as DataLoaderService);
  app.ngOnInit();
  return { app, remove$ };
}

describe('AppComponent canvases', () => {
  it('removes the last canvas with "-" and keeps the ids, and so the state, of the others', () => {
    const { app, remove$ } = createApp();
    app.addCanvas();
    app.addCanvas();
    app.addCanvas(); // ids 0 1 2 3
    remove$.next(1); // ids 0 2 3

    app.removeCanvas();

    expect(app.grid.map(cell => cell.id)).toEqual([0, 2]);
    expect(app.totalCells).toBe(2);
  });

  it('keeps at least one canvas', () => {
    const { app, remove$ } = createApp();

    app.removeCanvas();
    remove$.next(0);

    expect(app.grid.map(cell => cell.id)).toEqual([0]);
  });

  it('shows the other canvases again when the maximised one is removed', () => {
    const { app, remove$ } = createApp();
    app.addCanvas();
    app.toggleMaximize(1);

    remove$.next(1);

    expect(app.maximizedId).toBeNull();
    expect(app.grid.map(cell => cell.id)).toEqual([0]);
  });
});
