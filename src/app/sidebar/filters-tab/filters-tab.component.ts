import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { FilterService } from '../../services/filter.service';
import { FilterMode } from '../../shared/enum/filter-mode';
import { GlyphType, hasFeatureAxes } from '../../shared/enum/glyph-type';
import { TextFilter } from '../../shared/filter/text-filter';
import { FeaturesData } from '../../shared/interfaces/glyph-meta';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES, canAddGlyphAxis, canRemoveGlyphAxis } from '../../glyph/glyph-axes';
import { HistogramComponent } from '../histogram/histogram.component';
import { GlyphIconComponent } from '../glyph-icon/glyph-icon.component';

/** Text search plus one histogram filter card per feature, marked when the feature is a glyph axis. */
@Component({
  selector: 'app-filters-tab',
  imports: [FormsModule, HistogramComponent, GlyphIconComponent],
  templateUrl: './filters-tab.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './filters-tab.component.scss',
})
export class FiltersTabComponent {
  @Input() features: FeaturesData = {};
  @Input() featureIds: readonly string[] = [];
  @Input() labels: Record<string, string> = {};
  @Input() types: Record<string, string> = {};
  /** Feature ids of the glyph axes, in drawing order. */
  @Input() axes: readonly string[] = [];
  @Input({ required: true }) glyphType!: GlyphType;

  @Output() axisAdded = new EventEmitter<string>();
  @Output() axisRemoved = new EventEmitter<string>();

  searchTerm = '';
  inputFocused = false;
  private textFilter = new TextFilter();

  constructor(
    public config: ConfigService,
    public filterService: FilterService
  ) {
    this.textFilter.filterMode = FilterMode.And;
  }

  get showGlyphIcons(): boolean {
    return hasFeatureAxes(this.glyphType);
  }

  get searchTerms(): string[] {
    return this.textFilter.acceptableStrings;
  }

  name(featureId: string): string {
    return this.labels[featureId] || featureId;
  }

  axisIndex(featureId: string): number {
    return this.axes.indexOf(featureId);
  }

  canToggle(featureId: string): boolean {
    return canRemoveGlyphAxis(this.axes, featureId) || canAddGlyphAxis(this.axes, featureId);
  }

  /** Accessible name and tooltip of a card's glyph icon; also says why it cannot be used. */
  iconLabel(featureId: string): string {
    const index = this.axisIndex(featureId);
    if (index >= 0) {
      return canRemoveGlyphAxis(this.axes, featureId)
        ? `Axis ${index + 1} of the glyph. Click to remove it.`
        : `Axis ${index + 1} of the glyph. A glyph needs at least ${MIN_GLYPH_AXES} axes.`;
    }
    return canAddGlyphAxis(this.axes, featureId)
      ? `Add ${this.name(featureId)} to the glyph`
      : `The glyph is full (at most ${MAX_GLYPH_AXES} axes)`;
  }

  toggleAxis(featureId: string): void {
    if (canRemoveGlyphAxis(this.axes, featureId)) this.axisRemoved.emit(featureId);
    else if (canAddGlyphAxis(this.axes, featureId)) this.axisAdded.emit(featureId);
  }

  // --- Text search ---
  onSearchEnter(): void {
    const term = this.searchTerm.trim();
    this.searchTerm = '';
    if (!term) return;
    this.filterService.ensureFilter(this.textFilter);
    this.textFilter.extendAcceptableStrings([term]);
    this.applySearch();
  }

  removeTerm(term: string): void {
    this.textFilter.acceptableStrings = this.searchTerms.filter(t => t !== term);
    this.applySearch();
  }

  clearSearch(input: HTMLInputElement): void {
    this.searchTerm = '';
    this.textFilter.clear();
    input.focus();
    this.applySearch();
  }

  onBlur(): void {
    // Let a click on a term's remove button land before the list closes.
    setTimeout(() => (this.inputFocused = false), 150);
  }

  private applySearch(): void {
    this.filterService.refreshFilters();
    this.config.redraw();
  }
}
