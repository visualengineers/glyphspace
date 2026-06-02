import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PreprocessingWizardComponent } from '../preprocessing-wizard/preprocessing-wizard.component';
import { DataLoaderService } from '../services/data-loader.service';
import { FilterService } from '../services/filter.service';
import { DataExportService } from '../services/data-export.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [PreprocessingWizardComponent, FormsModule],
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenuBarComponent implements OnInit, OnDestroy {
  @Output() addCanvas = new EventEmitter<void>();
  @Input() totalCells = 0;

  menuOpen = false;
  showWizard = false;
  hasData = false;
  datasetNames: string[] = [];
  datasetEntries: { name: string; source: string }[] = [];
  selectedDataset: string | null = null;

  private dataSub = new Subscription();

  constructor(
    private dataLoader: DataLoaderService,
    private filterService: FilterService,
    private dataExport: DataExportService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.dataSub.add(
      this.dataLoader.dataSetCollectionSubject$.subscribe(collection => {
        this.hasData = !!collection && collection.length > 0 && collection.at(0)?.dataset !== '';
        this.datasetNames = collection.map(entry => entry.dataset);
        this.datasetEntries = collection.map(entry => ({
          name: entry.dataset,
          source: entry.source,
        }));
      })
    );
    this.dataSub.add(
      this.configService.loadedDataSubject$.subscribe(loaded => {
        if (loaded !== '') this.selectedDataset = loaded;
      })
    );
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
  }

  onDatasetSelect(name: string) {
    this.filterService.clearFilters();
    this.configService.loadData(name);
  }

  upload() {
    this.showWizard = true;
    this.configService.modalOpen = true;
  }

  closePreprocessingWizard() {
    this.showWizard = false;
    this.configService.modalOpen = false;
  }

  download() {
    if (this.selectedDataset) {
      const glyphMap = this.dataLoader.getGlyphMap(this.selectedDataset);
      const schemaMap = this.dataLoader.getSchemaMap(this.selectedDataset);
      if (glyphMap && schemaMap) {
        this.dataExport.exportFilteredGlyphsAsCSV(glyphMap, schemaMap, this.selectedDataset);
      }
    }
  }

  fitAll() {
    this.configService.toggleFitToScreen();
  }

  screenshot() {
    this.configService.exportImage();
  }

  isUserDataset(name: string | null): boolean {
    if (!name) return false;
    const entry = this.datasetEntries.find(e => e.name === name);
    return !!entry && entry.source !== 'local';
  }

  async onDeleteDataset(name: string | null): Promise<void> {
    if (!name || !this.isUserDataset(name)) return;
    if (confirm(`Delete dataset "${name}"? This cannot be undone.`)) {
      await this.dataLoader.deleteDataset(name);
    }
  }
}
