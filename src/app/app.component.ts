import { Component, ElementRef, HostListener, NgZone, OnChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { ConfigService } from './services/config.service';
import { GlyphCanvasComponent } from './canvas/glyph-canvas.component';
import { CommonModule } from '@angular/common';
import { DataProviderService } from './services/dataprovider.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { checkTextInput } from './shared/helpers/angular-helper';

interface GlyphCanvasItem { id: number, row: number, col: number }

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, GlyphCanvasComponent, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnChanges {
  title = 'Glyphboard Royale';
  @ViewChild('canvasGrid', { static: true }) canvasContainer!: ElementRef;
  @ViewChild(DashboardComponent) dashboardComponent!: DashboardComponent;

  grid: GlyphCanvasItem[] = [];
  totalCells = 1;
  rows = 1;
  cols = 1;
  readonly minCellSize = 150; // px — change as needed

  constructor(private config: ConfigService, private dataProvider: DataProviderService) { }

  ngOnInit() {
    this.recalculateGrid();
  }

  ngOnChanges(): void {
  }

  updateGrid() {
    this.grid = [];
    let idCounter = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid.push({
          id: idCounter++,
          row: r,
          col: c
        });
      }
    }
  }

  recalculateGrid() {
    const approxRoot = Math.sqrt(this.totalCells);
    this.rows = Math.floor(approxRoot);
    this.cols = Math.ceil(this.totalCells / this.rows);
    this.updateGrid();
    // this.dataProvider.getDataSet().forEach(glyph => {
    //   glyph.setHighlighted(false);
    // });
  }

  trackById(index: number, item: GlyphCanvasItem): number {
    return item.id;
  }

  addCanvas() {
    if (this, this.totalCells < 5) {
      this.totalCells++;
      this.recalculateGrid();
    }
  }

  removeCanvas() {
    if (this.totalCells > 1) {
      this.totalCells--;
      this.recalculateGrid();
    }
  }

  @HostListener('window:resize')
  onResize() {
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (checkTextInput(event)) return;
    
    if (event.key === '+') {
      this.addCanvas();
    } else if (event.key === '-') {
      this.removeCanvas();
    } else if (event.key.toLocaleLowerCase() === 'm') {
      this.dashboardComponent.toggle();
    }
  }
}
