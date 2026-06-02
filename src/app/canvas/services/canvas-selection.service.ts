import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GlyphObject } from '../../glyph/glyph-object';
import { ItemFilter } from '../../shared/filter/item-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { FilterService } from '../../services/filter.service';
import { ConfigService } from '../../services/config.service';
import { convertToScreenSpace } from '../../shared/helpers/three-helper';

@Injectable()
export class CanvasSelectionService {
  selectionStart = new THREE.Vector2();
  selectionEnd = new THREE.Vector2();
  selectionFilter: ItemFilter = new IdFilter();
  selectionMode = false;
  isShiftDown = false;
  isSelecting = false;
  selectionBox = { left: 0, top: 0, width: 0, height: 0 };

  constructor(
    private filterService: FilterService,
    private config: ConfigService
  ) {}

  /** Returns the new selectionMode state */
  toggleSelectionMode(doToggle = true): boolean {
    this.selectionMode = !this.selectionMode && doToggle;
    return this.selectionMode;
  }

  updateSelectionBox(): void {
    const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const w = Math.abs(this.selectionEnd.x - this.selectionStart.x);
    const h = Math.abs(this.selectionEnd.y - this.selectionStart.y);
    this.selectionBox = { left: x, top: y, width: w, height: h };
  }

  selectObjectsInRectangle(
    glyphGroup: THREE.Group,
    camera: THREE.OrthographicCamera,
    rendererElement: HTMLCanvasElement,
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string
  ): void {
    this.selectionBox = { left: 0, top: 0, width: 0, height: 0 };

    const x1 = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const y1 = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const x2 = Math.max(this.selectionStart.x, this.selectionEnd.x);
    const y2 = Math.max(this.selectionStart.y, this.selectionEnd.y);

    const contained: THREE.Object3D[] = [];
    glyphGroup.children.forEach(obj => {
      const screen = convertToScreenSpace(obj, camera, rendererElement);
      if (screen.x >= x1 && screen.x <= x2 && screen.y >= y1 && screen.y <= y2) {
        contained.push(obj);
      }
    });

    this.highlightSelectedObjects(
      contained,
      glyphData,
      canvasId,
      selectedTimestamp,
      selectedAlgorithm,
      !this.isShiftDown
    );
  }

  highlightSelectedObjects(
    selectedObjects: THREE.Object3D[],
    glyphData: GlyphObject[],
    canvasId: number,
    selectedTimestamp: string,
    selectedAlgorithm: string,
    replace = false
  ): void {
    if (selectedObjects.length === 0) {
      this.filterService.clearIdFilters();
    } else {
      if (replace) this.filterService.clearIdFilters();
      for (const glyph of glyphData) {
        const cache = glyph.getCacheObject(canvasId, selectedTimestamp, selectedAlgorithm);
        const obj = cache.mesh;
        if (obj && selectedObjects.includes(obj)) {
          (this.selectionFilter as IdFilter).add(glyph.id);
        }
      }
    }
    this.applyFilters();
  }

  applyFilters(): void {
    this.selectionFilter.filterMode = FilterMode.Or;
    this.filterService.ensureFilter(this.selectionFilter);
    this.filterService.refreshFilters();
    this.config.redraw();
  }

  isMouseOverOverlay(event: MouseEvent): boolean {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    return (
      el?.closest('.settings-panel') !== null ||
      el?.closest('.tooltip-popup') !== null ||
      el?.closest('.nav-controls-panel') !== null
    );
  }
}
