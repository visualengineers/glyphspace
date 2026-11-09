import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { GlyphConfiguration } from '../../glyph/glyph-configuration';
import { ITEM_SIZE_PX } from '../../glyph/glyph-size-info';
import { GlyphType, getGlyphTypeName } from '../../shared/enum/glyph-type';
import {
  COLOR_SCALES,
  ColorScale,
  buildGroupedColorScales,
  getCategoricalColors,
  getColorScaleById,
  scaleTypeForFeature,
} from '../../shared/interfaces/color-scale';
import { ColorScaleSelectorComponent } from '../../shared/components/color-scale-selector/color-scale-selector.component';
import { GlyphIconComponent } from '../glyph-icon/glyph-icon.component';

type GlyphOptionKey = 'useCoordinateSystem' | 'useBackground' | 'useContour';

/** Glyph type, color mapping and appearance (options and sizes) of the glyphs. */
@Component({
  selector: 'app-encoding-tab',
  imports: [FormsModule, ColorScaleSelectorComponent, GlyphIconComponent],
  templateUrl: './encoding-tab.component.html',
  styleUrl: './encoding-tab.component.scss',
})
export class EncodingTabComponent implements OnDestroy {
  @Input() featureIds: readonly string[] = [];
  @Input() labels: Record<string, string> = {};
  @Input() types: Record<string, string> = {};
  /** Number of categories of each feature that has categories. */
  @Input() categoryCounts: Record<string, number> = {};
  @Input({ required: true }) glyphConfig!: GlyphConfiguration;
  /** Whether the dataset has item images; without them Image is disabled. */
  @Input() imagesAvailable = true;

  readonly glyphTypes = [GlyphType.Star, GlyphType.Flower, GlyphType.Thumb].map(type => ({
    type,
    label: getGlyphTypeName(type),
  }));
  readonly GlyphType = GlyphType;
  readonly noImagesHint =
    "This dataset has no item images. Import a dataset with a ZIP of images in the wizard's first step.";
  readonly groupedColorScales = buildGroupedColorScales(COLOR_SCALES);
  readonly sizeLimits = ITEM_SIZE_PX;

  private sizeFrame?: number;

  constructor(public config: ConfigService) {}

  ngOnDestroy(): void {
    if (this.sizeFrame !== undefined) cancelAnimationFrame(this.sizeFrame);
  }

  // --- Glyph type and options ---
  /** Image needs item images; the button stays focusable so its title can say why it is off. */
  isUnavailable(type: GlyphType): boolean {
    return type === GlyphType.Thumb && !this.imagesAvailable;
  }

  setGlyphType(type: GlyphType): void {
    if (this.isUnavailable(type)) return;
    this.glyphConfig.glyphType = type;
    this.config.updateConfiguration();
  }

  isOptionEnabled(property: string): boolean {
    return this.glyphConfig[property as GlyphOptionKey] === true;
  }

  toggleOption(property: string): void {
    const key = property as GlyphOptionKey;
    this.glyphConfig[key] = !this.glyphConfig[key];
    this.config.updateConfiguration();
  }

  // --- Size ---
  setItemSize(value: string): void {
    this.glyphConfig.itemSize = +value;
    this.scheduleSizeUpdate();
  }

  /** Dragging the slider fires many input events; redraw the canvases at most once per frame. */
  private scheduleSizeUpdate(): void {
    if (this.sizeFrame !== undefined) return;
    this.sizeFrame = requestAnimationFrame(() => {
      this.sizeFrame = undefined;
      this.config.updateConfiguration();
    });
  }

  // --- Color ---
  get colorFeature(): string {
    return this.config.colorFeature;
  }

  get selectedScale(): ColorScale {
    return getColorScaleById(this.config.colorRange);
  }

  colorOptionLabel(featureId: string): string {
    const categories = this.categoryCounts[featureId];
    const kind = categories ? `${categories} categories` : this.types[featureId] || 'numeric';
    return `${this.labels[featureId] || featureId} (${kind})`;
  }

  /** Explains how a categorical palette colors the selected feature. */
  get paletteHint(): string {
    const colors = getCategoricalColors(this.selectedScale).length;
    const hint = `Up to ${colors} categories get their own color. Grey is reserved for filtered-out items.`;
    const categories = this.categoryCounts[this.colorFeature] ?? 0;
    return categories > colors ? `${hint} This feature has ${categories} categories, so colors repeat.` : hint;
  }

  selectColorFeature(featureId: string): void {
    this.config.colorFeature = featureId;
    const wanted = scaleTypeForFeature(this.types[featureId], this.categoryCounts[featureId]);
    if (this.selectedScale.type !== wanted) {
      const matching = COLOR_SCALES.find(scale => scale.type === wanted);
      if (matching) this.config.colorRange = matching.id;
    }
    this.config.updateConfiguration();
  }

  selectColorScale(id: number): void {
    this.config.colorRange = id;
    this.config.updateConfiguration();
  }
}
