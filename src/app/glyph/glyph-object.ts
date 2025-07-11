import { Object3D } from "three";
import { Coordinates } from "../shared/interfaces/coordinates";
import { ZoomLevel } from "../shared/enum/zoom-level";
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Features, StringStringMap } from "../shared/interfaces/glyph-feature";
import { GlyphCacheObject } from "./glyph-cache-object";
import { ConfigService } from "../services/config.service";
import { GlyphType } from "../shared/enum/glyph-type";
import { GlyphSizeInfo } from "./glyph-size-info";
import { DataProcessorService } from "../services/data-processor";
import { createGrayPlaceholderTexture } from "../shared/helpers/three-helper";

export class GlyphObject {
    id: string;
    private config!: ConfigService;
    private dataProcessor!: DataProcessorService;
    positions: {
        [timestamp: string]: {
            [algorithm: string]: Coordinates;
        };
    } = {};
    defaultcontext = 0;
    features!: Features;
    values: StringStringMap | undefined;
    currentContext = 1;
    renderCache = new Map<number, GlyphCacheObject>();
    passive = false;
    highlighted = false;
    isInLense = false;
    lensCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    highlightColor: number = 0xe3ccd3;
    passivecolor: number = 0xe0e0e0;
    axesColor: number = 0xa0a0a0;

    constructor(id: string, config: ConfigService, dataProcessor: DataProcessorService) {
        this.id = id;
        this.config = config;
        this.dataProcessor = dataProcessor;
    }

    public getPosition(timestamp: string, algorithm: string): Coordinates {
        return this.positions[timestamp][algorithm];
    }

    public clearCache(owner: number) {
        this.renderCache.delete(owner);
    }

    public getCacheObject(owner = 0, timestamp: string, algorithm: string): GlyphCacheObject {
        let cacheObject = this.renderCache.get(owner);
        if (cacheObject == undefined || cacheObject == null) {
            cacheObject = new GlyphCacheObject(this.id, { ... this.getPosition(timestamp, algorithm) });
            this.renderCache.set(owner, cacheObject);
        }

        return cacheObject;
    }

    public getMesh(timestamp: string, algorithm: string, owner = 0): Object3D | undefined {
        const cacheObject = this.getCacheObject(owner, timestamp, algorithm);
        return cacheObject.mesh;
    }

    public setHighlighted(highlight: boolean) {
        if (this.highlighted == highlight) return;

        this.highlighted = highlight;
    }

    private getCurrentColor(trueColor = false): number {
        if (this.highlighted && !trueColor) {
            return this.highlightColor;
        }
        if (this.passive && !trueColor) {
            return this.passivecolor;
        }

        let currentColor = 0x00cc88;
        if (this.features != null) {
            currentColor = this.config.color(this.features["1"][this.config.colorFeature]);
        }

        return currentColor;
    }

    public render(sizeInfo: GlyphSizeInfo, timestamp: string, algorithm: string, owner = 0, clustered = false): THREE.Object3D | null {
        const cacheObject = this.getCacheObject(owner, timestamp, algorithm);

        let mesh: THREE.Object3D;

        if (sizeInfo.currentZoomLevel == ZoomLevel.low) {
            if (clustered && cacheObject.isClustered && !cacheObject.isClusterRepresentative) {
                return null; // Omit this glyph entirely
            }

            const currentColor = this.getCurrentColor();

            if (cacheObject.isClusterRepresentative && clustered) {
                // Render as an outlined circle (no fill)
                const ringGeom = new THREE.RingGeometry(sizeInfo.radius - 1, sizeInfo.radius, 32);
                const ringMat = new THREE.MeshBasicMaterial({ color: currentColor, side: THREE.DoubleSide });
                mesh = new THREE.Mesh(ringGeom, ringMat);
            } else {
                // Render as filled circle
                const geom = new THREE.CircleGeometry(sizeInfo.radius);
                const mat = new THREE.MeshBasicMaterial({ color: currentColor });
                mesh = new THREE.Mesh(geom, mat);
            }
        } else {
            if (this.config.getConfiguration().glyphType == GlyphType.Star) {
                mesh = this.createRadarChart(sizeInfo, this.config.getConfiguration().scaleLinear, this.currentContext);
            } else if (this.config.getConfiguration().glyphType == GlyphType.Whisker) {
                mesh = this.createWhiskerGlyph(sizeInfo, this.config.getConfiguration().scaleLinear, this.currentContext);
            } else if (this.config.getConfiguration().glyphType == GlyphType.Thumb) {
                mesh = this.createThumbnail(sizeInfo);
            } else {
                mesh = this.createFlowerGlyph(sizeInfo, this.config.getConfiguration().scaleLinear, this.currentContext);
            }
        }

        mesh.position.set(cacheObject.x ?? 0, cacheObject.y ?? 0, 0);
        mesh.userData = { item: new WeakRef(this) };
        mesh.renderOrder = this.passive ? 1 : 99;
        cacheObject.mesh = mesh;

        return mesh;
    }

