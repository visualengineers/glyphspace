/**
 * Instanced Glyph Renderer for high-performance rendering of 40K+ glyphs
 *
 * Uses THREE.InstancedMesh and custom shaders to render thousands of glyphs
 * in a single draw call, dramatically reducing CPU overhead and draw calls.
 */

import * as THREE from 'three';
import { GlyphObject } from './glyph-object';
import { ZoomLevel } from '../shared/enum/zoom-level';
import { GlyphSizeInfo } from './glyph-size-info';

// Vertex shader for instanced circles (low zoom)
const circleVertexShader = `
  attribute vec3 instanceColor;
  attribute float instanceRadius;
  attribute float instanceAlpha;

  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    vColor = instanceColor;
    vAlpha = instanceAlpha;
    vUv = uv;

    // Scale the unit circle by instance radius
    vec3 transformed = position * instanceRadius;

    // Apply instance position from instanceMatrix
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for instanced circles (low zoom)
const circleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    // Create smooth circle using distance from center
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);

    // Smooth edge antialiasing
    float alpha = 1.0 - smoothstep(0.45, 0.5, dist);

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

// Vertex shader for star/radar glyphs (high zoom)
const starVertexShader = `
  attribute vec3 instanceColor;
  attribute float instanceRadius;
  attribute float instanceAlpha;
  attribute vec3 featureValues1;  // Features 1-3
  attribute vec3 featureValues2;  // Features 4-6
  attribute vec3 featureValues3;  // Features 7-9
  attribute vec3 featureValues4;  // Features 10-12

  varying vec3 vColor;
  varying float vAlpha;
  varying float vRadius;
  varying vec2 vUv;
  varying vec3 vFeatures1;
  varying vec3 vFeatures2;
  varying vec3 vFeatures3;
  varying vec3 vFeatures4;

  void main() {
    vColor = instanceColor;
    vAlpha = instanceAlpha;
    vRadius = instanceRadius;
    vUv = uv;
    vFeatures1 = featureValues1;
    vFeatures2 = featureValues2;
    vFeatures3 = featureValues3;
    vFeatures4 = featureValues4;

    // Scale by instance radius
    vec3 transformed = position * instanceRadius;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for star/radar glyphs (high zoom)
const starFragmentShader = `
  #define PI 3.14159265359
  #define MAX_FEATURES 12

  uniform int numFeatures;
  uniform float featureMaxValues[MAX_FEATURES];
  uniform bool useBackground;
  uniform bool useContour;
  uniform vec3 backgroundColor;
  uniform vec3 axisColor;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vRadius;
  varying vec2 vUv;
  varying vec3 vFeatures1;
  varying vec3 vFeatures2;
  varying vec3 vFeatures3;
  varying vec3 vFeatures4;

  float getFeatureValue(int index) {
    if (index < 3) {
      if (index == 0) return vFeatures1.x;
      if (index == 1) return vFeatures1.y;
      return vFeatures1.z;
    } else if (index < 6) {
      if (index == 3) return vFeatures2.x;
      if (index == 4) return vFeatures2.y;
      return vFeatures2.z;
    } else if (index < 9) {
      if (index == 6) return vFeatures3.x;
      if (index == 7) return vFeatures3.y;
      return vFeatures3.z;
    } else {
      if (index == 9) return vFeatures4.x;
      if (index == 10) return vFeatures4.y;
      return vFeatures4.z;
    }
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    float dist = length(pos);
    float angle = atan(pos.y, pos.x);

    // Background circle
    if (useBackground && dist < 0.5) {
      // Will be blended
    }

    // Calculate which segment we're in
    float segmentAngle = 2.0 * PI / float(numFeatures);
    float normalizedAngle = angle + PI; // 0 to 2PI
    int segment = int(floor(normalizedAngle / segmentAngle));
    float segmentProgress = mod(normalizedAngle, segmentAngle) / segmentAngle;

    // Get feature values for current and next segment
    int nextSegment = int(mod(float(segment + 1), float(numFeatures)));
    float value1 = getFeatureValue(segment);
    float value2 = getFeatureValue(nextSegment);

    // Interpolate between segments for smooth shape
    float interpolatedValue = mix(value1, value2, segmentProgress);
    float featureRadius = interpolatedValue * 0.5; // 0.5 is max radius in UV space

    // Check if we're inside the radar shape
    bool insideShape = dist < featureRadius;

    // Anti-aliased edge
    float edgeDist = abs(dist - featureRadius);
    float edgeAlpha = 1.0 - smoothstep(0.0, 0.02, edgeDist);

    if (insideShape) {
      gl_FragColor = vec4(vColor, 0.6 * vAlpha);
    } else if (useContour && edgeDist < 0.02) {
      gl_FragColor = vec4(vColor, 0.9 * vAlpha * edgeAlpha);
    } else if (useBackground && dist < 0.5) {
      gl_FragColor = vec4(backgroundColor, 0.3);
    } else {
      discard;
    }
  }
`;

export interface InstancedGlyphData {
  position: THREE.Vector3;
  color: THREE.Color;
  radius: number;
  alpha: number;
  features: number[];
  glyphRef: WeakRef<GlyphObject>;
}

export class InstancedGlyphRenderer {
  private circleInstancedMesh: THREE.InstancedMesh | null = null;
  private starInstancedMesh: THREE.InstancedMesh | null = null;

  private circleGeometry: THREE.PlaneGeometry;
  private starGeometry: THREE.PlaneGeometry;

  private circleMaterial: THREE.ShaderMaterial;
  private starMaterial: THREE.ShaderMaterial;

  private maxInstances: number;
  private activeInstances: number = 0;

  // Instance attribute buffers
  private instanceColors: Float32Array;
  private instanceRadii: Float32Array;
  private instanceAlphas: Float32Array;
  private instanceFeatures1: Float32Array;
  private instanceFeatures2: Float32Array;
  private instanceFeatures3: Float32Array;
  private instanceFeatures4: Float32Array;

  // Map from glyph ID to instance index
  private glyphToInstance: Map<string, number> = new Map();

  constructor(maxInstances: number = 50000) {
    this.maxInstances = maxInstances;

    // Create unit quad geometry (will be scaled per-instance)
    this.circleGeometry = new THREE.PlaneGeometry(2, 2);
    this.starGeometry = new THREE.PlaneGeometry(2, 2);

    // Initialize attribute buffers
    this.instanceColors = new Float32Array(maxInstances * 3);
    this.instanceRadii = new Float32Array(maxInstances);
    this.instanceAlphas = new Float32Array(maxInstances);
    this.instanceFeatures1 = new Float32Array(maxInstances * 3);
    this.instanceFeatures2 = new Float32Array(maxInstances * 3);
    this.instanceFeatures3 = new Float32Array(maxInstances * 3);
    this.instanceFeatures4 = new Float32Array(maxInstances * 3);

    // Create shader materials
    this.circleMaterial = new THREE.ShaderMaterial({
      vertexShader: circleVertexShader,
      fragmentShader: circleFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        numFeatures: { value: 5 },
        featureMaxValues: { value: new Array(12).fill(1.0) },
        useBackground: { value: true },
        useContour: { value: true },
        backgroundColor: { value: new THREE.Color(0xf0f0f0) },
        axisColor: { value: new THREE.Color(0xa0a0a0) },
      },
    });
  }

  /**
   * Create or update instanced mesh for rendering
   */
  createInstancedMesh(zoomLevel: ZoomLevel): THREE.InstancedMesh {
    const geometry = zoomLevel === ZoomLevel.low ? this.circleGeometry : this.starGeometry;
    const material = zoomLevel === ZoomLevel.low ? this.circleMaterial : this.starMaterial;

    const instancedMesh = new THREE.InstancedMesh(geometry, material, this.maxInstances);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instancedMesh.count = 0; // Start with no visible instances

    // Add custom instance attributes
    const colorAttr = new THREE.InstancedBufferAttribute(this.instanceColors, 3);
    const radiusAttr = new THREE.InstancedBufferAttribute(this.instanceRadii, 1);
    const alphaAttr = new THREE.InstancedBufferAttribute(this.instanceAlphas, 1);

    colorAttr.setUsage(THREE.DynamicDrawUsage);
    radiusAttr.setUsage(THREE.DynamicDrawUsage);
    alphaAttr.setUsage(THREE.DynamicDrawUsage);

    geometry.setAttribute('instanceColor', colorAttr);
    geometry.setAttribute('instanceRadius', radiusAttr);
    geometry.setAttribute('instanceAlpha', alphaAttr);

    if (zoomLevel !== ZoomLevel.low) {
      const features1Attr = new THREE.InstancedBufferAttribute(this.instanceFeatures1, 3);
      const features2Attr = new THREE.InstancedBufferAttribute(this.instanceFeatures2, 3);
      const features3Attr = new THREE.InstancedBufferAttribute(this.instanceFeatures3, 3);
      const features4Attr = new THREE.InstancedBufferAttribute(this.instanceFeatures4, 3);

      features1Attr.setUsage(THREE.DynamicDrawUsage);
      features2Attr.setUsage(THREE.DynamicDrawUsage);
      features3Attr.setUsage(THREE.DynamicDrawUsage);
      features4Attr.setUsage(THREE.DynamicDrawUsage);

      geometry.setAttribute('featureValues1', features1Attr);
      geometry.setAttribute('featureValues2', features2Attr);
      geometry.setAttribute('featureValues3', features3Attr);
      geometry.setAttribute('featureValues4', features4Attr);
    }

    return instancedMesh;
  }

  /**
   * Update all instances from glyph data
   * Returns the instanced mesh ready to be added to the scene
   */
  updateInstances(
    mesh: THREE.InstancedMesh,
    glyphs: GlyphObject[],
    sizeInfo: GlyphSizeInfo,
    colorScale: (value: number) => number,
    colorFeature: string,
    activeFeatures: string[],
    featureMaxValues: Record<string, number>,
    featureTypes: Record<string, string>,
    timestamp: string,
    algorithm: string,
    owner: number
  ): void {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);

    this.glyphToInstance.clear();
    this.activeInstances = 0;

    for (let i = 0; i < glyphs.length && i < this.maxInstances; i++) {
      const glyph = glyphs[i];
      const cacheObject = glyph.getCacheObject(owner, timestamp, algorithm);

      // Skip invisible glyphs (for viewport culling)
      if (!cacheObject.visible) continue;

      const instanceIndex = this.activeInstances;
      this.glyphToInstance.set(glyph.id, instanceIndex);

      // Set position in the instance matrix
      position.set(cacheObject.x ?? 0, cacheObject.y ?? 0, 0);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(instanceIndex, matrix);

      // Set color
      let colorValue = 0;
      if (glyph.features && glyph.features["1"]) {
        colorValue = glyph.features["1"][colorFeature] || 0;
        const maxVal = featureMaxValues[colorFeature] || 1;
        // Normalize categorical values
        const featureType = featureTypes[colorFeature];
        if (featureType === 'categorical' && maxVal > 0) {
          colorValue = colorValue / maxVal;
        } else if (maxVal > 0) {
          colorValue = colorValue / maxVal;
        }
      }
      const color = new THREE.Color(colorScale(colorValue));

      // Handle passive/highlighted states
      if (glyph.passive) {
        color.setHex(0xe0e0e0);
      } else if (glyph.highlighted) {
        color.setHex(0x9b274d);
      }

      this.instanceColors[instanceIndex * 3] = color.r;
      this.instanceColors[instanceIndex * 3 + 1] = color.g;
      this.instanceColors[instanceIndex * 3 + 2] = color.b;

      // Set radius and alpha
      this.instanceRadii[instanceIndex] = sizeInfo.radius;
      this.instanceAlphas[instanceIndex] = glyph.passive ? 0.5 : 1.0;

      // Set feature values for star glyphs (only at higher zoom levels)
      if (sizeInfo.currentZoomLevel !== ZoomLevel.low && glyph.features) {
        const features = glyph.features["1"] || {};
        for (let f = 0; f < Math.min(activeFeatures.length, 12); f++) {
          const featureKey = activeFeatures[f];
          const value = features[featureKey] || 0;
          const maxVal = featureMaxValues[featureKey] || 1;
          const normalizedValue = value / maxVal;

          if (f < 3) {
            this.instanceFeatures1[instanceIndex * 3 + f] = normalizedValue;
          } else if (f < 6) {
            this.instanceFeatures2[instanceIndex * 3 + (f - 3)] = normalizedValue;
          } else if (f < 9) {
            this.instanceFeatures3[instanceIndex * 3 + (f - 6)] = normalizedValue;
          } else {
            this.instanceFeatures4[instanceIndex * 3 + (f - 9)] = normalizedValue;
          }
        }
      }

      this.activeInstances++;
    }

    // Mark instance matrix as needing update
    mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Apply updates to the instanced mesh
   */
  applyToMesh(mesh: THREE.InstancedMesh): void {
    mesh.count = this.activeInstances;

    // Update instance attributes
    const colorAttr = mesh.geometry.getAttribute('instanceColor') as THREE.InstancedBufferAttribute;
    const radiusAttr = mesh.geometry.getAttribute('instanceRadius') as THREE.InstancedBufferAttribute;
    const alphaAttr = mesh.geometry.getAttribute('instanceAlpha') as THREE.InstancedBufferAttribute;

    if (colorAttr) colorAttr.needsUpdate = true;
    if (radiusAttr) radiusAttr.needsUpdate = true;
    if (alphaAttr) alphaAttr.needsUpdate = true;

    // Update feature attributes if present
    const features1Attr = mesh.geometry.getAttribute('featureValues1') as THREE.InstancedBufferAttribute;
    const features2Attr = mesh.geometry.getAttribute('featureValues2') as THREE.InstancedBufferAttribute;
    const features3Attr = mesh.geometry.getAttribute('featureValues3') as THREE.InstancedBufferAttribute;
    const features4Attr = mesh.geometry.getAttribute('featureValues4') as THREE.InstancedBufferAttribute;

    if (features1Attr) features1Attr.needsUpdate = true;
    if (features2Attr) features2Attr.needsUpdate = true;
    if (features3Attr) features3Attr.needsUpdate = true;
    if (features4Attr) features4Attr.needsUpdate = true;

    mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Update shader uniforms
   */
  updateUniforms(
    numFeatures: number,
    featureMaxValues: number[],
    useBackground: boolean,
    useContour: boolean
  ): void {
    this.starMaterial.uniforms['numFeatures'].value = numFeatures;
    this.starMaterial.uniforms['featureMaxValues'].value = featureMaxValues;
    this.starMaterial.uniforms['useBackground'].value = useBackground;
    this.starMaterial.uniforms['useContour'].value = useContour;
  }

  /**
   * Get instance index for a glyph (for hit testing)
   */
  getInstanceIndex(glyphId: string): number | undefined {
    return this.glyphToInstance.get(glyphId);
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.circleGeometry.dispose();
    this.starGeometry.dispose();
    this.circleMaterial.dispose();
    this.starMaterial.dispose();
    this.circleInstancedMesh?.dispose();
    this.starInstancedMesh?.dispose();
  }
}

/**
 * Hybrid renderer that uses instanced rendering for large datasets
 * and falls back to individual meshes for small datasets or complex glyphs
 */
export class HybridGlyphRenderer {
  private instancedRenderer: InstancedGlyphRenderer;
  private instanceThreshold: number = 1000; // Use instancing above this count

  constructor(maxInstances: number = 50000) {
    this.instancedRenderer = new InstancedGlyphRenderer(maxInstances);
  }

  /**
   * Determine whether to use instanced rendering based on dataset size
   */
  shouldUseInstancing(glyphCount: number, zoomLevel: ZoomLevel): boolean {
    // Always use instancing for low zoom (circles) with large datasets
    if (zoomLevel === ZoomLevel.low && glyphCount > this.instanceThreshold) {
      return true;
    }

    // For now, don't use instancing for complex glyphs (star, flower, whisker)
    // This can be enabled later when shader-based glyphs are fully implemented
    return false;
  }

  /**
   * Set the threshold for switching to instanced rendering
   */
  setInstanceThreshold(threshold: number): void {
    this.instanceThreshold = threshold;
  }

  getInstancedRenderer(): InstancedGlyphRenderer {
    return this.instancedRenderer;
  }

  dispose(): void {
    this.instancedRenderer.dispose();
  }
}
