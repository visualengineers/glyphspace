import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ConfigService } from '../services/config.service';
import { DataLoaderService } from '../services/data-loader.service';
import { FilterService } from '../services/filter.service';
import { LoggerService } from '../services/logger-service';

import { GlyphObject } from '../glyph/glyph-object';
import { GlyphType, getGlyphTypeName } from '../shared/enum/glyph-type';
import { GlyphConfiguration } from '../glyph/glyph-configuration';
import { drawFlowerGlyph, drawRadarChart, drawWhiskerGlyph } from '../shared/helpers/d3-helper';

import { TextFilter } from '../shared/filter/text-filter';
import { FilterMode } from '../shared/enum/filter-mode';
import { ItemFilter } from '../shared/filter/item-filter';
import { IdFilter } from '../shared/filter/id-filter';
import { FeatureFilter } from '../shared/filter/feature-filter';
import { CategoryFilter } from '../shared/filter/category-filter';

import { FeaturesData } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { COLOR_SCALES, ColorScale, buildGroupedColorScales } from '../shared/interfaces/color-scale';

import { HistogramComponent } from './histogram/histogram.component';
import { ColorScaleSelectorComponent } from '../shared/components/color-scale-selector/color-scale-selector.component';

export type SidebarPane = 'encoding' | 'style' | 'filters';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FormsModule, HistogramComponent, ColorScaleSelectorComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @HostBinding('class.collapsed') collapsed = false;

  // --- Active pane (VS Code-style activity bar) ---
  activePane: SidebarPane = 'encoding';

  // --- Filter chip popover ---
  filtersPopoverOpen = false;

  // --- Glyph preview ---
  private glyphCanvas?: HTMLCanvasElement;
  private glyphContext?: CanvasRenderingContext2D;
  private currentGlyph: GlyphObject | null = null;
  private resizeObserver?: ResizeObserver;

  @ViewChild('glyphCanvas') set glyphCanvasRef(ref: ElementRef | undefined) {
    if (ref) {
      this.glyphCanvas = ref.nativeElement;
      this.setupGlyphCanvas();
      this.drawGlyphPreview();
      this.observeCanvasResize();
    } else {
      this.resizeObserver?.disconnect();
      this.glyphCanvas = undefined;
      this.glyphContext = undefined;
    }
  }

  // --- Data ---
  searchTerm = '';
  searchTerms: string[] = [];
  inputFocused = false;
  private textFilter = new TextFilter();

  features: FeaturesData = {};
  featureIds: string[] = [];
  schema?: GlyphSchema;

  // --- Color ---
  colorScales: ColorScale[] = COLOR_SCALES;
  groupedColorScales: { group: string; scales: ColorScale[] }[] = [];
  selectedColorAttribute = '';
  selectedColorScaleId = COLOR_SCALES[0].id;

  // --- Glyph ---
  glyphConfig = new GlyphConfiguration();
  GlyphType = GlyphType;

  private subs = new Subscription();
  private ngZone = inject(NgZone);

  constructor(
    public config: ConfigService,
    public dataLoader: DataLoaderService,
    public filterService: FilterService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.groupedColorScales = buildGroupedColorScales(this.colorScales);

    this.subs.add(
      this.config.loadedDataSubject$.subscribe(async data => {
        if (data === '') return;

        const metaData = await this.dataLoader.getMetaData();
        this.schema = await this.dataLoader.getSchema();
        if (metaData?.features) {
          this.ngZone.run(() => {
            this.features = metaData.features;
            this.featureIds = Object.keys(this.features);

            // Decide which color feature to use for the new dataset
            const desired = this.config.colorFeature;
            const colorFeature =
              desired && this.featureIds.includes(desired)
                ? desired
                : this.schema?.color && this.featureIds.includes(this.schema.color)
                  ? this.schema.color
                  : this.featureIds[0];

            let configChanged = false;
            if (colorFeature && colorFeature !== this.config.colorFeature) {
              this.config.colorFeature = colorFeature;
              configChanged = true;
            }
            this.selectedColorAttribute = colorFeature ?? '';

            // Ensure the active color scale matches the new feature's type
            // (e.g. don't keep a categorical scale on a numeric feature after a dataset switch)
            if (colorFeature) {
              const featureType = this.schema?.types?.[colorFeature];
              const currentScale = this.colorScales.find(s => s.id === this.config.colorRange);
              if (featureType && currentScale && currentScale.type !== featureType) {
                const matchingScale = this.colorScales.find(s => s.type === featureType)?.id;
                if (matchingScale !== undefined) {
                  this.config.colorRange = matchingScale;
                  configChanged = true;
                }
              }
            }

            if (configChanged) this.config.updateConfiguration();
            this.selectedColorScaleId = this.config.colorRange;
          });
        }

        const glyphData = await this.dataLoader.getGlyphData();
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

    // Re-evaluate filter chips when filters change (histogram brush, canvas selection, etc.)
    this.subs.add(
      this.config.commandSubject$.subscribe(() => {
        // Trigger Angular change detection to update filter chip UI
        this.ngZone.run(() => {
          /* intentional: forces CD */
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.subs.unsubscribe();
  }

  // --- VS Code-style pane switching ---
  selectPane(pane: SidebarPane): void {
    if (!this.collapsed && this.activePane === pane) {
      this.collapsed = true;
    } else {
      this.collapsed = false;
      this.activePane = pane;
    }
  }

  paneTitle(): string {
    switch (this.activePane) {
      case 'encoding':
        return 'Encoding';
      case 'style':
        return 'Style';
      case 'filters':
        return 'Filters';
    }
  }

  // --- Glyph preview canvas ---
  private observeCanvasResize(): void {
    this.resizeObserver?.disconnect();
    const container = this.glyphCanvas?.parentElement;
    if (!container) return;
    this.resizeObserver = new ResizeObserver(() => {
      this.setupGlyphCanvas();
      this.drawGlyphPreview();
    });
    this.resizeObserver.observe(container);
  }

  private setupGlyphCanvas(): void {
    if (!this.glyphCanvas) return;
    const ctx = this.glyphCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const container = this.glyphCanvas.parentElement;
    const logicalWidth = container ? container.clientWidth : 316;
    const logicalHeight = container ? container.clientHeight : 180;

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

    const glyphCX = 170;
    const glyphCY = 90;
    const glyphW = 180;
    const glyphH = 160;

    const scale = Math.min(canvasW / glyphW, canvasH / glyphH) * 0.9;

    this.glyphContext.save();
    this.glyphContext.clearRect(0, 0, this.glyphCanvas.width, this.glyphCanvas.height);

    this.glyphContext.translate(canvasW / 2, canvasH / 2);
    this.glyphContext.scale(scale, scale);
    this.glyphContext.translate(-glyphCX, -glyphCY);

    if (cfg.glyphType === GlyphType.Star) {
      drawRadarChart(
        this.glyphContext,
        50,
        color,
        this.currentGlyph,
        this.config.activeFeatures,
        this.config.featureLabels,
        cfg
      );
    } else if (cfg.glyphType === GlyphType.Whisker) {
      drawWhiskerGlyph(
        this.glyphContext,
        50,
        color,
        this.currentGlyph,
        this.config.activeFeatures,
        this.config.featureLabels,
        cfg
      );
    } else {
      drawFlowerGlyph(
        this.glyphContext,
        50,
        color,
        this.currentGlyph,
        this.config.activeFeatures,
        this.config.featureLabels,
        cfg
      );
    }

    this.glyphContext.restore();
  }

  // --- Glyph axes ---
  toggleFeature(featureId: string): void {
    const index = this.config.activeFeatures.indexOf(featureId);
    if (index >= 0) {
      this.config.activeFeatures.splice(index, 1);
    } else {
      this.config.activeFeatures.push(featureId);
    }
    this.config.updateConfiguration();
  }

  isFeatureActive(featureId: string): boolean {
    return this.config.activeFeatures.includes(featureId);
  }

  getActiveFeatureCount(): string {
    return `${this.config.activeFeatures.length} of ${this.featureIds.length}`;
  }

  getSortedFeatureIds(): string[] {
    const active = this.featureIds.filter(id => this.isFeatureActive(id));
    const inactive = this.featureIds.filter(id => !this.isFeatureActive(id));
    return [...active, ...inactive];
  }

  // --- Active filter chips ---
  getActiveFilters(): { filter: ItemFilter; displayName: string }[] {
    const result: { filter: ItemFilter; displayName: string }[] = [];
    for (const filter of this.filterService.getFilters()) {
      if (filter.empty()) continue;
      if (filter instanceof IdFilter) {
        const count = filter.acceptableIds.length;
        result.push({ filter, displayName: `${count} selected` });
      } else if (filter instanceof FeatureFilter) {
        result.push({ filter, displayName: this.getFeatureName(filter.featureName) || filter.featureName });
      } else if (filter instanceof CategoryFilter) {
        result.push({ filter, displayName: this.getFeatureName(filter.featureName) || filter.featureName });
      }
    }
    return result;
  }

  removeFilter(filter: ItemFilter): void {
    filter.clear();
    this.filterService.refreshFilters();
    if (filter instanceof IdFilter) {
      this.config.clearSelection();
    } else {
      this.config.redraw();
    }
  }

  hasActiveFilters(): boolean {
    return this.searchTerms.length > 0 || this.getActiveFilters().length > 0;
  }

  getActiveFilterCount(): number {
    return this.searchTerms.length + this.getActiveFilters().length;
  }

  toggleFiltersPopover(event: MouseEvent): void {
    event.stopPropagation();
    this.filtersPopoverOpen = !this.filtersPopoverOpen;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.filtersPopoverOpen) this.filtersPopoverOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.filtersPopoverOpen) this.filtersPopoverOpen = false;
  }

  // --- Style summary ---
  getStyleSummary(): string {
    const parts = [this.getGlyphName(this.glyphConfig.glyphType)];
    for (const opt of this.glyphConfig.glyphOptions) {
      if (this.glyphConfig[opt.property as keyof GlyphConfiguration]) parts.push(opt.label);
    }
    return parts.join(' · ');
  }

  // --- Search / text filter ---
  updateTextFilter(): void {
    this.textFilter.filterMode = FilterMode.And;
    this.filterService.ensureFilter(this.textFilter);
    this.textFilter.clear();
    if (this.searchTerms.length > 0) {
      this.textFilter.extendAcceptableStrings(this.searchTerms);
    }
    this.filterService.refreshFilters();
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
    setTimeout(() => (this.inputFocused = false), 150);
  }

  clearFilters(): void {
    this.filterService.clearFilters();
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
    this.config.colorRange = id;
    this.config.updateConfiguration();
  }

  getSelectedScale(): ColorScale {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- selectedColorScaleId is always set to a valid COLOR_SCALES id
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
    return getGlyphTypeName(glyph);
  }

  isOptionEnabled(prop: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic property access on GlyphConfiguration
    return (this.glyphConfig as any)[prop] === true;
  }

  toggleOption(property: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic property access on GlyphConfiguration
    (this.glyphConfig as any)[property] = !(this.glyphConfig as any)[property];
    this.config.updateConfiguration();
  }

  trackByFeatureId(index: number, featureId: string): string {
    return featureId;
  }
}
