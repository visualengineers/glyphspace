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
// Renders a polygon connecting feature points with straight edges (like mesh version)
const starFragmentShader = `
  #define PI 3.14159265359
  #define TWO_PI 6.28318530718
  #define MAX_FEATURES 12

  uniform int numFeatures;
  uniform float featureMaxValues[MAX_FEATURES];
  uniform bool useBackground;
  uniform bool useContour;
  uniform bool useAxes;
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

  // Check if point is near an axis line
  float axisDistance(vec2 pos, float angle, float maxRadius) {
    vec2 axisDir = vec2(cos(angle), sin(angle));
    float proj = dot(pos, axisDir);
    if (proj < 0.0 || proj > maxRadius) return 1000.0;
    vec2 closestPoint = axisDir * proj;
    return length(pos - closestPoint);
  }

  // Get vertex position for feature index
  // First feature (index=0) points RIGHT (angle=0), matching legend canvas rendering
  vec2 getVertex(int index, float radius) {
    float angle = float(index) * TWO_PI / float(numFeatures);
    float value = max(getFeatureValue(index), 0.02); // minimum visibility
    return vec2(cos(angle), sin(angle)) * value * radius;
  }

  // Distance from point to line segment
  float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  // Check if point is inside polygon using ray casting
  bool pointInPolygon(vec2 p, float radius) {
    int crossings = 0;
    for (int i = 0; i < MAX_FEATURES; i++) {
      if (i >= numFeatures) break;
      int next = int(mod(float(i + 1), float(numFeatures)));
      vec2 v1 = getVertex(i, radius);
      vec2 v2 = getVertex(next, radius);

      // Ray casting algorithm
      if (((v1.y <= p.y && p.y < v2.y) || (v2.y <= p.y && p.y < v1.y)) &&
          p.x < (v2.x - v1.x) * (p.y - v1.y) / (v2.y - v1.y) + v1.x) {
        crossings++;
      }
    }
    return mod(float(crossings), 2.0) == 1.0;
  }

  // Get minimum distance to polygon edge
  float distToPolygonEdge(vec2 p, float radius) {
    float minDist = 1000.0;
    for (int i = 0; i < MAX_FEATURES; i++) {
      if (i >= numFeatures) break;
      int next = int(mod(float(i + 1), float(numFeatures)));
      vec2 v1 = getVertex(i, radius);
      vec2 v2 = getVertex(next, radius);
      minDist = min(minDist, distToSegment(p, v1, v2));
    }
    return minDist;
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    float dist = length(pos);

    // Early discard for pixels outside the glyph bounds
    if (dist > 0.52) discard;

    float radius = 0.48;
    float segmentAngle = TWO_PI / float(numFeatures);

    // Check if inside the polygon
    bool insideShape = pointInPolygon(pos, radius);

    // Get distance to edge for contour
    float edgeDist = distToPolygonEdge(pos, radius);
    float edgeWidth = 0.012;
    float edgeAlpha = 1.0 - smoothstep(0.0, edgeWidth, edgeDist);

    // Check for axis lines (use positive angle to match vertex orientation)
    float minAxisDist = 1000.0;
    if (useAxes) {
      for (int i = 0; i < MAX_FEATURES; i++) {
        if (i >= numFeatures) break;
        float axAngle = float(i) * segmentAngle;
        float axisDist = axisDistance(pos, axAngle, radius);
        minAxisDist = min(minAxisDist, axisDist);
      }
    }

    float axisWidth = 0.006;
    float axisAlpha = 1.0 - smoothstep(0.0, axisWidth, minAxisDist);
    bool onAxis = minAxisDist < axisWidth && dist < 0.49;

    // Render layers (back to front)
    vec4 finalColor = vec4(0.0);

    // Layer 1: Background circle
    if (useBackground && dist < radius) {
      float bgEdge = 1.0 - smoothstep(radius - 0.02, radius, dist);
      finalColor = vec4(backgroundColor, 0.4 * bgEdge);
    }

    // Layer 2: Axes (draw behind the fill)
    if (onAxis && useAxes) {
      finalColor = mix(finalColor, vec4(axisColor, 0.6 * axisAlpha * vAlpha), axisAlpha * 0.5);
    }

    // Layer 3: Filled polygon shape
    if (insideShape) {
      // Use higher opacity when vAlpha > 1.0 (medium zoom opaque mode)
      float fillOpacity = vAlpha > 1.0 ? 0.9 : 0.6 * vAlpha;
      vec4 fillColor = vec4(vColor, fillOpacity);
      finalColor = mix(finalColor, fillColor, fillColor.a);
    }

    // Layer 4: Contour stroke
    // At medium zoom (vAlpha > 1.0), use black contour; otherwise use glyph color
    bool isMediumZoom = vAlpha > 1.0;
    if (useContour && edgeDist < edgeWidth * 1.5) {
      vec3 strokeCol = isMediumZoom ? vec3(0.0, 0.0, 0.0) : vColor;
      float strokeOpacity = isMediumZoom ? 0.9 * edgeAlpha : 0.9 * vAlpha * edgeAlpha;
      vec4 strokeColor = vec4(strokeCol, strokeOpacity);
      finalColor = mix(finalColor, strokeColor, edgeAlpha * 0.9);
    } else if (isMediumZoom && edgeDist < edgeWidth * 2.0) {
      // Always show black contour at medium zoom even if useContour is false
      vec4 strokeColor = vec4(0.0, 0.0, 0.0, 0.9 * edgeAlpha);
      finalColor = mix(finalColor, strokeColor, edgeAlpha * 0.9);
    }

    // Layer 5: Background circle outline
    if (useBackground) {
      float outlineWidth = 0.008;
      float outlineDist = abs(dist - radius);
      float outlineAlpha = 1.0 - smoothstep(0.0, outlineWidth, outlineDist);
      if (outlineDist < outlineWidth) {
        finalColor = mix(finalColor, vec4(0.7, 0.7, 0.7, 0.4 * outlineAlpha), outlineAlpha * 0.4);
      }
    }

    if (finalColor.a < 0.01) discard;

    gl_FragColor = finalColor;
  }
`;

