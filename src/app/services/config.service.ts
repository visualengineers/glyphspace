import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InteractionCommand } from '../shared/enum/interaction-command';
import { GlyphObject } from '../glyph/glyph-object';
import * as d3 from 'd3';
import { Features } from '../shared/interfaces/glyph-feature';
import { hexToRgb } from '../shared/helpers/d3-helper';
import { GlyphConfiguration } from '../glyph/glyph-configuration';
import { ItemFilter } from '../shared/filter/item-filter';
import { IdFilter } from '../shared/filter/id-filter';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  // categorical color scale, that uses discrete color values on the domain 0-1
  private categoryColor = d3
    .scaleQuantize()
    .domain([0.0, 1.0])
    .range([
      '#4f366d',
      '#933765',
      '#d08f51',
      '#286367',
      '#8BC34A',
      '#FFC107',
      '#2196F3',
      '#FF5722',
      '#607D8B',
      '#BF3330'
    ] as any);

  // continuous color scale that interpolates the domain 0-1 on two color values
  // Reminder: If you change the colors here, don't forget to change $color-scale-low
  // and $color-scale-high in colors.scss
  private rangeColor = d3
    .scaleLinear<any, any>()
    .domain([0.0, 0.5, 1.0])
    .range(['#198FBD', '#F7D529', '#F7295B']);

  private _activeFeatures: string[] = [];
  private _colorFeature: string = "";
  private _scaleLinear: boolean = false;
  private _colorRange: boolean = true; // switch between continuous and discrete color scale
  private _featureLabels: Record<string, string> = {};
  private _dataSource: string = "";

  private config = new GlyphConfiguration();

  private glyphConfigSubject = new BehaviorSubject<GlyphConfiguration>(this.config);
  glyphConfigSubject$ = this.glyphConfigSubject.asObservable();

  private commandSubject = new BehaviorSubject<InteractionCommand>(InteractionCommand.noop);
  commandSubject$ = this.commandSubject.asObservable();

  private redrawGlyphSubject = new BehaviorSubject<GlyphObject | null>(null);
  redrawGlyphSubject$ = this.redrawGlyphSubject.asObservable();

  private animateGlyphSubject = new BehaviorSubject<GlyphObject | null>(null);
  animateGlyphSubject$ = this.animateGlyphSubject.asObservable();

  private loadedDataSubject = new BehaviorSubject<string>("");
  loadedDataSubject$ = this.loadedDataSubject.asObservable();
  

  // --- Methods to update config ---
  redrawGlyph(glyph: GlyphObject) {
    this.redrawGlyphSubject.next(glyph);
  }

  reRender() {
      this.commandSubject.next(InteractionCommand.rerender);
  }
 
  animateGlyph(glyph: GlyphObject | null) {
    this.animateGlyphSubject.next(glyph);
  }

  loadData(name: string) {
    this.loadedDataSubject.next(name);
  }

  get dataSource(): string {
    return this._dataSource;
  }

  set dataSource(source: string) {
    this._dataSource = source;
  }

  get loadedData() {
    return this.loadedDataSubject.getValue();
  }

  redraw() {
    this.commandSubject.next(InteractionCommand.redraw);
  }

  toggleFitToScreen() {
    this.commandSubject.next(InteractionCommand.fittoscreen);
  }

  clearSelection() {
    this.commandSubject.next(InteractionCommand.clearselection);
  }

  getRgbaColor(features: Features): string {
    let currentColor = hexToRgb("#00cc88");
    if (features != null) {
      currentColor = this.color(features["1"][this._colorFeature]);
      if (!this.colorRange) currentColor = hexToRgb(currentColor);
    }

    return currentColor
  }

  getConfiguration(): GlyphConfiguration {
    return this.config;
  }

  updateConfiguration(): void {
    this.glyphConfigSubject.next(this.config);
  }

  replaceActiveFeatures(features: string[]) {
    this.activeFeatures.splice(0, this.activeFeatures.length);
    this.activeFeatures.push(...features);
  }

  get color(): any {
    return this._colorRange ? this.rangeColor : this.categoryColor;
  }

  get colorRange(): boolean {
    return this._colorRange;
  }

  set colorRange(flag: boolean) {
    this._colorRange = flag;
  }

  get activeFeatures() {
    return this._activeFeatures;
  }

  get featureLabels(): Record<string, string> {
    return this._featureLabels;
  }

  set featureLabels(labels: Record<string, string>) {
    this._featureLabels = { ...labels };
  }

  set scaleLinear(scale: boolean) {
    this._scaleLinear = scale;
  }

  get scaleLinear() {
    return this._scaleLinear;
  }

  set colorFeature(feature: string) {
    this._colorFeature = feature;
  }

  get colorFeature() {
    return this._colorFeature;
  }
}
