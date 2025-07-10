import { GlyphConfiguration } from '../../glyph/glyph-configuration';
import { GlyphObject } from '../../glyph/glyph-object';

export function hexToRgb(hex: string | number): string {
    let hexString: string;

    if (typeof hex === 'number') {
        hexString = hex.toString(16).padStart(6, '0');
    } else {
        hexString = hex.replace(/^#/, '');
    }

    if (hexString.length === 3) {
        hexString = hexString.split('').map(c => c + c).join('');
    }

    if (hexString.length !== 6) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    const r = parseInt(hexString.slice(0, 2), 16);
    const g = parseInt(hexString.slice(2, 4), 16);
    const b = parseInt(hexString.slice(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

export function addAlphaToRgba(color: string, alpha: number): string {
    // If the color is already rgba, replace the alpha
    const rgbaMatch = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/);
    if (!rgbaMatch) {
        // fallback: just return color (or handle hex)
        return color;
    }
    const r = rgbaMatch[1];
    const g = rgbaMatch[2];
    const b = rgbaMatch[3];
    // Use the passed alpha
    return `rgba(${r},${g},${b},${alpha})`;
}

function prepareFeatureData(
    glyph: GlyphObject,
    activeFeatures: string[]
): {
    featureMap: Record<string, number>,
    keys: string[],
    values: number[],
    maxValue: number,
    segments: number
} {
    const featureMap: Record<string, number> = Object.fromEntries(
        Object.entries(glyph.features[glyph.currentContext] || {})
            .filter(([key]) => activeFeatures.includes(key))
            .map(([key, value]) => [key, +value])
    );

    const keys = Object.keys(featureMap);
    const values = keys.map(k => featureMap[k]);
    const maxValue = Math.max(...values) || 1;
    const segments = keys.length;

    return { featureMap, keys, values, maxValue, segments };
}

function computeCenterCoordinates(radius: number, width = 350): { centerX: number, centerY: number } {
    return {
        centerX: width / 2 - radius / 2 + 20,
        centerY: radius + 40
    };
}

export function drawRadarChart(
    context: CanvasRenderingContext2D,
    radius = 50,
    color: string,
    glyph: GlyphObject,
    activeFeatures: string[],
    featureLabels: Record<string, string>,
    glyphConfig: GlyphConfiguration
) {
    if (!context) return;

    const { featureMap, keys, values, maxValue, segments } = prepareFeatureData(glyph, activeFeatures);
    const { centerX, centerY } = computeCenterCoordinates(radius);

    drawBackgroundCircle(context, centerX, centerY, radius, glyphConfig);
    drawAxes(context, keys, centerX, centerY, radius, glyphConfig);

    const allZero = values.every(v => v < 0.01);
    if (allZero) {
        context.beginPath();
        context.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    } else {
        const effectiveRadius = radius * 0.95;
        context.beginPath();
        keys.forEach((key, i) => {
            const value = +featureMap[key] || 0;
            const norm = glyphConfig.scaleLinear ? value : value / maxValue;
            const angle = (i / segments) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * effectiveRadius * norm;
            const y = centerY - Math.sin(angle) * effectiveRadius * norm;

            i === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        });
        context.closePath();
        context.fillStyle = addAlphaToRgba(color, 0.4);
        context.fill();

        if (glyphConfig.useContour) {
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
        }
    }

    drawLabels(context, keys, featureLabels, centerX, centerY, radius, glyphConfig);
}

export function drawFlowerGlyph(
    context: CanvasRenderingContext2D,
    radius = 50,
    color: string,
    glyph: GlyphObject,
    activeFeatures: string[],
    featureLabels: Record<string, string>,
    glyphConfig: GlyphConfiguration
) {
    if (!context) return;

    const { featureMap, keys, values, maxValue, segments } = prepareFeatureData(glyph, activeFeatures);
    const { centerX, centerY } = computeCenterCoordinates(radius);

    drawBackgroundCircle(context, centerX, centerY, radius, glyphConfig);
    drawAxes(context, keys, centerX, centerY, radius, glyphConfig);

    const allZero = values.every(v => v < 0.01);
    if (allZero) {
        context.beginPath();
        context.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    } else {
        context.save();
        context.translate(centerX, centerY);
        context.globalAlpha = 0.6;

        keys.forEach((key, i) => {
            const value = +featureMap[key] || 0;
            if (value <= 0) return;

            const norm = glyphConfig.scaleLinear ? value : value / maxValue;
            const petalLength = radius * norm * 0.95;
            const petalWidth = petalLength * 0.4;

            const angle = (i / segments) * Math.PI * 2 + (3 * Math.PI) / 2;

            context.save();
            context.rotate(-angle);

            const path = new Path2D();
            path.moveTo(0, 0);
            path.bezierCurveTo(
                petalWidth * 0.25, -petalLength * 0.3,
                petalWidth * 0.6, -petalLength * 0.75,
                0, -petalLength
            );
            path.bezierCurveTo(
                -petalWidth * 0.6, -petalLength * 0.75,
                -petalWidth * 0.25, -petalLength * 0.3,
                0, 0
            );

            context.fillStyle = color;
            context.fill(path);
            if (glyphConfig.useContour) {
                context.strokeStyle = color;
                context.stroke(path);
            }

            context.restore();
        });

        context.restore();
    }

    drawLabels(context, keys, featureLabels, centerX, centerY, radius, glyphConfig);
}

export function drawWhiskerGlyph(
    context: CanvasRenderingContext2D,
    radius = 50,
    color: string,
    glyph: GlyphObject,
    activeFeatures: string[],
    featureLabels: Record<string, string>,
    glyphConfig: GlyphConfiguration
) {
    if (!context) return;

    const { featureMap, keys, values, maxValue, segments } = prepareFeatureData(glyph, activeFeatures);
    const { centerX, centerY } = computeCenterCoordinates(radius);

    drawBackgroundCircle(context, centerX, centerY, radius, glyphConfig);
    drawAxes(context, keys, centerX, centerY, radius, glyphConfig);

    const allZero = values.every(v => v < 0.01);
    if (allZero) {
        context.beginPath();
        context.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    } else {
        context.save();
        context.translate(centerX, centerY);
        context.globalAlpha = 0.6;

        keys.forEach((key, i) => {
            const value = +featureMap[key] || 0;
            if (value <= 0) return;

            const norm = glyphConfig.scaleLinear ? value : value / maxValue;
            const whiskerLength = radius * norm * 0.95;
            const barWidth = 6;

            const angle = (i / segments) * Math.PI * 2 + (3 * Math.PI) / 2;
            context.save();
            context.rotate(-angle);

            context.fillStyle = color;
            context.fillRect(-barWidth / 2, -whiskerLength, barWidth, whiskerLength);

            context.restore();
        });

        context.restore();
    }

    drawLabels(context, keys, featureLabels, centerX, centerY, radius, glyphConfig);
}

function drawBackgroundCircle(context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, glyphConfig: GlyphConfiguration) {
    if (!glyphConfig.useBackground) return;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fillStyle = '#d7d7d7';
    context.fill();
    context.closePath();
}

function drawAxes(context: CanvasRenderingContext2D, keys: string[], centerX: number, centerY: number, radius: number, glyphConfig: GlyphConfiguration) {
    if (!glyphConfig.useCoordinateSystem) return;

    const segments = keys.length;
    context.strokeStyle = '#aaaaaa';
    context.lineWidth = 1;
    keys.forEach((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY - Math.sin(angle) * radius;
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(x, y);
        context.stroke();
        context.closePath();
    });
}

function drawLabels(
    context: CanvasRenderingContext2D,
    keys: string[],
    featureLabels: Record<string, string>,
    centerX: number,
    centerY: number,
    radius: number,
    glyphConfig: GlyphConfiguration
) {
    if (!glyphConfig.useLabels) return;

    const labelRadius = radius + 15;
    const padding = 4;
    const segments = keys.length;

    context.textRendering = "geometricPrecision";
    context.fillStyle = '#000000';
    context.font = '11px "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif';

    keys.forEach((key, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const label = featureLabels[key] || key;

        let x = centerX + Math.cos(angle) * labelRadius;
        let y = centerY - Math.sin(angle) * labelRadius;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        if (Math.abs(sin) > 0.95) {
            context.textAlign = cos > 0 ? 'left' : 'right';
            x += cos > 0 ? padding : -padding;
            context.textBaseline = 'middle';
        } else if (cos > 0.1) {
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            x += padding;
        } else if (cos < -0.1) {
            context.textAlign = 'right';
            context.textBaseline = 'middle';
            x -= padding;
        } else {
            context.textAlign = 'center';
            context.textBaseline = sin > 0 ? 'top' : 'bottom';
        }

        context.fillText(label, x, y);
    });
}
