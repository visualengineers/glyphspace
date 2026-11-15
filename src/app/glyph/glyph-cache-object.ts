import { SimulationNodeDatum } from 'd3';
import { Coordinates } from '../shared/interfaces/coordinates';
import { Object3D } from 'three';
import { ZoomLevel } from '../shared/enum/zoom-level';

/** State of one item in one canvas. */
export class GlyphCacheObject implements SimulationNodeDatum {
  id: string;
  /** Target position in canvas space: the selected projection, scaled to the canvas. */
  position: Coordinates;
  /**
   * Where the item is drawn: `position`, except while collision avoidance holds
   * it elsewhere or a transition moves it there. A new mesh is placed here; the
   * magic lens of another canvas moves enlarged meshes away from it for as long
   * as they are in the lens, without changing it.
   */
  display: { x: number; y: number };
  // d3 simulation state of collision avoidance
  index?: number | undefined;
  x?: number | undefined;
  y?: number | undefined;
  vx?: number | undefined;
  vy?: number | undefined;
  fx?: number | null | undefined;
  fy?: number | null | undefined;
  /** Whether the item lies in the canvas's view, as the last viewport clipping found. */
  visible = true;
  isClustered = false;
  isClusterRepresentative = false;

  private _cachedMesh: Object3D | undefined = undefined;

  constructor(id: string, position: Coordinates) {
    this.id = id;
    this.position = position;
    this.x = position.x;
    this.y = position.y;
    this.display = { x: position.x ?? 0, y: position.y ?? 0 };
  }

  /** The item's mesh in the canvas scene, if it is drawn. */
  get mesh(): Object3D | undefined {
    return this._cachedMesh;
  }

  set mesh(mesh: Object3D | undefined) {
    this._cachedMesh = mesh;
  }

  /** Whether aggregation leaves the item out: a cluster member other than its representative, at the low level. */
  isAggregatedAway(aggregated: boolean, level: ZoomLevel): boolean {
    return aggregated && level === ZoomLevel.low && this.isClustered && !this.isClusterRepresentative;
  }

  /** Move the item, and its mesh, to (x, y). */
  moveTo(x: number, y: number): void {
    this.display.x = x;
    this.display.y = y;
    this._cachedMesh?.position.set(x, y, 0);
  }
}
