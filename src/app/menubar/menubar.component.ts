import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LegendDropdownComponent } from './legend-dropdown/legend-dropdown.component';
import { DataProviderService } from '../services/dataprovider.service';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-menubar',
    standalone: true,
    imports: [LegendDropdownComponent, CommonModule, FormsModule],
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss'],
})
export class MenuBarComponent implements OnInit, OnDestroy {
    @Output() addCanvas = new EventEmitter<void>();
    @Input() totalCells: number = 0;

    menuOpen = false;
    legendOpen = false;
    hasData = false;
    datasetNames: string[] = [];
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
        this.configService.loadData(name);
    }

    onContextSelect(context: string) {
        // Do something with selected context
    }

    toggleLegend() {
        this.legendOpen = !this.legendOpen;
    }

    upload() {
        console.log('Upload clicked');
    }

    download() {
        console.log('Download clicked');
    }

    fitAll() {
        this.configService.toggleFitToScreen();
    }
}
