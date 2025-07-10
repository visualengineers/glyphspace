import { Component, NgZone } from '@angular/core';
import { DataProviderService } from '../../../services/dataprovider.service';
import { FeaturesData } from '../../../shared/interfaces/glyph-meta';
import { FilterItemComponent } from './filter-item.component';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../services/config.service';
import { inject } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { TextFilter } from '../../../shared/filter/text-filter';
import { FilterMode } from '../../../shared/enum/filter-mode';
import { InteractionCommand } from '../../../shared/enum/interaction-command';
import { GlyphSchema } from '../../../shared/interfaces/glyph-schema';

@Component({
  selector: 'app-filter-tab',
  imports: [CommonModule, FilterItemComponent, FormsModule],
  templateUrl: './filter-tab.component.html',
  styleUrl: './filter-tab.component.scss'
})
export class FilterTabComponent {
  features: FeaturesData = {};
  featureIds: string[] = [];
  searchTerm = "";
  searchTerms: string[] = [];
  inputFocused = false;
  schema?: GlyphSchema;
  private textFilter = new TextFilter();
  private ngZone!: NgZone;

  public configuration: ConfigService;
  public dataProvider: DataProviderService;

  constructor() {
    this.dataProvider = inject(DataProviderService);
    this.ngZone = inject(NgZone);
    this.dataProvider.dataSetCollectionSubject$.subscribe(() => {
    });
    this.configuration = inject(ConfigService);
    this.configuration.commandSubject$.subscribe(command => {
      if (command == InteractionCommand.clearselection) {
        this.searchTerm = "";
      }
    });
    this.configuration.loadedDataSubject$.subscribe(async data => {
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

  ngOnInit(): void {
  }

  getFeatureName(id: string) {
    return this.schema?.label[id] || "";
  }

  trackByFeatureId(index: number, featureId: string): string {
    return featureId;
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
    this.configuration.redraw();
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
}