// Fragment shader for flower glyphs - bezier petal shapes
const flowerFragmentShader = `
  #define PI 3.14159265359
  #define TWO_PI 6.28318530718
  #define MAX_FEATURES 12

  uniform int numFeatures;
  uniform bool useBackground;
  uniform bool useContour;
  uniform bool useAxes;
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

  // Check if point is near an axis line
  float axisDistance(vec2 pos, float angle, float maxRadius) {
    vec2 axisDir = vec2(cos(angle), sin(angle));
    float proj = dot(pos, axisDir);
    if (proj < 0.0 || proj > maxRadius) return 1000.0;
    vec2 closestPoint = axisDir * proj;
    return length(pos - closestPoint);
  }

  // Check if point is inside a petal shape
  // Petal is a teardrop shape: base at origin, tip at petalLength
  // Width is 0.4 * petalLength at widest point
  bool insidePetal(vec2 localPos, float petalLength) {
    if (petalLength < 0.01) return false;

    // localPos.y is distance along petal (0 = base, petalLength = tip)
    // localPos.x is perpendicular distance
    float y = -localPos.y; // Flip because petal points in -Y direction
    float x = abs(localPos.x);

    if (y < 0.0 || y > petalLength) return false;

    // Petal width varies along length - bezier-like curve
    // Width is 0 at base, max at ~30% length, then tapers to tip
    float t = y / petalLength;

    // Approximate the bezier petal shape with a smooth function
    // Peak width at t=0.3, tapering smoothly to 0 at both ends
    float baseWidth = petalLength * 0.4;
    float widthFactor = 4.0 * t * (1.0 - t); // Parabola: 0 at t=0,1, max at t=0.5
    // Shift peak toward base (t=0.3)
    widthFactor = pow(sin(t * PI), 0.7) * (1.0 - t * 0.3);
    float halfWidth = baseWidth * widthFactor * 0.5;

    return x < halfWidth;
  }

  // Get distance to petal edge for antialiasing
  float petalEdgeDist(vec2 localPos, float petalLength) {
    if (petalLength < 0.01) return 1000.0;

    float y = -localPos.y;
    float x = abs(localPos.x);

    if (y < 0.0 || y > petalLength) return 1000.0;

    float t = y / petalLength;
    float baseWidth = petalLength * 0.4;
    float widthFactor = pow(sin(t * PI), 0.7) * (1.0 - t * 0.3);
    float halfWidth = baseWidth * widthFactor * 0.5;

    return abs(x - halfWidth);
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    float dist = length(pos);

    if (dist > 0.52) discard;

    float radius = 0.48;
    float segmentAngle = TWO_PI / float(numFeatures);

    bool insideAnyPetal = false;
    float minEdgeDist = 1000.0;

    // Check each petal
    // Add PI/2 offset so first feature points UP, matching legend canvas rendering
    float angleOffset = PI / 2.0;
    for (int i = 0; i < MAX_FEATURES; i++) {
      if (i >= numFeatures) break;

      float value = getFeatureValue(i);
      if (value < 0.01) continue;

      float petalLength = radius * value;
      float angle = float(i) * segmentAngle + angleOffset;

      // Rotate point into petal's local space (positive rotation for CCW direction)
      float cosA = cos(angle);
      float sinA = sin(angle);
      vec2 localPos = vec2(
        pos.x * cosA + pos.y * sinA,
        -pos.x * sinA + pos.y * cosA
      );

      if (insidePetal(localPos, petalLength)) {
        insideAnyPetal = true;
      }

      float edgeDist = petalEdgeDist(localPos, petalLength);
      minEdgeDist = min(minEdgeDist, edgeDist);
    }

    // Check for axis lines (use same angle offset as petals)
    float minAxisDist = 1000.0;
    if (useAxes) {
      for (int i = 0; i < MAX_FEATURES; i++) {
        if (i >= numFeatures) break;
        float axAngle = float(i) * segmentAngle + angleOffset;
        float axisDist = axisDistance(pos, axAngle, radius);
        minAxisDist = min(minAxisDist, axisDist);
      }
    }

    float axisWidth = 0.006;
    float axisAlpha = 1.0 - smoothstep(0.0, axisWidth, minAxisDist);
    bool onAxis = minAxisDist < axisWidth && dist < 0.49;

    float edgeWidth = 0.01;
    float edgeAlpha = 1.0 - smoothstep(0.0, edgeWidth, minEdgeDist);

    // Render layers
    vec4 finalColor = vec4(0.0);

    // Layer 1: Background circle
    if (useBackground && dist < radius) {
      float bgEdge = 1.0 - smoothstep(radius - 0.02, radius, dist);
      finalColor = vec4(backgroundColor, 0.4 * bgEdge);
    }

    // Layer 2: Axes
    if (onAxis && useAxes) {
      finalColor = mix(finalColor, vec4(axisColor, 0.6 * axisAlpha * vAlpha), axisAlpha * 0.5);
    }

    // Layer 3: Filled petals
    if (insideAnyPetal) {
      // Use higher opacity when vAlpha > 1.0 (medium zoom opaque mode)
      float fillOpacity = vAlpha > 1.0 ? 0.9 : 0.6 * vAlpha;
      vec4 fillColor = vec4(vColor, fillOpacity);
      finalColor = mix(finalColor, fillColor, fillColor.a);
    }

    // Layer 4: Contour
    // At medium zoom (vAlpha > 1.0), use black contour; otherwise use glyph color
    bool isMediumZoom = vAlpha > 1.0;
    if (useContour && minEdgeDist < edgeWidth * 1.5 && insideAnyPetal) {
      vec3 strokeCol = isMediumZoom ? vec3(0.0, 0.0, 0.0) : vColor;
      float strokeOpacity = isMediumZoom ? 0.9 * edgeAlpha : 0.9 * vAlpha * edgeAlpha;
      vec4 strokeColor = vec4(strokeCol, strokeOpacity);
      finalColor = mix(finalColor, strokeColor, edgeAlpha * 0.8);
    } else if (isMediumZoom && minEdgeDist < edgeWidth * 2.0 && insideAnyPetal) {
      // Always show black contour at medium zoom even if useContour is false
      vec4 strokeColor = vec4(0.0, 0.0, 0.0, 0.9 * edgeAlpha);
      finalColor = mix(finalColor, strokeColor, edgeAlpha * 0.8);
    }

    // Layer 5: Background circle outline
    if (useBackground) {
      float outlineWidth = 0.008;
      float outlineDist = abs(dist - radius);
      float outlineAlpha = 1.0 - smoothstep(0.0, outlineWidth, outlineDist);
      if (outlineDist < outlineWidth) {
        finalColor = mix(finalColor, vec4(0.7, 0.7, 0.7, 0.4 * outlineAlpha), outlineAlpha * 0.4);
      }
    }

    if (finalColor.a < 0.01) discard;

    gl_FragColor = finalColor;
  }
`;

