import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  afterNextRender,
  Injector,
  inject,
} from '@angular/core';
import { GlyphType, getGlyphTypeName, hasFeatureAxes } from '../../shared/enum/glyph-type';
import {
  axesSvgPath,
  axisAngle,
  axisPoint,
  flowerPetalSvgPath,
  polygonSvgPath,
  starPoints,
} from '../../glyph/glyph-geometry';
import { MAX_GLYPH_AXES, MIN_GLYPH_AXES, canAddGlyphAxis, canRemoveGlyphAxis } from '../../glyph/glyph-axes';

/** Glyph drawing: SVG of SVG_SIZE px around its center, glyph radius GLYPH_RADIUS. */
const SVG_SIZE = 100;
const SVG_CENTER = SVG_SIZE / 2;
const GLYPH_RADIUS = 44;
/** Distance of the axis labels' anchor from the glyph center, just outside the drawing. */
const LABEL_RADIUS = SVG_CENTER + 6;
const LABEL_HEIGHT = 26;
/** Height of the stage holding drawing and labels: room for a label above and below. */
const STAGE_HEIGHT = 2 * (LABEL_RADIUS + LABEL_HEIGHT + 4);
/** Labels whose axis is this close to vertical sit centered above or below it. */
const VERTICAL_AXIS_COS = 0.35;

interface AxisLabel {
  id: string;
  number: number;
  name: string;
  /** Absolute position of the label box; it extends away from the glyph. */
  style: Record<string, string>;
}

interface Candidate {
  id: string;
  name: string;
}

let nextId = 0;

/**
 * Radial glyph legend: draws the current glyph with its axis labels around it.
 * A label can be selected to remove its axis; "Add axis" adds a feature.
 * Changes are reported as events; the parent updates the configuration.
 */
@Component({
  selector: 'app-glyph-legend',
  templateUrl: './glyph-legend.component.html',
  styleUrl: './glyph-legend.component.scss',
})
export class GlyphLegendComponent implements OnChanges {
  @Input({ required: true }) glyphType!: GlyphType;
  /** Feature ids of the glyph axes, in drawing order. */
  @Input() axes: readonly string[] = [];
  /** All feature ids that could become an axis. */
  @Input() featureIds: readonly string[] = [];
  @Input() labels: Record<string, string> = {};
  /** Axis lengths of the shown glyph as fractions of its radius, in axis order. */
  @Input() axisLengths: readonly number[] = [];
  @Input() color = '';

  @Output() axisAdded = new EventEmitter<string>();
  @Output() axisRemoved = new EventEmitter<string>();

  @ViewChild('addButton') addButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly GlyphType = GlyphType;
  readonly svgSize = SVG_SIZE;
  readonly svgCenter = SVG_CENTER;
  readonly glyphRadius = GLYPH_RADIUS;
  readonly stageHeight = STAGE_HEIGHT;
  readonly maxAxes = MAX_GLYPH_AXES;
  readonly ids = { hint: `legend-hint-${nextId}`, addPanel: `legend-add-${nextId++}` };

  axisLabels: AxisLabel[] = [];
  spokesPath = '';
  starPath = '';
  petalPaths: string[] = [];

  selectedAxis: string | null = null;
  addOpen = false;
  query = '';

  private injector = inject(Injector);

  ngOnChanges(): void {
    if (this.selectedAxis && !this.axes.includes(this.selectedAxis)) this.selectedAxis = null;
    if (!this.hasAxes) this.addOpen = false;
    this.layout();
  }

  get hasAxes(): boolean {
    return hasFeatureAxes(this.glyphType);
  }

  get canAddMore(): boolean {
    return this.axes.length < MAX_GLYPH_AXES;
  }

  get canRemoveSelected(): boolean {
    return this.selectedAxis !== null && canRemoveGlyphAxis(this.axes, this.selectedAxis);
  }

  /** Short help next to the "Add axis" button; it also explains why a control is disabled. */
  get hint(): string {
    if (!this.canAddMore) return `Limit of ${MAX_GLYPH_AXES} axes reached. Remove one to add another.`;
    if (this.axes.length <= MIN_GLYPH_AXES) return `A glyph needs at least ${MIN_GLYPH_AXES} axes.`;
    return 'Click a label to remove it.';
  }

