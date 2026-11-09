import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ColorScale, getContinuousGradient, getCategoricalColors } from '../../interfaces/color-scale';

let nextSelectorId = 0;

/**
 * Color scale picker: a button that opens a listbox of scale previews
 * (select-only combobox pattern). Keyboard: Enter, Space, ArrowDown or ArrowUp
 * open the list on the selected scale; ArrowUp/ArrowDown/Home/End move between
 * scales; Enter or Space picks one; Escape closes; Tab leaves.
 *
 * A `<label for>` cannot name this custom element, so callers pass the id of
 * their visible label as `ariaLabelledby` (or a text as `ariaLabel`).
 */
@Component({
  selector: 'app-color-scale-selector',
  standalone: true,
  imports: [],
  templateUrl: './color-scale-selector.component.html',
  styleUrl: './color-scale-selector.component.scss',
})
export class ColorScaleSelectorComponent {
  @Input() groupedColorScales: { group: string; scales: ColorScale[] }[] = [];
  @Input() selectedScale!: ColorScale;
  /** Accessible name of the picker when no `ariaLabelledby` is given. */
  @Input() ariaLabel = 'Color scale';
  /** Id of a visible element that labels the picker; takes precedence over `ariaLabel`. */
  @Input() ariaLabelledby: string | null = null;
  @Output() scaleSelected = new EventEmitter<number>();

  private readonly uid = nextSelectorId++;
  readonly listboxId = `color-scale-listbox-${this.uid}`;
  readonly valueId = `color-scale-value-${this.uid}`;

  dropdownOpen = false;
  getContinuousGradient = getContinuousGradient;
  getCategoricalColors = getCategoricalColors;

  constructor(
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ) {}

  /** aria-labelledby of the trigger: the caller's label, then the current scale name. */
  get triggerLabelledby(): string | null {
    return this.ariaLabelledby ? `${this.ariaLabelledby} ${this.valueId}` : null;
  }

  /** aria-label of the trigger when no labelling element was given. */
  get triggerLabel(): string | null {
    return this.ariaLabelledby ? null : `${this.ariaLabel}: ${this.selectedScale.name}`;
  }

  groupLabelId(groupIndex: number): string {
    return `${this.listboxId}-group-${groupIndex}`;
  }

  toggleDropdown(): void {
    if (this.dropdownOpen) {
      this.close(true);
    } else {
      this.open();
    }
  }

  selectScale(id: number): void {
    this.scaleSelected.emit(id);
    this.close(true);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Escape' && this.dropdownOpen) {
      event.preventDefault();
      this.close(true);
    }
  }

  onListKeydown(event: KeyboardEvent): void {
    const options = this.options();
    const current = options.findIndex(option => option === document.activeElement);
    switch (event.key) {
      case 'ArrowDown':
        this.focusOption(Math.min(current + 1, options.length - 1));
        break;
      case 'ArrowUp':
        this.focusOption(Math.max(current - 1, 0));
        break;
      case 'Home':
        this.focusOption(0);
        break;
      case 'End':
        this.focusOption(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        this.selectFocused(current);
        break;
      case 'Escape':
        this.close(true);
        break;
      default:
        // Tab and everything else keep their default behaviour.
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  /** Clicks inside the picker must not reach the document listener below, which closes it. */
  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.dropdownOpen = false;
  }

  /** Close when keyboard focus leaves the picker (e.g. Tab out of the list). */
  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (this.dropdownOpen && !(next instanceof Node && this.host.nativeElement.contains(next))) {
      this.dropdownOpen = false;
    }
  }

  private open(): void {
    this.dropdownOpen = true;
    this.cdr.detectChanges();
    const selected = this.flatScales().findIndex(scale => scale.id === this.selectedScale.id);
    this.focusOption(Math.max(selected, 0));
  }

  private close(returnFocus: boolean): void {
    this.dropdownOpen = false;
    if (returnFocus) {
      this.cdr.detectChanges();
      this.host.nativeElement.querySelector<HTMLElement>('.selected-scale')?.focus();
    }
  }

  private selectFocused(index: number): void {
    const scale = this.flatScales()[index];
    if (scale) {
      this.selectScale(scale.id);
    }
  }

  private flatScales(): ColorScale[] {
    return this.groupedColorScales.flatMap(group => group.scales);
  }

  private options(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[role="option"]'));
  }

  private focusOption(index: number): void {
    this.options()[index]?.focus();
  }
}
