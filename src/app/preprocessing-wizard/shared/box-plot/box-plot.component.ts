import { Component, Input, OnChanges } from '@angular/core';
@Component({
  selector: 'app-box-plot',
  standalone: true,
  imports: [],
  templateUrl: './box-plot.component.html',
  styleUrl: './box-plot.component.scss'
})
export class BoxPlotComponent implements OnChanges {
  @Input() min: number = 0;
  @Input() q1: number = 0;
  @Input() median: number = 0;
  @Input() q3: number = 0;
  @Input() max: number = 0;
  @Input() mean?: number;
  @Input() width: number = 150;
  @Input() height: number = 40;
  @Input() color: string = '#00bcd4';

  // Calculated positions
  boxLeft: number = 0;
  boxWidth: number = 0;
  medianPos: number = 0;
  meanPos?: number;
  whiskerLeftPos: number = 0;
  whiskerRightPos: number = 0;

  padding = 10;
  plotWidth = 0;
  boxHeight = 16;
  boxY = 0;

  ngOnChanges(): void {
    this.plotWidth = this.width - (this.padding * 2);
    this.boxY = (this.height - this.boxHeight) / 2 - 4; // Leave room for labels

    const range = this.max - this.min;
    if (range === 0) return;

    const scale = (value: number) => {
      return this.padding + ((value - this.min) / range) * this.plotWidth;
    };

    this.whiskerLeftPos = scale(this.min);
    this.whiskerRightPos = scale(this.max);
    this.boxLeft = scale(this.q1);
    this.boxWidth = scale(this.q3) - this.boxLeft;
    this.medianPos = scale(this.median);

    if (this.mean !== undefined && this.mean !== null) {
      this.meanPos = scale(this.mean);
    }
  }

  /**
   * Format value for tooltips with full precision
   */
  formatValue(value: number | undefined): string {
    if (value === undefined || value === null) return '—';
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
    }
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  /**
   * Format value for axis labels (short)
   */
  formatShortValue(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    if (Math.abs(value) >= 100) {
      return value.toFixed(0);
    }
    if (Math.abs(value) >= 1) {
      return value.toFixed(1);
    }
    return value.toFixed(2);
  }
}
