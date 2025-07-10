import { Component, ElementRef, EventEmitter, inject, Input, NgZone, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { ConfigService } from '../services/config.service';
import { GlyphObject } from '../glyph/glyph-object';
import { DataProviderService } from '../services/dataprovider.service';
import { drawFlowerGlyph, drawRadarChart, drawWhiskerGlyph, hexToRgb } from '../shared/helpers/d3-helper';
import { DataTabComponent } from './tabs/data-tab/data-tab.component';
import { GlyphsTabComponent } from './tabs/glyphs-tab/glyphs-tab.component';
import { FilterTabComponent } from './tabs/filter-tab/filter-tab.component';
import { GlyphType } from '../shared/enum/glyph-type';
import { DataProcessorService } from '../services/data-processor';
import { DatasetCollection } from '../shared/interfaces/dataset-collection';
import { LoggerService } from '../services/logger-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DataTabComponent, GlyphsTabComponent, FilterTabComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('dashboard') dashboard?: ElementRef;
  @ViewChild('dashboardBody') dashboardBody?: ElementRef;
  @ViewChild('glyphCanvas') glyphCanvas?: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('icon') icon?: ElementRef;

  @Input() isOpen!: boolean;
  @Input() glyphData: GlyphObject[] = [];
  @Input() totalCells: number = 0;

  @Output() addCanvas = new EventEmitter<void>();
  @Output() removeCanvas = new EventEmitter<void>();

  dataProvider: DataProviderService

  private configSub = new Subscription();
  private ngZone!: NgZone;

  private fullWidth = 350;
  private iconWidth = 40;
  uploading = false;
  activeTab: 'data' | 'glyphs' | 'filter' = 'data';
  colorScaleType: 'categorical' | 'ordinal' = 'ordinal';
  glyphContext!: CanvasRenderingContext2D;
  lastGlyph: GlyphObject | null = null;
  colorFeature = "";
  result: any;

  constructor(private logger: LoggerService, private config: ConfigService, private dataProcessor: DataProcessorService) {
    this.dataProvider = inject(DataProviderService);
    this.ngZone = inject(NgZone);
  }

  ngAfterViewInit() {
    this.configSub.add(
      this.config.glyphConfigSubject$.subscribe(() => {
        this.ngZone.run(() => {
          const newFeature = this.config.featureLabels[this.config.colorFeature];
          if (newFeature) this.colorFeature = newFeature;
        });

        if (this.lastGlyph == null) return;
        this.drawLegendGlyph(this.lastGlyph);
      })
    );
    this.configSub.add(
      this.config.animateGlyphSubject$.subscribe(glyph => {
        if (glyph == null) return;

        this.drawLegendGlyph(glyph);
      })
    );
    this.configSub.add(
      this.config.loadedDataSubject$.subscribe(async data => {
        const schema = await this.dataProvider.getSchema();
        this.ngZone.run(() => {
          if (schema) this.colorFeature = schema.label[this.config.colorFeature];
        });
        this.drawLegendGlyph(null);
      })
    );

    this.setupGlyphCanvas();
  }

  ngOnDestroy(): void {
    this.configSub.unsubscribe();
  }

  private setupGlyphCanvas() {
    const canvas = this.glyphCanvas?.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    const dpr = window.devicePixelRatio || 1;

    // Define the *logical* size you want the canvas to be (CSS pixels)
    const logicalWidth = 600;
    const logicalHeight = 400;

    // Set physical pixel size scaled by DPR
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;

    // Set CSS size so it looks correct on screen
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    // Scale the drawing context
    context.scale(dpr, dpr);
  }

  async drawLegendGlyph(glyph: GlyphObject | null) {
    if (glyph == null) {
      const data = await this.dataProvider.getGlyphData();
      if (data) glyph = data[Math.floor(Math.random() * data.length)];
    }

    if (glyph == null) return;

    const currentColor = this.config.getRgbaColor(glyph.features);

    const element = this.glyphCanvas?.nativeElement;
    this.glyphContext = element.getContext('2d');

    // Get the device pixel ratio
    const ratio = window.devicePixelRatio || 1;
    this.glyphContext.save();
    this.glyphContext.clearRect(0, 0, 350 * ratio, 180 * ratio);

    if (this.config.getConfiguration().glyphType == GlyphType.Star) {
      drawRadarChart(this.glyphContext, 50, currentColor, glyph, this.config.activeFeatures, this.config.featureLabels, this.config.getConfiguration());
    } else if (this.config.getConfiguration().glyphType == GlyphType.Whisker) {
      drawWhiskerGlyph(this.glyphContext, 50, currentColor, glyph, this.config.activeFeatures, this.config.featureLabels, this.config.getConfiguration());
    } else {
      drawFlowerGlyph(this.glyphContext, 50, currentColor, glyph, this.config.activeFeatures, this.config.featureLabels, this.config.getConfiguration());
    }

    this.glyphContext.restore();

    this.lastGlyph = glyph;
  }

  fitAll() {
    this.config.toggleFitToScreen();
  }

  clearSelection() {
    this.dataProvider.clearFilters();
    this.config.clearSelection();
  }

  toggleColorScale(): void {
    this.colorScaleType = this.colorScaleType === 'categorical' ? 'ordinal' : 'categorical';
    this.config.colorRange = !this.config.colorRange;
    this.config.redraw();
  }

  async onFileSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading = true;

    try {
      if (file.type == "application/zip") {
        await this.dataProcessor.unzip(file);
      } else if (file.type == "text/csv") {
        const dataset: DatasetCollection = await this.dataProcessor.process(file);
        this.dataProvider.setDatasetCollection(dataset);
      }
    } catch (err) {
      this.logger.error('File processing failed', err);
    } finally {
      this.uploading = false;
      this.fileInput.nativeElement.value = '';      // allow same file re‑choose
    }
  }

  upload() {
    throw new Error('Method not implemented.');
  }

  download() {
    throw new Error('Method not implemented.');
  }

  showHelp() {
    window.open('https://visualengineers.github.io/glyphboard-doc/', '_blank');
  }

  toggle(): void {
    const dash = d3.select(this.dashboard?.nativeElement);
    const dashBody = d3.select(this.dashboardBody?.nativeElement);

    if (this.isOpen) {
      // Hide body (visually and interaction-wise)
      dashBody
        .style('position', 'absolute')         // pull it out of layout
        .style('pointer-events', 'none')
        .style('opacity', '0')
        .transition()
        .duration(300)
        .style('top', '0')                     // necessary if using absolute
        .style('left', '0')
        .style('width', '100%');

      dash
        .transition()
        .duration(300)
        .style('width', `${this.iconWidth}px`)
        .on('end', () => {
          this.isOpen = false;
        });

    } else {
      // Prepare body before fade-in
      dashBody
        .style('opacity', '0')
        .style('position', 'relative')          // put it back in layout
        .style('pointer-events', 'auto')
        .style('top', null)
        .style('left', null)
        .style('width', null);

      dash
        .transition()
        .duration(300)
        .style('width', `${this.fullWidth}px`)
        .on('end', () => {
          dashBody
            .transition()
            .duration(200)
            .style('opacity', '1');

          this.isOpen = true;
        });
    }
  }
}