  get removeTitle(): string {
    return this.canRemoveSelected ? 'Remove from glyph' : `A glyph needs at least ${MIN_GLYPH_AXES} axes.`;
  }

  get shapeDescription(): string {
    const names = this.axes.map(id => this.name(id)).join(', ');
    return `${getGlyphTypeName(this.glyphType)} glyph with the axes ${names}`;
  }

  /** Features that are not in the glyph yet, filtered by the search text. */
  get candidates(): Candidate[] {
    const query = this.query.trim().toLowerCase();
    return this.featureIds
      .filter(id => !this.axes.includes(id))
      .map(id => ({ id, name: this.name(id) }))
      .filter(c => c.name.toLowerCase().includes(query));
  }

  toggleSelected(axis: string): void {
    this.selectedAxis = this.selectedAxis === axis ? null : axis;
    this.addOpen = false;
  }

  removeSelected(): void {
    const axis = this.selectedAxis;
    if (axis === null || !canRemoveGlyphAxis(this.axes, axis)) return;
    this.selectedAxis = null;
    this.axisRemoved.emit(axis);
    // The label is gone; keep the keyboard focus nearby.
    this.addButton?.nativeElement.focus();
  }

  toggleAdd(): void {
    if (this.addOpen) {
      this.closeAdd();
      return;
    }
    if (!this.canAddMore) return;
    this.addOpen = true;
    this.selectedAxis = null;
    this.query = '';
    afterNextRender(() => this.searchInput?.nativeElement.focus(), { injector: this.injector });
  }

  closeAdd(returnFocus = false): void {
    this.addOpen = false;
    if (returnFocus) this.addButton?.nativeElement.focus();
  }

  add(featureId: string): void {
    if (!canAddGlyphAxis(this.axes, featureId)) return;
    this.axisAdded.emit(featureId);
  }

  /** Escape on a selected label: drop the selection, keep the focus on the label. */
  deselect(nameButton: HTMLButtonElement): void {
    this.selectedAxis = null;
    nameButton.focus();
  }

  private name(id: string): string {
    return this.labels[id] || id;
  }

  private layout(): void {
    const count = this.axes.length;
    this.spokesPath = axesSvgPath(count, GLYPH_RADIUS, SVG_CENTER, SVG_CENTER);
    const lengths = this.axes.map((_, i) => Math.max(0, this.axisLengths[i] ?? 0));
    this.starPath = polygonSvgPath(starPoints(lengths, GLYPH_RADIUS), SVG_CENTER, SVG_CENTER);
    this.petalPaths = lengths
      .map((length, i) =>
        length > 0 ? flowerPetalSvgPath(GLYPH_RADIUS * length, axisAngle(i, count), SVG_CENTER, SVG_CENTER) : ''
      )
      .filter(Boolean);
    this.axisLabels = this.axes.map((id, i) => ({
      id,
      number: i + 1,
      name: this.name(id),
      style: labelStyle(i, count),
    }));
  }
}

/**
 * Places a label at its axis just outside the glyph, growing away from it:
 * labels left and right of the glyph are anchored at their inner edge, labels
 * of (nearly) vertical axes are centered above or below the glyph.
 */
function labelStyle(index: number, count: number): Record<string, string> {
  const [x, y] = axisPoint(index, count, LABEL_RADIUS);
  const cos = Math.cos(axisAngle(index, count));
  const top = `${(STAGE_HEIGHT / 2 - y).toFixed(1)}px`;

  if (cos >= VERTICAL_AXIS_COS) {
    return {
      left: `calc(50% + ${x.toFixed(1)}px)`,
      top,
      'max-width': `calc(50% - ${x.toFixed(1)}px)`,
      transform: 'translateY(-50%)',
    };
  }
  if (cos <= -VERTICAL_AXIS_COS) {
    return {
      right: `calc(50% + ${(-x).toFixed(1)}px)`,
      top,
      'max-width': `calc(50% - ${(-x).toFixed(1)}px)`,
      transform: 'translateY(-50%)',
    };
  }
  return {
    left: `calc(50% + ${x.toFixed(1)}px)`,
    top,
    'max-width': '70%',
    transform: y > 0 ? 'translate(-50%, -100%)' : 'translateX(-50%)',
  };
}
