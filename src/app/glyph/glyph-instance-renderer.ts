import * as THREE from 'three';
import { GlyphObject } from './glyph-object';
import { GlyphType } from '../shared/enum/glyph-type';

const vertexShader = `
attribute vec2 instancePosition;
attribute float instanceRadius;
attribute vec3 instanceColor;
attribute float instanceGlyphType;
attribute float instanceClusterFlag;

varying vec2 vUv;
varying vec3 vColor;
varying float vGlyphType;
varying float vClusterFlag;

void main() {
    vUv = uv * 2.0 - 1.0; // [-1,1] coordinates on quad
    vColor = instanceColor;
    vGlyphType = instanceGlyphType;
    vClusterFlag = instanceClusterFlag;

    vec3 pos = position;
    pos.xy *= instanceRadius;
    pos.xy += instancePosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
#define PI 3.14159265359

uniform sampler2D featureTex;
uniform float maxSegments;
uniform int lodLevel;
uniform bool showContour;
uniform float contourWidth;

varying vec2 vUv;
varying vec3 vColor;
varying float vGlyphType;
varying float vClusterFlag;

float getFeature(float row, float index) {
    float u = (index + 0.5) / maxSegments;
    float v = (row + 0.5) / float(textureSize(featureTex, 0).y);
    return texture(featureTex, vec2(u, v)).r;
}

bool drawDot(float r) {
    return r <= 1.0;
}

bool drawRing(float r) {
    return r <= 1.0 && r >= 0.85;
}

bool drawRadar(float r, float angle, float segments, float featureOffset) {
    float idx = floor(angle / (2.0 * PI) * segments);
    float value = getFeature(featureOffset, idx);
    return r <= value;
}

float petalWidth(float t) {
    return pow(1.0 - t, 0.5) * sin(t * PI);
}

bool drawFlower(float r, float angle, float segments, float featureOffset) {
    float petalIndex = floor(angle / (2.0 * PI) * segments);
    float petalAngle = (petalIndex + 0.5) / segments * 2.0 * PI;

    float localAngle = angle - petalAngle;
    localAngle = mod(localAngle + PI, 2.0 * PI) - PI;

    float petalLength = getFeature(featureOffset, petalIndex);
    if (petalLength <= 0.0) return false;

    float t = r / petalLength;
    if (t > 1.0) return false;

    float width = petalWidth(t);
    float lateral = abs(sin(localAngle)) * r;
    return lateral <= width;
}

void main() {
    float r = length(vUv);
    if (r > 1.0) discard;

    float angle = atan(vUv.y, vUv.x);
    if (angle < 0.0) angle += 2.0 * PI;

    bool visible = false;

    // DOT / Ring LOD
    if (lodLevel == 0) {
        if (vClusterFlag > 0.5) visible = drawRing(r);
        else visible = drawDot(r);
    }
    // RADAR
    else if (vGlyphType == 1.0) visible = drawRadar(r, angle, maxSegments, 0.0);
    // FLOWER
    else if (vGlyphType == 2.0) visible = drawFlower(r, angle, maxSegments, 0.0);

    if (!visible) discard;

    gl_FragColor = vec4(vColor, 0.6);
}
`


export class GlyphInstancedRenderer {
    mesh: THREE.InstancedMesh;
    material: THREE.ShaderMaterial;

    private indexMap = new Map<string, number>();
    private count = 0;

    constructor(maxGlyphs: number, featureTexture: THREE.DataTexture) {
        const geometry = new THREE.PlaneGeometry(2, 2);

        this.material = this.createGlyphMaterial(featureTexture);

        this.mesh = new THREE.InstancedMesh(
            geometry,
            this.material,
            maxGlyphs
        );

        this.initAttributes(maxGlyphs);
    }

    private initAttributes(count: number) {
        const g = this.mesh.geometry as THREE.BufferGeometry;

        g.setAttribute('instancePosition',
            new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2));

        g.setAttribute('instanceRadius',
            new THREE.InstancedBufferAttribute(new Float32Array(count), 1));

        g.setAttribute('instanceColor',
            new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3));

        g.setAttribute('instanceGlyphType',
            new THREE.InstancedBufferAttribute(new Float32Array(count), 1));

        g.setAttribute('instanceClusterFlag',
            new THREE.InstancedBufferAttribute(new Float32Array(count), 1));
    }

    public setInstanceData(
        glyph: GlyphObject,
        data: {
            position: THREE.Vector2;
            radius: number;
            color: THREE.Color;
            glyphType: GlyphType;
            isClusterRepresentative: boolean;
            features: any;
        }
    ) {
        let idx = this.indexMap.get(glyph.id);
        if (idx === undefined) {
            idx = this.count++;
            this.indexMap.set(glyph.id, idx);
        }

        const g = this.mesh.geometry as THREE.BufferGeometry;

        (g.getAttribute('instancePosition') as any)
            .setXY(idx, data.position.x, data.position.y);

        (g.getAttribute('instanceRadius') as any)
            .setX(idx, data.radius);

        (g.getAttribute('instanceColor') as any)
            .setXYZ(idx, data.color.r, data.color.g, data.color.b);

        (g.getAttribute('instanceGlyphType') as any)
            .setX(idx, data.glyphType);

        (g.getAttribute('instanceClusterFlag') as any)
            .setX(idx, data.isClusterRepresentative ? 1 : 0);
    }

    public skipInstance(glyph: GlyphObject) {
        this.indexMap.delete(glyph.id);
    }

    public updateFeatureTexture(featureTexture: THREE.DataTexture) {
        this.material.uniforms['featureTex'].value = featureTexture;
    }

    private createGlyphMaterial(featureTexture: THREE.DataTexture): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                featureTex: { value: featureTexture },
                maxSegments: { value: 12 }, // adjust to your max features
                lodLevel: { value: 0 },
                showContour: { value: true },
                contourWidth: { value: 0.03 }
            },
            vertexShader,
            fragmentShader
        });
    }

}
