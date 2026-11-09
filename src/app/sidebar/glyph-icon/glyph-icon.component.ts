import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GlyphType } from '../../shared/enum/glyph-type';
import { axesSvgPath, axisAngle, flowerPetalSvgPath, polygonSvgPath, starPoints } from '../../glyph/glyph-geometry';

/** Fixed, made-up axis lengths: the icon shows the glyph type, not data. */
const ICON_VALUES = [0.95, 0.7, 0.85, 0.6, 0.8];
const CENTER = 12;
const RADIUS = 9;

const AXES = axesSvgPath(ICON_VALUES.length, RADIUS, CENTER, CENTER);
const STAR = polygonSvgPath(starPoints(ICON_VALUES, RADIUS), CENTER, CENTER);
const FLOWER = ICON_VALUES.map((value, i) =>
  flowerPetalSvgPath(RADIUS * value, axisAngle(i, ICON_VALUES.length), CENTER, CENTER)
).join('');

/** Small star or flower symbol, filled when the feature is in the glyph and dashed when not. */
@Component({
  selector: 'app-glyph-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size" [attr.height]="size" aria-hidden="true" focusable="false">
      <path class="axes" [attr.d]="axes" />
      <path class="shape" [class.outline]="outline" [attr.d]="type === GlyphType.Flower ? flower : star" />
    </svg>
  `,
  styleUrl: './glyph-icon.component.scss',
})
export class GlyphIconComponent {
  @Input({ required: true }) type!: GlyphType;
  /** Dashed outline instead of a filled shape (feature not in the glyph). */
  @Input() outline = false;
  @Input() size = 22;

  readonly GlyphType = GlyphType;
  readonly axes = AXES;
  readonly star = STAR;
  readonly flower = FLOWER;
}
