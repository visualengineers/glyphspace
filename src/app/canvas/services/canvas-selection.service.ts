import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GlyphObject } from '../../glyph/glyph-object';
import { ItemFilter } from '../../shared/filter/item-filter';
import { IdFilter } from '../../shared/filter/id-filter';
import { FilterMode } from '../../shared/enum/filter-mode';
import { FilterService } from '../../services/filter.service';
import { ConfigService } from '../../services/config.service';
import { convertToScreenSpace } from '../../shared/helpers/three-helper';
import { getGlyphFromObject } from '../../shared/helpers/glyph-helper';

/** Overlays drawn over the canvas: pointer input on them is theirs, not the canvas's. */
const OVERLAY_SELECTOR = '.settings-panel, .tooltip, .nav-controls-panel';

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

  /**
   * Select the items drawn inside the selection rectangle (screen positions),
   * replacing the selection unless Shift is held.
   */
  selectObjectsInRectangle(
    glyphGroup: THREE.Group,
    camera: THREE.OrthographicCamera,
    rendererElement: HTMLCanvasElement
  ): void {
    this.selectionBox = { left: 0, top: 0, width: 0, height: 0 };

    const x1 = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const y1 = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const x2 = Math.max(this.selectionStart.x, this.selectionEnd.x);
    const y2 = Math.max(this.selectionStart.y, this.selectionEnd.y);

    const rect = rendererElement.getBoundingClientRect();
    const screen = new THREE.Vector2();
    const contained: GlyphObject[] = [];
    for (const obj of glyphGroup.children) {
      convertToScreenSpace(obj, camera, rect, screen);
      if (screen.x >= x1 && screen.x <= x2 && screen.y >= y1 && screen.y <= y2) {
        const glyph = getGlyphFromObject(obj);
        if (glyph) contained.push(glyph);
      }
    }

    this.selectGlyphs(contained, !this.isShiftDown);
  }

  /** Add the items to the selection (replacing it if `replace`); no items clears all selections. */
  selectGlyphs(glyphs: readonly GlyphObject[], replace = false): void {
    if (glyphs.length === 0) {
      this.filterService.clearIdFilters();
    } else {
      if (replace) this.filterService.clearIdFilters();
      const filter = this.selectionFilter as IdFilter;
      for (const glyph of glyphs) filter.add(glyph.id);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    this.selectionFilter.filterMode = FilterMode.Or;
    this.filterService.ensureFilter(this.selectionFilter);
    this.filterService.refreshFilters();
    this.config.redraw();
  }

  /** Whether the event happened on an overlay of the canvas (settings, tooltip, navigation). */
  isMouseOverOverlay(event: Event): boolean {
    const target = event.target;
    return target instanceof Element && target.closest(OVERLAY_SELECTOR) !== null;
  }
}