    private applyThumbnailTexture(image: HTMLImageElement | ImageBitmap, mesh: THREE.Mesh, mat: THREE.MeshBasicMaterial, sizeInfo: GlyphSizeInfo) {
        const originalWidth = image.width;
        const originalHeight = image.height;

        const maxDim = sizeInfo.radius * 3;
        const widthRatio = maxDim / originalWidth;
        const heightRatio = maxDim / originalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1);

        const finalWidth = originalWidth * scale;
        const finalHeight = originalHeight * scale;

        // Replace geometry to match image aspect ratio
        const geom = new THREE.PlaneGeometry(finalWidth, finalHeight);
        mesh.geometry.dispose();
        mesh.geometry = geom;

        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;

        mat.map = texture;
        mat.needsUpdate = true;

        this.config.reRender();
    }

    private createThumbnail(sizeInfo: GlyphSizeInfo) {
        const placeholderTexture = createGrayPlaceholderTexture();
        const geom = new THREE.PlaneGeometry(sizeInfo.radius * 2, sizeInfo.radius * 2);
        const mat = new THREE.MeshBasicMaterial({ map: placeholderTexture, transparent: true });
        const mesh = new THREE.Mesh(geom, mat);

        const file = `${this.config.loadedData}/${this.id}.jpg`;

        if (this.config.dataSource == "wasm") {
            this.dataProcessor.requestThumb(file).subscribe((bitmap) => {
                if (bitmap) {
                    this.applyThumbnailTexture(bitmap, mesh, mat, sizeInfo);
                }
            });
        } else {
            const image = new Image();
            image.src = `assets/thumbnails/${this.config.loadedData}/${this.id}.jpg`;
            image.crossOrigin = 'anonymous'; // only needed if assets served from different domain (unlikely in local app)

            image.onload = () => {
                this.applyThumbnailTexture(image, mesh, mat, sizeInfo);
            };

            image.onerror = () => {
                console.warn(`Failed to load thumbnail from local: ${image.src}`);
            };
        }
        return mesh;
    }

    private createRadarChart(sizeInfo: GlyphSizeInfo, linearScale = false, contextId: number): THREE.Object3D {
        const group = new THREE.Group();
        this.addBackgroundCircle(group, sizeInfo);

        const ctx = this.getFeatureContext(contextId);
        if (!ctx) return group;

        const { featureMap, keys, values, maxValue, segments } = ctx;

        const color = this.getCurrentColor(sizeInfo.currentZoomLevel == ZoomLevel.high);

        this.addCoordinateAxes(group, segments, sizeInfo);
        if (this.addPlaceHolder(group, values, sizeInfo)) return group;

        const points: THREE.Vector2[] = [];

        keys.forEach((key, i) => {
            const angle = (i / segments) * Math.PI * 2;
            const value = +featureMap[key] || 0;
            const norm = linearScale ? value : value / maxValue;
            const x = Math.cos(angle) * sizeInfo.radius * norm;
            const y = Math.sin(angle) * sizeInfo.radius * norm;
            points.push(new THREE.Vector2(x, y));
        });

        // === Fill shape ===
        const shape = new THREE.Shape(points);
        const fillMat = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        group.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), fillMat));

        if (this.config.getConfiguration().useContour) {
            // === Contour stroke using Line2 for thick lines ===
            // Prepare positions array (x,y,z), close path by repeating first point
            const closedPoints = [...points.map(p => new THREE.Vector3(p.x, p.y, 0))];
            closedPoints.push(closedPoints[0].clone());

            // Convert to flat array for LineGeometry
            const positions: number[] = [];
            closedPoints.forEach(p => {
                positions.push(p.x, p.y, p.z);
            });

            // Create LineGeometry and set positions
            const lineGeom = new LineGeometry();
            lineGeom.setPositions(positions);

            // Create LineMaterial with thickness (adjust linewidth as needed)
            const lineMat = new LineMaterial({
                color: color,
                linewidth: sizeInfo.contourThickness,  // world units, tweak for your scene scale
                transparent: true,
                opacity: 0.9,
            });

            // Create Line2 mesh and add to group
            const line = new Line2(lineGeom, lineMat);
            line.computeLineDistances(); // required for dashed lines (optional here)
            line.scale.set(1, 1, 1);
            group.add(line);
        }

        return group;
    }

    private createFlowerGlyph(
        sizeInfo: GlyphSizeInfo,
        linearScale = false,
        contextId: number
    ): THREE.Object3D {
        const group = new THREE.Group();
        this.addBackgroundCircle(group, sizeInfo);

        const ctx = this.getFeatureContext(contextId);
        if (!ctx) return group;

        const { featureMap, keys, values, maxValue, segments } = ctx;
        this.addCoordinateAxes(group, segments, sizeInfo);
        if (this.addPlaceHolder(group, values, sizeInfo)) return group;

        const color = this.getCurrentColor(sizeInfo.currentZoomLevel == ZoomLevel.high);

        keys.forEach((key, i) => {
            const value = +featureMap[key] || 0;
            if (value <= 0) return;

            const norm = linearScale ? value : value / maxValue;
            const petalLength = sizeInfo.radius * norm;
            const baseWidth = petalLength * 0.4;

            // Create petal shape
            const path = new THREE.Shape();
            path.moveTo(0, 0);

            path.bezierCurveTo(
                baseWidth * 0.25, -petalLength * 0.3,
                baseWidth * 0.6, -petalLength * 0.75,
                0, -petalLength
            );
            path.bezierCurveTo(
                -baseWidth * 0.6, -petalLength * 0.75,
                -baseWidth * 0.25, -petalLength * 0.3,
                0, 0
            );

            // Petal fill mesh
            const geom = new THREE.ShapeGeometry(path);
            const mat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geom, mat);

            // Add the fill mesh
            const angle = (i / segments) * Math.PI * 2;
            mesh.rotation.z = angle - (3 * Math.PI) / 2;
            group.add(mesh);

            if (this.config.getConfiguration().useContour) {
                // === Create contour using Line2 ===

                // Extract points from shape to create contour geometry
                const contourPoints: THREE.Vector3[] = [];

                // Move along the bezier curves with manual points sampling or use getPoints()
                // THREE.Shape has getPoints() that returns Vector2 points on the outline
                const outlinePoints = path.getPoints(50); // 50 points for smoothness

                // Convert Vector2[] to Vector3[] for LineGeometry
                outlinePoints.forEach(p => {
                    contourPoints.push(new THREE.Vector3(p.x, p.y, 0));
                });
                // Close the contour by adding the first point at the end
                contourPoints.push(contourPoints[0].clone());

                // Prepare flat positions array
                const positions: number[] = [];
                contourPoints.forEach(p => {
                    positions.push(p.x, p.y, p.z);
                });

                const lineGeom = new LineGeometry();
                lineGeom.setPositions(positions);

                const lineMat = new LineMaterial({
                    color,
                    linewidth: sizeInfo.contourThickness, // Adjust thickness to your liking
                    transparent: true,
                    opacity: 0.9,
                });

                const contourLine = new Line2(lineGeom, lineMat);
                contourLine.computeLineDistances();
                contourLine.scale.set(1, 1, 1);
                contourLine.rotation.z = angle - (3 * Math.PI) / 2; // same rotation as petal

                group.add(contourLine);
            }
        });

        return group;
    }

    private createWhiskerGlyph(
        sizeInfo: GlyphSizeInfo,
        linearScale = false,
        contextId: number
    ): THREE.Object3D {
        const group = new THREE.Group();
        this.addBackgroundCircle(group, sizeInfo);

        const ctx = this.getFeatureContext(contextId);
        if (!ctx) return group;

        const { featureMap, keys, values, maxValue, segments } = ctx;
        this.addCoordinateAxes(group, segments, sizeInfo);
        if (this.addPlaceHolder(group, values, sizeInfo)) return group;

        const color = this.getCurrentColor(sizeInfo.currentZoomLevel == ZoomLevel.high);

        keys.forEach((key, i) => {
            const value = +featureMap[key] || 0;
            if (value <= 0) return;

            const norm = linearScale ? value : value / maxValue;
            const whiskerLength = sizeInfo.radius * norm;

            const barWidth = 0.8;
            const barHeight = whiskerLength;

            const angle = (i / segments) * Math.PI * 2;
            const container = new THREE.Object3D();
            container.rotation.z = angle - (3 * Math.PI) / 2;

            const geom = new THREE.PlaneGeometry(barWidth, barHeight);
            const mat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geom, mat);

            mesh.position.y = -barHeight / 2;
            container.add(mesh);
            group.add(container);
        });

        return group;
    }

    // === Shared feature extraction and setup ===
    private getFeatureContext(contextId: number) {
        if (!this.features) return null;

        const featureMap = Object.fromEntries(
            Object.entries(this.features[contextId] || {}).filter(([k]) =>
                this.config.activeFeatures.includes(k)
            )
        );
        const keys = Object.keys(featureMap);
        const values = keys.map(k => +featureMap[k]);
        const maxValue = Math.max(...values) || 1;
        const segments = keys.length;

        return { featureMap, keys, values, maxValue, segments };
    }

    private addPlaceHolder(group: THREE.Group, values: number[], sizeInfo: GlyphSizeInfo): boolean {
        if (values.every(v => v <= 0.001)) {
            const geom = new THREE.CircleGeometry(sizeInfo.getRadius(ZoomLevel.low) / 4);
            const mat = new THREE.MeshBasicMaterial({
                color: this.getCurrentColor(true),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            group.add(new THREE.Mesh(geom, mat));
            return true;
        }
        return false;
    }

    // === Shared background circle ===
    private addBackgroundCircle(group: THREE.Group, sizeInfo: GlyphSizeInfo) {
        const background = (sizeInfo.currentZoomLevel == ZoomLevel.high) && this.config.getConfiguration().useBackground;
        if (!background) return;

        const geom = new THREE.CircleGeometry(sizeInfo.radius, 64);
        const mat = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
        if (this.highlighted) mat.color.setHex(this.highlightColor);
        group.add(new THREE.Mesh(geom, mat));

        // Optional contour/stroke
        if (this.config.getConfiguration().useContour) {
            const ringWidth = sizeInfo.radius * 0.01;
            const contourGeom = new THREE.RingGeometry(sizeInfo.radius - ringWidth, sizeInfo.radius, 64);
            const contourMat = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                side: THREE.DoubleSide,
                depthTest: false // always draw on top
            });

            const contour = new THREE.Mesh(contourGeom, contourMat);
            contour.renderOrder = 999; // draw last
            group.add(contour);
        }
    }

    // === Shared axes drawing ===
    private addCoordinateAxes(group: THREE.Group, segments: number, sizeInfo: GlyphSizeInfo) {
        const axes = (sizeInfo.currentZoomLevel == ZoomLevel.high) && this.config.getConfiguration().useCoordinateSystem;
        if (!axes) return;

        const lineWidth = sizeInfo.contourThickness / 3; // 0.1;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const geom = new THREE.PlaneGeometry(lineWidth, sizeInfo.radius);
            geom.translate(0, sizeInfo.radius / 2, 0);
            const mat = new THREE.MeshBasicMaterial({ color: this.axesColor, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.rotation.z = angle - Math.PI / 2;
            group.add(mesh);
        }
    }
}