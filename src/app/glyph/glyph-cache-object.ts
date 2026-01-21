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

    // Current animated position for instanced rendering
    // These values lerp toward position.x/y during animation
    currentX?: number | undefined;
    currentY?: number | undefined;

    // Track the timestamp/algorithm used to create this cache object
    // so we can detect when the position needs to be refreshed
    private _timestamp: string = '';
    private _algorithm: string = '';

    private _cachedMesh: Object3D | undefined = undefined;

    constructor(id: string, position: Coordinates, timestamp: string = '', algorithm: string = '') {
        this.id = id;
        this.position = position;
        this.x = position.x;
        this.y = position.y;
        this.currentX = position.x;
        this.currentY = position.y;
        this._timestamp = timestamp;
        this._algorithm = algorithm;
    }

    /**
     * Check if this cache object was created for a different timestamp/algorithm.
     * If so, the position data may be stale and needs to be refreshed.
     */
    needsPositionRefresh(timestamp: string, algorithm: string): boolean {
        return this._timestamp !== timestamp || this._algorithm !== algorithm;
    }

    /**
     * Update the target position for a new timestamp/algorithm combination.
     * The currentX/currentY are preserved so animation can lerp from them.
     * The mesh is preserved so it can animate to the new position.
     */
    updatePosition(position: Coordinates, timestamp: string, algorithm: string): void {
        // Initialize currentX/currentY from current mesh position if available
        // This ensures animation starts from where the glyph currently is displayed
        if (this._cachedMesh) {
            this.currentX = this._cachedMesh.position.x;
            this.currentY = this._cachedMesh.position.y;
        } else if (this.currentX === undefined) {
            this.currentX = this.x ?? this.position.x;
        }
        if (this.currentY === undefined) {
            this.currentY = this.y ?? this.position.y;
        }

        // Update target position
        this.position = position;
        this.x = position.x;
        this.y = position.y;
        this._timestamp = timestamp;
        this._algorithm = algorithm;
        // NOTE: Don't clear the mesh - let the animation loop move it to the new position
    }

    /**
     * Lerp current position toward target position.
     * Returns true if animation is complete (positions match).
     */
    lerpToTarget(speed: number): boolean {
        const targetX = this.position.x;
        const targetY = this.position.y;
        const currX = this.currentX ?? targetX;
        const currY = this.currentY ?? targetY;

        // Lerp toward target
        this.currentX = currX + (targetX - currX) * speed;
        this.currentY = currY + (targetY - currY) * speed;

        // Check if we're close enough to snap to target
        const epsilon = 0.1;
        const doneX = Math.abs(this.currentX - targetX) < epsilon;
        const doneY = Math.abs(this.currentY - targetY) < epsilon;

        if (doneX && doneY) {
            this.currentX = targetX;
            this.currentY = targetY;
            return true;
        }
        return false;
    }

    /**
     * Snap current position to target immediately (no animation).
     */
    snapToTarget(): void {
        this.currentX = this.position.x;
        this.currentY = this.position.y;
    }

    get mesh() : Object3D | undefined {
        return this._cachedMesh;
    }

    set mesh(mesh: Object3D | undefined) {
        this._cachedMesh = mesh;
    }
}