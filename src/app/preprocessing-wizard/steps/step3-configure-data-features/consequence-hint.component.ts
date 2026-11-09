import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { toSpokenText } from './consequence-preview';

/**
 * Helper text under a Step 3 control that states the consequence of the current
 * setting for this column. Give the host an `id` and reference it from the
 * control's `aria-describedby`: the visible text uses symbols (→, –, ≈) that
 * screen readers read poorly, so it is hidden from them and a spelled-out copy
 * is provided instead.
 */
@Component({
  selector: 'app-consequence-hint',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span aria-hidden="true">{{ text }}</span
    ><span class="visually-hidden">{{ spokenText }}</span>`,
  styleUrl: './consequence-hint.component.scss',
})
export class ConsequenceHintComponent {
  @Input({ required: true }) text = '';

  get spokenText(): string {
    return toSpokenText(this.text);
  }
}
