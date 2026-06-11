import { Component, HostListener, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ConfigService } from './services/config.service';
import { GlyphCanvasComponent } from './canvas/glyph-canvas.component';
import { DataLoaderService } from './services/data-loader.service';
import { checkTextInput } from './shared/helpers/angular-helper';
import { MenuBarComponent } from './menubar/menubar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface GlyphCanvasItem {
  id: number;
  row: number;
  col: number;
}

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [GlyphCanvasComponent, MenuBarComponent, ToastComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Glyphboard Royale';
  @ViewChild(GlyphCanvasComponent) glyphCanvas!: GlyphCanvasComponent;

  grid: GlyphCanvasItem[] = [];
  totalCells = 1;
  rows = 1;
  cols = 1;
  maximizedId: number | null = null;
  readonly minCellSize = 150; // px — change as needed

  constructor(
    private config: ConfigService,
    private dataLoader: DataLoaderService
  ) {}

  ngOnInit() {
    this.recalculateGrid();
    this.updateGrid();

    this.config.removeCanvasSubject$.subscribe(change => {
      if (this.totalCells > 1) {
        this.totalCells--;

        const canvas = this.grid.find(c => c.id === change);
        if (canvas) {
          this.grid.splice(this.grid.indexOf(canvas), 1);
          this.recalculateGrid();
        }
      }
    });
  }

  ngAfterViewInit() {
    const driverObj = driver({
      showProgress: true,
      onDestroyStarted: () => {
        this.glyphCanvas.tutorialActive = false;
        driverObj.destroy();
      },
      steps: [
        {
          element: '[data-tour="data-menu"]',
          popover: {
            title: 'Schritt 1: Datensatz auswählen',
            description: 'Über dieses Menü kann zwischen Datensätzen gewechselt werden.',
            side: 'bottom',
          },
        },
        {
          element: '[data-tour="glyph-type"]',
          popover: {
            title: 'Schritt 2: Glyph-Typ wechseln',
            description: 'Hier kann die Darstellungsform der Glyphen geändert werden.',
            side: 'left',
          },
        },
        {
          element: '[data-tour="legend"]',
          popover: {
            title: 'Schritt 3: Legende verstehen',
            description: 'Die Legende zeigt, welche Datenattribute über Farben und Formen dargestellt werden.',
            side: 'left',
          },
        },
        {
          element: '[data-tour="legend"]',
          popover: {
            title: 'Schritt 4: Filter nutzen',
            description: 'Nutze die Filter, um bestimmte Datenbereiche gezielt hervorzuheben.',
            side: 'left',
          },
        },
      ],
    });

    this.glyphCanvas.tutorialActive = true;
    driverObj.drive();
  }

  getNextFreeId(grid: GlyphCanvasItem[]): number {
    const usedIds = new Set(grid.map(item => item.id));

    let id = 0;
    while (usedIds.has(id)) {
      id++;
    }

    return id;
  }

  updateGrid() {
    this.grid = [];
    let idCounter = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid.push({
          id: idCounter++,
          row: r,
          col: c,
        });
      }
    }
  }

  recalculateGrid() {
    const approxRoot = Math.sqrt(this.totalCells);
    this.rows = Math.floor(approxRoot);
    this.cols = Math.ceil(this.totalCells / this.rows);
  }

  trackById(index: number, item: GlyphCanvasItem): number {
    return item.id;
  }

  addCanvas() {
    if (this.totalCells < 4) {
      this.totalCells++;

      const newId = this.getNextFreeId(this.grid);

      const index = this.grid.length;
      const r = Math.floor(index / this.cols) + 1;
      const c = (index % this.cols) + 1;

      this.grid.push({
        id: newId,
        row: r,
        col: c,
      });

      this.recalculateGrid();
    }
  }

  removeCanvas() {
    if (this.totalCells > 1) {
      this.totalCells--;
      this.recalculateGrid();
      this.updateGrid();
    }
  }

  toggleMaximize(id: number) {
    this.maximizedId = this.maximizedId === id ? null : id;
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (checkTextInput(event)) return;

    if (event.key === '+') {
      this.addCanvas();
    } else if (event.key === '-') {
      this.removeCanvas();
    }
  }
}