// Fragment shader for whisker glyphs - thin rectangular bars
const whiskerFragmentShader = `
  #define PI 3.14159265359
  #define TWO_PI 6.28318530718
  #define MAX_FEATURES 12

  uniform int numFeatures;
  uniform bool useBackground;
  uniform bool useAxes;
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

  // Check if point is near an axis line
  float axisDistance(vec2 pos, float angle, float maxRadius) {
    vec2 axisDir = vec2(cos(angle), sin(angle));
    float proj = dot(pos, axisDir);
    if (proj < 0.0 || proj > maxRadius) return 1000.0;
    vec2 closestPoint = axisDir * proj;
    return length(pos - closestPoint);
  }

  // Check if point is inside a whisker (thin bar)
  bool insideWhisker(vec2 localPos, float whiskerLength, float barWidth) {
    if (whiskerLength < 0.01) return false;

    // localPos.y is distance along whisker (0 = center, whiskerLength = tip)
    // localPos.x is perpendicular distance
    float y = -localPos.y; // Flip because whisker points in -Y direction
    float x = abs(localPos.x);

    // Whisker extends from center outward
    return y >= 0.0 && y <= whiskerLength && x <= barWidth * 0.5;
  }

  // Get distance to whisker edge for contour rendering
  float whiskerEdgeDist(vec2 localPos, float whiskerLength, float barWidth) {
    if (whiskerLength < 0.01) return 1000.0;

    float y = -localPos.y;
    float x = abs(localPos.x);
    float halfWidth = barWidth * 0.5;

    // If outside whisker bounds, return large distance
    if (y < 0.0 || y > whiskerLength || x > halfWidth) return 1000.0;

    // Distance to nearest edge (left/right sides or top)
    float distToSide = halfWidth - x;
    float distToTop = whiskerLength - y;
    float distToBottom = y;

    return min(min(distToSide, distToTop), distToBottom);
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    float dist = length(pos);

    if (dist > 0.52) discard;

    float radius = 0.48;
    float segmentAngle = TWO_PI / float(numFeatures);
    float barWidth = 0.06; // Medium-width bars for better visibility

    bool insideAnyWhisker = false;
    float minEdgeDist = 1000.0;

    // Check each whisker
    // Add PI/2 offset so first feature points UP, matching legend canvas rendering
    float angleOffset = PI / 2.0;
    for (int i = 0; i < MAX_FEATURES; i++) {
      if (i >= numFeatures) break;

      float value = getFeatureValue(i);
      if (value < 0.01) continue;

      float whiskerLength = radius * value;
      float angle = float(i) * segmentAngle + angleOffset;

      // Rotate point into whisker's local space (positive rotation for CCW direction)
      float cosA = cos(angle);
      float sinA = sin(angle);
      vec2 localPos = vec2(
        pos.x * cosA + pos.y * sinA,
        -pos.x * sinA + pos.y * cosA
      );

      if (insideWhisker(localPos, whiskerLength, barWidth)) {
        insideAnyWhisker = true;
        float edgeDist = whiskerEdgeDist(localPos, whiskerLength, barWidth);
        minEdgeDist = min(minEdgeDist, edgeDist);
      }
    }

    // Check for axis lines (use same angle offset as whiskers)
    float minAxisDist = 1000.0;
    if (useAxes) {
      for (int i = 0; i < MAX_FEATURES; i++) {
        if (i >= numFeatures) break;
        float axAngle = float(i) * segmentAngle + angleOffset;
        float axisDist = axisDistance(pos, axAngle, radius);
        minAxisDist = min(minAxisDist, axisDist);
      }
    }

    float axisWidth = 0.006;
    float axisAlpha = 1.0 - smoothstep(0.0, axisWidth, minAxisDist);
    bool onAxis = minAxisDist < axisWidth && dist < 0.49;

    // Render layers
    vec4 finalColor = vec4(0.0);

    // Layer 1: Background circle
    if (useBackground && dist < radius) {
      float bgEdge = 1.0 - smoothstep(radius - 0.02, radius, dist);
      finalColor = vec4(backgroundColor, 0.4 * bgEdge);
    }

    // Layer 2: Axes (behind whiskers)
    if (onAxis && useAxes && !insideAnyWhisker) {
      finalColor = mix(finalColor, vec4(axisColor, 0.6 * axisAlpha * vAlpha), axisAlpha * 0.5);
    }

    // Layer 3: Filled whiskers
    if (insideAnyWhisker) {
      // Use higher opacity when vAlpha > 1.0 (medium zoom opaque mode)
      float fillOpacity = vAlpha > 1.0 ? 0.9 : 0.8 * vAlpha;
      vec4 fillColor = vec4(vColor, fillOpacity);
      finalColor = mix(finalColor, fillColor, fillColor.a);
    }

    // Layer 4: Contour for whiskers at medium zoom
    bool isMediumZoom = vAlpha > 1.0;
    float edgeWidth = 0.004;
    float edgeAlpha = 1.0 - smoothstep(0.0, edgeWidth, minEdgeDist);
    if (isMediumZoom && insideAnyWhisker && minEdgeDist < edgeWidth * 2.0) {
      vec4 strokeColor = vec4(0.0, 0.0, 0.0, 0.9 * edgeAlpha);
      finalColor = mix(finalColor, strokeColor, edgeAlpha * 0.9);
    }

    // Layer 5: Background circle outline
    if (useBackground) {
      float outlineWidth = 0.008;
      float outlineDist = abs(dist - radius);
      float outlineAlpha = 1.0 - smoothstep(0.0, outlineWidth, outlineDist);
      if (outlineDist < outlineWidth) {
        finalColor = mix(finalColor, vec4(0.7, 0.7, 0.7, 0.4 * outlineAlpha), outlineAlpha * 0.4);
      }
    }

    if (finalColor.a < 0.01) discard;

    gl_FragColor = finalColor;
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

export type GlyphShaderType = 'circle' | 'star' | 'flower' | 'whisker';

export class InstancedGlyphRenderer {
  private circleInstancedMesh: THREE.InstancedMesh | null = null;
  private starInstancedMesh: THREE.InstancedMesh | null = null;

  private circleGeometry: THREE.PlaneGeometry;
  private glyphGeometry: THREE.PlaneGeometry;

  private circleMaterial: THREE.ShaderMaterial;
  private starMaterial: THREE.ShaderMaterial;
  private flowerMaterial: THREE.ShaderMaterial;
  private whiskerMaterial: THREE.ShaderMaterial;

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
    this.glyphGeometry = new THREE.PlaneGeometry(2, 2);

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

    const glyphUniforms = {
      numFeatures: { value: 5 },
      featureMaxValues: { value: new Array(12).fill(1.0) },
      useBackground: { value: true },
      useContour: { value: true },
      useAxes: { value: true },
      backgroundColor: { value: new THREE.Color(0xf0f0f0) },
      axisColor: { value: new THREE.Color(0xa0a0a0) },
    };

    this.starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { ...glyphUniforms },
    });

    this.flowerMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader, // Same vertex shader
      fragmentShader: flowerFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        numFeatures: { value: 5 },
        useBackground: { value: true },
        useContour: { value: true },
        useAxes: { value: true },
        backgroundColor: { value: new THREE.Color(0xf0f0f0) },
        axisColor: { value: new THREE.Color(0xa0a0a0) },
      },
    });

    this.whiskerMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader, // Same vertex shader
      fragmentShader: whiskerFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        numFeatures: { value: 5 },
        useBackground: { value: true },
        useAxes: { value: true },
        backgroundColor: { value: new THREE.Color(0xf0f0f0) },
        axisColor: { value: new THREE.Color(0xa0a0a0) },
      },
    });
  }

  /**
   * Get the appropriate material for a glyph type
   */
  getMaterialForGlyphType(glyphType: GlyphShaderType): THREE.ShaderMaterial {
    switch (glyphType) {
      case 'flower': return this.flowerMaterial;
      case 'whisker': return this.whiskerMaterial;
      case 'star':
      default: return this.starMaterial;
    }
  }

  /**
   * Create or update instanced mesh for rendering
   * @param zoomLevel Current zoom level
   * @param glyphType Glyph type for selecting the appropriate shader (star, flower, whisker)
   */
  createInstancedMesh(zoomLevel: ZoomLevel, glyphType: GlyphShaderType = 'star'): THREE.InstancedMesh {
    const geometry = zoomLevel === ZoomLevel.low ? this.circleGeometry : this.glyphGeometry;
    let material: THREE.ShaderMaterial;

    if (zoomLevel === ZoomLevel.low) {
      material = this.circleMaterial;
    } else {
      material = this.getMaterialForGlyphType(glyphType);
    }

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

    // Debug first glyph
    if (glyphs.length > 0) {
      const firstGlyph = glyphs[0];
      const firstCache = firstGlyph.getCacheObject(owner, timestamp, algorithm);
      console.log(`[InstancedRenderer] First glyph position: x=${firstCache.x}, y=${firstCache.y}, visible=${firstCache.visible}`);
    }

    for (let i = 0; i < glyphs.length && i < this.maxInstances; i++) {
      const glyph = glyphs[i];
      const cacheObject = glyph.getCacheObject(owner, timestamp, algorithm);

      // Skip invisible glyphs (for viewport culling)
      if (!cacheObject.visible) continue;

      const instanceIndex = this.activeInstances;
      this.glyphToInstance.set(glyph.id, instanceIndex);

      // Set position in the instance matrix
      // Use currentX/currentY for animation, fall back to x/y if not set
      const posX = cacheObject.currentX ?? cacheObject.x ?? 0;
      const posY = cacheObject.currentY ?? cacheObject.y ?? 0;
      position.set(posX, posY, 0);
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
      // At medium zoom without background, scale up the glyph to match visual size of low-zoom circles
      let effectiveRadius = sizeInfo.radius;
      if (sizeInfo.currentZoomLevel === ZoomLevel.medium) {
        // Medium zoom glyphs need to be larger to fill similar visual space as circles
        effectiveRadius = sizeInfo.radius * 2.5;
      }
      this.instanceRadii[instanceIndex] = effectiveRadius;
      // At medium zoom, make glyphs fully opaque (not transparent)
      const isMediumZoom = sizeInfo.currentZoomLevel === ZoomLevel.medium;
      this.instanceAlphas[instanceIndex] = glyph.passive ? 0.5 : (isMediumZoom ? 1.5 : 1.0);

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

    console.log(`[InstancedRenderer] updateInstances complete: activeInstances=${this.activeInstances}/${glyphs.length}`);

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
   * Update shader uniforms for all glyph materials
   */
  updateUniforms(
    numFeatures: number,
    featureMaxValues: number[],
    useBackground: boolean,
    useContour: boolean,
    useAxes: boolean = true
  ): void {
    // Update star material
    this.starMaterial.uniforms['numFeatures'].value = numFeatures;
    this.starMaterial.uniforms['featureMaxValues'].value = featureMaxValues;
    this.starMaterial.uniforms['useBackground'].value = useBackground;
    this.starMaterial.uniforms['useContour'].value = useContour;
    this.starMaterial.uniforms['useAxes'].value = useAxes;

    // Update flower material
    this.flowerMaterial.uniforms['numFeatures'].value = numFeatures;
    this.flowerMaterial.uniforms['useBackground'].value = useBackground;
    this.flowerMaterial.uniforms['useContour'].value = useContour;
    this.flowerMaterial.uniforms['useAxes'].value = useAxes;

    // Update whisker material
    this.whiskerMaterial.uniforms['numFeatures'].value = numFeatures;
    this.whiskerMaterial.uniforms['useBackground'].value = useBackground;
    this.whiskerMaterial.uniforms['useAxes'].value = useAxes;
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
    this.glyphGeometry.dispose();
    this.circleMaterial.dispose();
    this.starMaterial.dispose();
    this.flowerMaterial.dispose();
    this.whiskerMaterial.dispose();
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
  private glyphInstanceThreshold: number = 500; // Lower threshold for detailed glyphs (more complex)
  // Enable shader-based glyph instancing for large datasets at medium/high zoom
  private enableGlyphInstancing: boolean = true;

  // Glyph types that have shader support
  private static readonly SUPPORTED_GLYPH_TYPES = ['star', 'flower', 'whisker'];

  constructor(maxInstances: number = 50000) {
    this.instancedRenderer = new InstancedGlyphRenderer(maxInstances);
  }

  /**
   * Determine whether to use instanced rendering based on dataset size and zoom level.
   *
   * For large datasets (40K+ glyphs), instanced rendering provides massive performance gains:
   * - Low zoom (circles): Single draw call for all glyphs
   * - Medium/High zoom: Shader-based rendering for Star, Flower, and Whisker glyph types
   *
   * @param glyphCount Number of glyphs to render
   * @param zoomLevel Current zoom level
   * @param glyphType Glyph type to check compatibility (star, flower, whisker)
   */
  shouldUseInstancing(glyphCount: number, zoomLevel: ZoomLevel, glyphType: string = 'star'): boolean {
    // Always use instancing for low zoom (circles) with large datasets
    if (zoomLevel === ZoomLevel.low && glyphCount > this.instanceThreshold) {
      return true;
    }

    // Check if glyph type has shader support
    const normalizedType = glyphType.toLowerCase();
    const hasShaderSupport = HybridGlyphRenderer.SUPPORTED_GLYPH_TYPES.includes(normalizedType);

    // Use instanced rendering for supported glyph types at medium/high zoom
    if (this.enableGlyphInstancing &&
        (zoomLevel === ZoomLevel.medium || zoomLevel === ZoomLevel.high) &&
        glyphCount > this.glyphInstanceThreshold &&
        hasShaderSupport) {
      return true;
    }

    // For small datasets or unsupported glyph types (Dot, Thumb), use individual meshes
    return false;
  }

  /**
   * Convert glyph type string to shader type
   */
  static getShaderType(glyphType: string): GlyphShaderType {
    const normalized = glyphType.toLowerCase();
    if (normalized === 'flower') return 'flower';
    if (normalized === 'whisker') return 'whisker';
    return 'star'; // default
  }

  /**
   * Enable or disable shader-based glyph instancing
   */
  setGlyphInstancingEnabled(enabled: boolean): void {
    this.enableGlyphInstancing = enabled;
  }

  /**
   * Check if glyph instancing is enabled
   */
  isGlyphInstancingEnabled(): boolean {
    return this.enableGlyphInstancing;
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
