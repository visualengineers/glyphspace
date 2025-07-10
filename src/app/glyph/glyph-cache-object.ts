import { SimulationNodeDatum } from 'd3-force';
import { Coordinates } from '../shared/interfaces/coordinates';
import { ZoomLevel } from '../shared/enum/zoom-level';
import { Object3D } from 'three';

export class GlyphCacheObject implements SimulationNodeDatum {
    id: string;
    position: Coordinates;
    index?: number | undefined;
    x?: number | undefined;
    y?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | null | undefined;
    fy?: number | null | undefined;    
    visible = true;
    isClustered = false;
    isClusterRepresentative = false;

    private _cachedMesh: Object3D | undefined = undefined;

    constructor(id: string, position: Coordinates) {
        this.id = id;
        this.position = position;
        this.x = position.x;
        this.y = position.y;
    }

    get mesh() : Object3D | undefined {
        return this._cachedMesh;
    }

    set mesh(mesh: Object3D) {
        this._cachedMesh = mesh;
    }
}