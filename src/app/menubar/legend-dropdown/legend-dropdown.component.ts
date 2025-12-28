import { Component, ElementRef, inject, Input, NgZone, ViewChild } from '@angular/core';
import { LoggerService } from '../../services/logger-service';
import { ConfigService } from '../../services/config.service';
import { DataProcessorService } from '../../services/data-processor';
import { DataProviderService } from '../../services/dataprovider.service';
import { Subscription } from 'rxjs';
import { drawFlowerGlyph, drawRadarChart, drawWhiskerGlyph, hexToRgb } from '../../shared/helpers/d3-helper';
import { GlyphObject } from '../../glyph/glyph-object';
import { GlyphType } from '../../shared/enum/glyph-type';
import { TextFilter } from '../../shared/filter/text-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeaturesData } from '../../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../../shared/interfaces/glyph-schema';
import { HistogramComponent } from '../histogram/histogram.component';

@Component({
  selector: 'app-legend-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, HistogramComponent],
  templateUrl: './legend-dropdown.component.html',
  styleUrls: ['./legend-dropdown.component.scss'],
})
export class LegendDropdownComponent {
  @ViewChild('glyphCanvas') glyphCanvas?: ElementRef;

  @Input() open = false;
  @Input() width = 360;

  dataProvider: DataProviderService
  config: ConfigService

  glyphContext!: CanvasRenderingContext2D;
  lastGlyph: GlyphObject | null = null;
  colorFeature = "";

  searchTerm = "";
  searchTerms: string[] = [];
  inputFocused = false;
  private textFilter = new TextFilter();

  features: FeaturesData = {};
  featureIds: string[] = [];
  schema?: GlyphSchema;

  private configSub = new Subscription();
  private ngZone!: NgZone;

  constructor(private logger: LoggerService, private dataProcessor: DataProcessorService) {
    this.dataProvider = inject(DataProviderService);
    this.config = inject(ConfigService),
      this.ngZone = inject(NgZone);

    this.config.loadedDataSubject$.subscribe(async data => {
      if (data == "") return;

      const metaData = await this.dataProvider.getMetaData();
      this.schema = await this.dataProvider.getSchema();
      if (metaData?.features) {
        this.ngZone.run(() => {
          this.features = metaData.features;
          this.featureIds = Object.keys(this.features);
        });
      }
    });
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
    this.glyphContext.clearRect(0, 0, 328 * ratio, 180 * ratio);

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

  updateTextFilter() {
    const pos = this.dataProvider.getFilters().indexOf(this.textFilter);
    if (pos < 0) {
      this.textFilter.filterMode = FilterMode.And;
      this.dataProvider.getFilters().push(this.textFilter);
    }
    this.textFilter.clear();
    if (this.searchTerms.length > 0) {
      this.textFilter.extendacceptableStrings(this.searchTerms);
    }
    this.dataProvider.refreshFilters();
    this.config.redraw();
  }

  onSearchEnter(): void {
    if (!this.searchTerms.includes(this.searchTerm.trim())) {
      this.searchTerms.push(this.searchTerm.trim());
    }
    this.searchTerm = '';
    this.inputFocused = true;
    this.updateTextFilter();
  }

  clearSearch(input: HTMLInputElement): void {
    this.searchTerm = '';
    this.searchTerms.splice(0, this.searchTerms.length);
    input.focus();
    this.updateTextFilter();
  }

  removeTerm(index: number): void {
    this.searchTerms.splice(index, 1);
    this.updateTextFilter();
  }

  onFocus(): void {
    this.inputFocused = true;
  }

  onBlur(): void {
    // Optional delay to allow button clicks before hiding
    setTimeout(() => this.inputFocused = false, 150);
  }

  trackByFeatureId(index: number, featureId: string): string {
    return featureId;
  }

  getFeatureName(id: string) {
    return this.schema?.label[id] || "";
  }
}
