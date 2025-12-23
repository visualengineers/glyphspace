import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-legend-dropdown',
  standalone: true,
  templateUrl: './legend-dropdown.component.html',
  styleUrls: ['./legend-dropdown.component.scss'],
})
export class LegendDropdownComponent {
  @Input() open = false;
  @Input() width = 360;
}
