import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FilterService } from '../../services/filter.service';
import { CategoryFilter } from '../../shared/filter/category-filter';
import { FeatureFilter } from '../../shared/filter/feature-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { ItemFilter } from '../../shared/filter/item-filter';
import { TextFilter } from '../../shared/filter/text-filter';

export interface ActiveFilter {
  key: string;
  label: string;
  remove: () => void;
}

let nextId = 0;

/**
 * "Filters" dropdown listing every active filter (search terms, histogram
 * ranges and categories, canvas selection) with a live count of the items
 * that match them.
 */
@Component({
  selector: 'app-filter-summary',
  imports: [DecimalPipe],
  templateUrl: './filter-summary.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './filter-summary.component.scss',
})
export class FilterSummaryComponent {
  /** Feature names by id. */
  @Input() labels: Record<string, string> = {};

  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;

  open = false;
  readonly popoverId = `filter-summary-${nextId++}`;

  constructor(
    public filterService: FilterService,
    private config: ConfigService,
    private host: ElementRef<HTMLElement>
  ) {}

  get activeFilters(): ActiveFilter[] {
    return this.filterService.getFilters().flatMap((filter, i) => this.describe(filter, i));
  }

  toggle(): void {
    this.open = !this.open;
  }

  close(returnFocus = false): void {
    if (!this.open) return;
    this.open = false;
    if (returnFocus) this.trigger?.nativeElement.focus();
  }

  clearAll(): void {
    this.filterService.clearFilters();
    this.config.clearSelection();
    this.close(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.close(true);
  }

  private describe(filter: ItemFilter, index: number): ActiveFilter[] {
    if (filter.empty()) return [];
    if (filter instanceof TextFilter) {
      return filter.acceptableStrings.map(term => ({
        key: `text-${index}-${term}`,
        label: `“${term}”`,
        remove: () => this.removeSearchTerm(filter, term),
      }));
    }
    if (filter instanceof IdFilter) {
      return [
        {
          key: `ids-${index}`,
          label: `${filter.acceptableIds.length} selected`,
          remove: () => this.clear(filter, () => this.config.clearSelection()),
        },
      ];
    }
    if (filter instanceof FeatureFilter || filter instanceof CategoryFilter) {
      return [
        {
          key: `feature-${index}`,
          label: this.labels[filter.featureName] || filter.featureName,
          remove: () => this.clear(filter, () => this.config.redraw()),
        },
      ];
    }
    return [];
  }

  private removeSearchTerm(filter: TextFilter, term: string): void {
    filter.acceptableStrings = filter.acceptableStrings.filter(t => t !== term);
    this.filterService.refreshFilters();
    this.config.redraw();
  }

  private clear(filter: ItemFilter, redraw: () => void): void {
    filter.clear();
    this.filterService.refreshFilters();
    redraw();
  }
}
