import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { InteractionCommand } from '../shared/enum/interaction-command';
import { GlyphObject } from '../glyph/glyph-object';
import * as d3 from 'd3';
import { Features } from '../shared/interfaces/glyph-feature';
import { hexToRgb } from '../shared/helpers/d3-helper';
import { GlyphConfiguration } from '../glyph/glyph-configuration';
import { COLOR_SCALES, ColorScale } from '../shared/interfaces/color-scale';
import { normalizeFeatureValue } from '../shared/helpers/color-helper';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  colorScales: ColorScale[] = COLOR_SCALES;

  private _activeFeatures: string[] = [];
  private _colorFeature = '';
  private _featureLabels: Record<string, string> = {};
  private _featureTypes: Record<string, string> = {};
  private _featureMaxValues: Record<string, number> = {};
  private _dataSource = '';
  private _selectedColorScale = 0;

  // Flag to indicate if a modal (like preprocessing wizard) is open
  // Used to hide tooltips when modals are displayed
  private modalOpenSubject = new BehaviorSubject<boolean>(false);
  modalOpenSubject$ = this.modalOpenSubject.asObservable();

  get modalOpen(): boolean {
    return this.modalOpenSubject.getValue();
  }

  set modalOpen(value: boolean) {
    this.modalOpenSubject.next(value);
  }

  private config = new GlyphConfiguration();

  private removeCanvasSubject = new BehaviorSubject<number>(0);
  removeCanvasSubject$ = this.removeCanvasSubject.asObservable();

  private glyphConfigSubject = new BehaviorSubject<GlyphConfiguration>(this.config);
  glyphConfigSubject$ = this.glyphConfigSubject.asObservable();

  private commandSubject = new Subject<InteractionCommand>();
  commandSubject$ = this.commandSubject.asObservable();

  private redrawGlyphSubject = new Subject<GlyphObject | null>();
  redrawGlyphSubject$ = this.redrawGlyphSubject.asObservable();

  private drawMagicLensGlyphsSubject = new Subject<GlyphObject[] | null>();
  drawMagicLensGlyphsSubject$ = this.drawMagicLensGlyphsSubject.asObservable();

  private animateGlyphSubject = new Subject<GlyphObject | null>();
  animateGlyphSubject$ = this.animateGlyphSubject.asObservable();

  private loadedDataSubject = new BehaviorSubject<string>('');
  loadedDataSubject$ = this.loadedDataSubject.asObservable();

  // --- Methods to update config ---
  redrawGlyph(glyph: GlyphObject) {
    this.redrawGlyphSubject.next(glyph);
  }

  reRender() {
    this.commandSubject.next(InteractionCommand.rerender);
  }

  removeCanvas(id: number) {
    this.removeCanvasSubject.next(id);
  }

  drawMagicLensGlyphs(glyphs: GlyphObject[]) {
    this.drawMagicLensGlyphsSubject.next(glyphs);
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

  exportImage() {
    this.commandSubject.next(InteractionCommand.exportimage);
  }

  clearSelection() {
    this.commandSubject.next(InteractionCommand.clearselection);
  }

  getRgbaColor(features: Features): string {
    let currentColor = hexToRgb('#00cc88');
    if (features != null) {
      const featureValue = normalizeFeatureValue(
        features['1'][this._colorFeature],
        this._colorFeature,
        this._featureTypes,
        this._featureMaxValues
      );

      const scale = this.color;
      if (scale) {
        currentColor = scale(featureValue);
        if (!this.colorRange) currentColor = hexToRgb(currentColor);
      }
    }

    return currentColor;
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

  get color(): d3.ScaleLinear<string, string> | d3.ScaleQuantize<string> | undefined {
    return this.colorScales.find(s => s.id === this._selectedColorScale)?.scale;
  }

  get colorRange(): number {
    return this._selectedColorScale;
  }

  set colorRange(id: number) {
    this._selectedColorScale = id;
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

  set colorFeature(feature: string) {
    this._colorFeature = feature;
  }

  get colorFeature() {
    return this._colorFeature;
  }

  set featureTypes(types: Record<string, string>) {
    this._featureTypes = { ...types };
  }

  get featureTypes(): Record<string, string> {
    return this._featureTypes;
  }

  set featureMaxValues(maxValues: Record<string, number>) {
    this._featureMaxValues = { ...maxValues };
  }

  get featureMaxValues(): Record<string, number> {
    return this._featureMaxValues;
  }
}
