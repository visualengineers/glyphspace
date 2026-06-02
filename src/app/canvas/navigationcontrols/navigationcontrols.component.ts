import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navigationcontrols',
  standalone: true,
  templateUrl: './navigationcontrols.component.html',
  styleUrls: ['./navigationcontrols.component.scss'],
})
export class CanvasNavigationControlsComponent {
  @Input() visible = false; // controls fade in/out
  @Input() selectionMode!: boolean;
  @Input() magicLenseStatus!: boolean;

  @Output() toggleNavigation = new EventEmitter<void>();
  @Output() toggleSelection = new EventEmitter<void>();
  @Output() toggleLens = new EventEmitter<void>();
}
