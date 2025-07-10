import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataProviderService } from '../../../services/dataprovider.service';
import { ConfigService } from '../../../services/config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-tab',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-tab.component.html',
  styleUrl: './data-tab.component.scss'
})
export class DataTabComponent implements OnInit, OnDestroy {
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
}
