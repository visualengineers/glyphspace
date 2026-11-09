import {
  Component,
  ElementRef,
  HostBinding,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../services/config.service';
import { DataLoaderService } from '../services/data-loader.service';
import { GlyphObject } from '../glyph/glyph-object';
import { GlyphConfiguration } from '../glyph/glyph-configuration';
import { MAX_GLYPH_AXES } from '../glyph/glyph-axes';
import { GlyphType, hasFeatureAxes } from '../shared/enum/glyph-type';
import { ThumbnailService } from '../services/thumbnail.service';
import { FeaturesData } from '../shared/interfaces/glyph-meta';
import { GlyphSchema } from '../shared/interfaces/glyph-schema';
import { COLOR_SCALES, scaleTypeForFeature } from '../shared/interfaces/color-scale';

import { GlyphLegendComponent } from './glyph-legend/glyph-legend.component';
import { FilterSummaryComponent } from './filter-summary/filter-summary.component';
import { FiltersTabComponent } from './filters-tab/filters-tab.component';
import { EncodingTabComponent } from './encoding-tab/encoding-tab.component';

export type SidebarTab = 'filters' | 'encoding';

/** Shape and color of the legend glyph until an item is available. */
const PLACEHOLDER_LENGTH = 0.65;
const PLACEHOLDER_COLOR = '#9aa4ad';

/**
 * Right-hand sidebar: the glyph legend and the filter summary stay on top,
 * filters and encoding settings sit in two tabs below. The whole sidebar
 * can be hidden; an edge handle brings it back.
 */
@Component({
  selector: 'app-sidebar',
  imports: [GlyphLegendComponent, FilterSummaryComponent, FiltersTabComponent, EncodingTabComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @HostBinding('class.collapsed') collapsed = false;

  @ViewChild('collapseButton') collapseButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('expandButton') expandButton?: ElementRef<HTMLButtonElement>;

  readonly tabs: { id: SidebarTab; label: string }[] = [
    { id: 'filters', label: 'Filters' },
    { id: 'encoding', label: 'Encoding' },
  ];
  activeTab: SidebarTab = 'filters';

  // --- Dataset ---
  features: FeaturesData = {};
  featureIds: string[] = [];
  labels: Record<string, string> = {};
  types: Record<string, string> = {};
  categoryCounts: Record<string, number> = {};

  // --- Glyph ---
  glyphConfig: GlyphConfiguration;
  /** Whether the loaded dataset has item images, which the Image glyph type needs. */
  imagesAvailable = true;
  /** Snapshot of the glyph axes, renewed on every configuration change. */
  axes: string[] = [];
  legendLengths: number[] = [];
  legendColor = PLACEHOLDER_COLOR;
  /** Item drawn in the legend: a representative one, then the one last hovered on a canvas. */
  private legendGlyph: GlyphObject | null = null;

  private subs = new Subscription();
  private ngZone = inject(NgZone);
  private injector = inject(Injector);
  private thumbnails = inject(ThumbnailService);

  constructor(
    public config: ConfigService,
    private dataLoader: DataLoaderService
  ) {
    this.glyphConfig = config.getConfiguration();
  }

  get legendCount(): string {
    return hasFeatureAxes(this.glyphConfig.glyphType) ? `${this.axes.length} / ${MAX_GLYPH_AXES}` : 'n/a';
  }

  ngOnInit(): void {
    this.subs.add(
      this.config.loadedDataSubject$.subscribe(async data => {
        if (data === '') return;

        const metaData = await this.dataLoader.getMetaData();
        const schema = await this.dataLoader.getSchema();
        const glyphData = await this.dataLoader.getGlyphData();
        const images = await this.thumbnails.hasImages(data);

        this.ngZone.run(() => {
          this.applyDataset(metaData?.features ?? {}, schema);
          this.applyImageAvailability(images);
          this.legendGlyph = this.representativeGlyph(glyphData ?? []);
          this.updateGlyphView();
        });
      })
    );

    this.subs.add(
      this.config.glyphConfigSubject$.subscribe(glyphConfig => {
        this.glyphConfig = glyphConfig;
        this.updateGlyphView();
      })
    );

    this.subs.add(
      this.config.animateGlyphSubject$.subscribe(glyph => {
        if (glyph == null) return;
        this.legendGlyph = glyph;
        this.updateLegend();
      })
    );

    // Filters change outside Angular's view (histogram brush, canvas selection):
    // refresh the live count and the filter summary.
    this.subs.add(
      this.config.commandSubject$.subscribe(() => {
        this.ngZone.run(() => {
          /* intentional: forces change detection */
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /** Without item images the Image glyph type has nothing to show; such a dataset opens with stars. */
  private applyImageAvailability(available: boolean): void {
    this.imagesAvailable = available;
    if (!available && this.glyphConfig.glyphType === GlyphType.Thumb) {
      this.glyphConfig.glyphType = GlyphType.Star;
      this.config.updateConfiguration();
    }
  }

  // --- Collapse ---
  collapse(): void {
    this.collapsed = true;
    afterNextRender(() => this.expandButton?.nativeElement.focus(), { injector: this.injector });
  }

  expand(): void {
    this.collapsed = false;
    afterNextRender(() => this.collapseButton?.nativeElement.focus(), { injector: this.injector });
  }

  // --- Tabs (WAI-ARIA tabs pattern: arrow keys move between tabs) ---
  selectTab(tab: SidebarTab): void {
    this.activeTab = tab;
  }

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: this.tabs.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = this.tabs[(target + this.tabs.length) % this.tabs.length];
    this.selectTab(next.id);
    document.getElementById(`sidebar-tab-${next.id}`)?.focus();
  }

  // --- Glyph axes ---
  addAxis(featureId: string): void {
    this.config.addGlyphAxis(featureId);
  }

  removeAxis(featureId: string): void {
    this.config.removeGlyphAxis(featureId);
  }

  private applyDataset(features: FeaturesData, schema: GlyphSchema | undefined): void {
    this.features = features;
    this.featureIds = Object.keys(features);
    this.labels = schema?.label ?? {};
    this.types = schema?.types ?? {};
    // Set from the dataset meta while the schema was applied (getSchema).
    this.categoryCounts = this.config.featureCategoryCounts;
    this.syncColorSettings(schema);
  }

  /** Keep a color feature of the new dataset, and a scale that suits it. */
  private syncColorSettings(schema: GlyphSchema | undefined): void {
    const ids = this.featureIds;
    const current = this.config.colorFeature;
    const colorFeature =
      current && ids.includes(current) ? current : schema?.color && ids.includes(schema.color) ? schema.color : ids[0];
    if (!colorFeature) return;

    let changed = false;
    if (colorFeature !== current) {
      this.config.colorFeature = colorFeature;
      changed = true;
    }

    const wanted = scaleTypeForFeature(this.types[colorFeature], this.categoryCounts[colorFeature]);
    if (this.config.colorScale?.type !== wanted) {
      const matching = COLOR_SCALES.find(scale => scale.type === wanted);
      if (matching) {
        this.config.colorRange = matching.id;
        changed = true;
      }
    }

    if (changed) this.config.updateConfiguration();
  }

  /**
   * The item with the longest axes on average: a real item whose shape is easy
   * to read, unlike a random one that may be almost empty.
   */
  private representativeGlyph(glyphs: readonly GlyphObject[]): GlyphObject | null {
    const axes = this.config.activeFeatures;
    const maxValues = this.config.featureMaxValues;
    const linear = this.glyphConfig.scaleLinear;
    let best: GlyphObject | null = null;
    let bestMean = -Infinity;
    for (const glyph of glyphs) {
      const lengths = glyph.axisLengths(axes, maxValues, linear);
      const mean = lengths.reduce((sum, length) => sum + length, 0) / (lengths.length || 1);
      if (mean > bestMean) {
        best = glyph;
        bestMean = mean;
      }
    }
    return best;
  }

  private updateGlyphView(): void {
    this.axes = [...this.config.activeFeatures];
    this.updateLegend();
  }

  private updateLegend(): void {
    const glyph = this.legendGlyph;
    if (!glyph?.features) {
      this.legendLengths = this.axes.map(() => PLACEHOLDER_LENGTH);
      this.legendColor = PLACEHOLDER_COLOR;
      return;
    }
    this.legendLengths = glyph.axisLengths(this.axes, this.config.featureMaxValues, this.glyphConfig.scaleLinear);
    this.legendColor = this.config.getRgbaColor(glyph.features);
  }
}
