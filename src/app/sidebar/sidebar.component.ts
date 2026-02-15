import { Component, ElementRef, HostBinding, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ConfigService } from '../services/config.service';
import { DataProviderService } from '../services/dataprovider.service';
import { LoggerService } from '../services/logger-service';

import { GlyphObject } from '../glyph/glyph-object';
import { GlyphType } from '../shared/enum/glyph-type';
import { GlyphConfiguration } from '../glyph/glyph-configuration';
import { drawFlowerGlyph, drawRadarChart, drawWhiskerGlyph } from '../shared/helpers/d3-helper';

import { TextFilter } from '../shared/filter/text-filter';
import { FilterMode } from '../shared/enum/filter-mode';

import { FeaturesData } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import {
  COLOR_SCALES, ColorScale, buildGroupedColorScales,
  getContinuousGradient as continuousGradientFn,
  getCategoricalColors as categoricalColorsFn
} from '../shared/interfaces/color-scale';

import { HistogramComponent } from '../menubar/histogram/histogram.component';

export type AccordionSection = 'appearance' | 'filters';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, HistogramComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @HostBinding('class.collapsed') collapsed = false;

  // --- Accordion state ---
  appearanceOpen = false;
  filtersOpen = true;

  // --- Glyph preview ---
  private glyphCanvas?: HTMLCanvasElement;
  private glyphContext?: CanvasRenderingContext2D;
  private currentGlyph: GlyphObject | null = null;

  @ViewChild('glyphCanvas') set glyphCanvasRef(ref: ElementRef | undefined) {
    if (ref) {
      this.glyphCanvas = ref.nativeElement;
      this.setupGlyphCanvas();
      this.drawGlyphPreview();
    } else {
      this.glyphCanvas = undefined;
      this.glyphContext = undefined;
    }
  }

  // --- Legend section ---
  colorFeature = '';
  searchTerm = '';
  searchTerms: string[] = [];
  inputFocused = false;
  private textFilter = new TextFilter();

  features: FeaturesData = {};
  featureIds: string[] = [];
  schema?: GlyphSchema;

  // --- Color section ---
  colorScales: ColorScale[] = COLOR_SCALES;
  getContinuousGradient = continuousGradientFn;
  getCategoricalColors = categoricalColorsFn;
  groupedColorScales: { group: string; scales: ColorScale[] }[] = [];
  selectedColorAttribute = '';
  colorScaleDropdownOpen = false;
  selectedColorScaleId = COLOR_SCALES[0].id;

  // --- Glyph section ---
  glyphConfig = new GlyphConfiguration();
  GlyphType = GlyphType;

  private subs = new Subscription();
  private ngZone = inject(NgZone);

  constructor(
    public config: ConfigService,
    public dataProvider: DataProviderService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.groupedColorScales = buildGroupedColorScales(this.colorScales);

    this.subs.add(
      this.config.loadedDataSubject$.subscribe(async data => {
        if (data === '') return;

        const metaData = await this.dataProvider.getMetaData();
        this.schema = await this.dataProvider.getSchema();
        if (metaData?.features) {
          this.ngZone.run(() => {
            this.features = metaData.features;
            this.featureIds = Object.keys(this.features);
            this.selectedColorAttribute = this.config.colorFeature;
            this.selectedColorScaleId = this.config.colorRange;
          });
        }

        const schema = await this.dataProvider.getSchema();
        this.ngZone.run(() => {
          if (schema) this.colorFeature = schema.label[this.config.colorFeature];
        });

        // Grab a sample glyph for the mini preview
        const glyphData = await this.dataProvider.getGlyphData();
        if (glyphData?.length) {
          this.currentGlyph = glyphData[Math.floor(Math.random() * glyphData.length)];
          this.drawGlyphPreview();
        }
      })
    );

    this.subs.add(
      this.config.glyphConfigSubject$.subscribe(cfg => {
        this.glyphConfig = cfg;

        this.ngZone.run(() => {
          const newFeature = this.config.featureLabels[this.config.colorFeature];
          if (newFeature) this.colorFeature = newFeature;

          if (this.selectedColorScaleId !== this.config.colorRange) {
            this.selectedColorScaleId = this.config.colorRange;
          }
          if (this.selectedColorAttribute !== this.config.colorFeature) {
            this.selectedColorAttribute = this.config.colorFeature;
          }
        });

        this.drawGlyphPreview();
      })
    );

    this.subs.add(
      this.config.animateGlyphSubject$.subscribe(glyph => {
        if (glyph == null) return;
        this.currentGlyph = glyph;
        this.drawGlyphPreview();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // --- Collapse/expand ---
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  expandTo(section: AccordionSection): void {
    this.collapsed = false;
    if (section === 'appearance') {
      this.appearanceOpen = true;
    } else {
      this.filtersOpen = true;
    }
  }

  toggleSection(section: AccordionSection): void {
    if (section === 'appearance') {
      this.appearanceOpen = !this.appearanceOpen;
    } else {
      this.filtersOpen = !this.filtersOpen;
    }
  }

  // --- Glyph preview canvas ---
  private setupGlyphCanvas(): void {
    if (!this.glyphCanvas) return;
    const ctx = this.glyphCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const container = this.glyphCanvas.parentElement;
    const logicalWidth = container ? container.clientWidth : 316;
    const logicalHeight = container ? container.clientHeight : 120;

    this.glyphCanvas.width = logicalWidth * dpr;
    this.glyphCanvas.height = logicalHeight * dpr;
    this.glyphCanvas.style.width = `${logicalWidth}px`;
    this.glyphCanvas.style.height = `${logicalHeight}px`;

    ctx.scale(dpr, dpr);
    this.glyphContext = ctx;
  }

  private drawGlyphPreview(): void {
    if (!this.glyphContext || !this.glyphCanvas || !this.currentGlyph) return;

    const color = this.config.getRgbaColor(this.currentGlyph.features);
    const cfg = this.config.getConfiguration();

    const canvasW = this.glyphCanvas.clientWidth;
    const canvasH = this.glyphCanvas.clientHeight;

    // Draw functions place glyph center at ~(170, 90) with radius 50
    // Including labels, the bounding box is roughly 180x160 centered at (170, 90)
    const glyphCX = 170;
    const glyphCY = 90;
    const glyphW = 180;
    const glyphH = 160;

    const scale = Math.min(canvasW / glyphW, canvasH / glyphH) * 0.9;

    this.glyphContext.save();
    this.glyphContext.clearRect(0, 0, this.glyphCanvas.width, this.glyphCanvas.height);

    // Center the glyph in the canvas and scale to fill
    this.glyphContext.translate(canvasW / 2, canvasH / 2);
    this.glyphContext.scale(scale, scale);
    this.glyphContext.translate(-glyphCX, -glyphCY);

    if (cfg.glyphType === GlyphType.Star) {
      drawRadarChart(this.glyphContext, 50, color, this.currentGlyph, this.config.activeFeatures, this.config.featureLabels, cfg);
    } else if (cfg.glyphType === GlyphType.Whisker) {
      drawWhiskerGlyph(this.glyphContext, 50, color, this.currentGlyph, this.config.activeFeatures, this.config.featureLabels, cfg);
    } else {
      drawFlowerGlyph(this.glyphContext, 50, color, this.currentGlyph, this.config.activeFeatures, this.config.featureLabels, cfg);
    }

    this.glyphContext.restore();
  }

  // --- Search / text filter ---
  updateTextFilter(): void {
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
    setTimeout(() => this.inputFocused = false, 150);
  }

  clearFilters(): void {
    this.dataProvider.clearFilters();
    this.config.clearSelection();
  }

  // --- Color settings ---
  getFeatureName(id: string): string {
    return this.schema?.label[id] || '';
  }

  getFeatureType(id: string): string {
    return this.schema?.types ? this.schema.types[id] || '' : '';
  }

  selectColorScale(id: number): void {
    this.selectedColorScaleId = id;
    this.colorScaleDropdownOpen = false;
    this.config.colorRange = id;
    this.config.updateConfiguration();
  }

  toggleColorScaleDropdown(): void {
    this.colorScaleDropdownOpen = !this.colorScaleDropdownOpen;
  }

  getSelectedScale(): ColorScale {
    return this.colorScales.find(s => s.id === this.selectedColorScaleId)!;
  }

  selectColor(): void {
    this.config.colorFeature = this.selectedColorAttribute;

    const featureType = this.schema?.types[this.selectedColorAttribute];
    const colorScaleType = this.getSelectedScale().type;

    if (featureType !== colorScaleType) {
      const matchingScale = this.colorScales.find(s => s.type === featureType)?.id;
      if (matchingScale !== undefined) this.selectColorScale(matchingScale);
    }
    this.config.updateConfiguration();
  }

  // --- Glyph settings ---
  setGlyphType(type: GlyphType): void {
    this.glyphConfig.glyphType = type;
    this.config.updateConfiguration();
  }

  getGlyphName(glyph: GlyphType): string {
    switch (glyph) {
      case GlyphType.Star: return 'Star';
      case GlyphType.Flower: return 'Flower';
      case GlyphType.Whisker: return 'Whisker';
      case GlyphType.Dot: return 'Dot';
      case GlyphType.Thumb: return 'Thumbnail';
      default: return 'Unknown';
    }
  }

  isOptionEnabled(prop: string): boolean {
    return (this.glyphConfig as any)[prop] === true;
  }

  toggleOption(property: string): void {
    (this.glyphConfig as any)[property] = !(this.glyphConfig as any)[property];
    this.config.updateConfiguration();
  }

  trackByFeatureId(index: number, featureId: string): string {
    return featureId;
  }
}
