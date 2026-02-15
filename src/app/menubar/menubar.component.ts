import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LegendDropdownComponent } from './legend-dropdown/legend-dropdown.component';
import { PreprocessingWizardComponent } from '../preprocessing-wizard/preprocessing-wizard.component';
import { DataProviderService } from '../services/dataprovider.service';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-menubar',
    standalone: true,
    imports: [LegendDropdownComponent, PreprocessingWizardComponent, CommonModule, FormsModule],
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss'],
})
export class MenuBarComponent implements OnInit, OnDestroy {
    @Output() addCanvas = new EventEmitter<void>();
    @Input() totalCells: number = 0;

    menuOpen = false;
    legendOpen = false;
    showWizard = false;
    hasData = false;
    datasetNames: string[] = [];
    datasetEntries: { name: string; source: string }[] = [];
    selectedDataset: string | null = null;

    private dataSub = new Subscription();

    constructor(
        private dataProvider: DataProviderService,
        private configService: ConfigService
    ) { }

    ngOnInit(): void {
        this.dataSub.add(
            this.dataProvider.dataSetCollectionSubject$.subscribe(collection => {
                this.hasData = !!collection && collection.length > 0 && collection.at(0)?.dataset != "";
                this.datasetNames = collection.map(entry => entry.dataset);
                this.datasetEntries = collection.map(entry => ({
                    name: entry.dataset,
                    source: entry.source
                }));
            }));
        this.dataSub.add(
            this.configService.loadedDataSubject$.subscribe(loaded => {
                if (loaded != "") this.selectedDataset = loaded;
            }));
    }

    ngOnDestroy(): void {
        this.dataSub?.unsubscribe();
    }

    onDatasetSelect(name: string) {
        this.dataProvider.clearFilters();
        this.configService.loadData(name);        
    }

    onContextSelect(context: string) {
        // Do something with selected context
    }

    toggleLegend() {
        this.legendOpen = !this.legendOpen;
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
        if (this.selectedDataset) this.dataProvider.exportFilteredGlyphsAsCSV(this.selectedDataset);
    }

    fitAll() {
        this.configService.toggleFitToScreen();
    }

    isUserDataset(name: string | null): boolean {
        if (!name) return false;
        const entry = this.datasetEntries.find(e => e.name === name);
        return !!entry && entry.source !== 'local';
    }

    async onDeleteDataset(name: string | null): Promise<void> {
        if (!name || !this.isUserDataset(name)) return;
        if (confirm(`Delete dataset "${name}"? This cannot be undone.`)) {
            await this.dataProvider.deleteDataset(name);
        }
    }
}
