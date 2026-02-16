import { Component, Input, OnChanges } from '@angular/core';
@Component({
  selector: 'app-sparkline-chart',
  standalone: true,
  imports: [],
  templateUrl: './sparkline-chart.component.html',
  styleUrl: './sparkline-chart.component.scss'
})
export class SparklineChartComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];  // Labels for tooltip
  @Input() width: number = 100;
  @Input() height: number = 30;
  @Input() color: string = '#00bcd4';
  @Input() type: 'bar' | 'line' = 'bar';

  svgPath: string = '';
  bars: Array<{ x: number; y: number; width: number; height: number; label: string; value: number }> = [];
  maxValue: number = 0;

  ngOnChanges(): void {
    if (this.data && this.data.length > 0) {
      this.maxValue = Math.max(...this.data);

      if (this.type === 'bar') {
        this.generateBars();
      } else {
        this.generateLine();
      }
    }
  }

  private generateBars(): void {
    const barWidth = this.width / this.data.length;
    const barSpacing = barWidth * 0.1;
    const actualBarWidth = barWidth - barSpacing;

    this.bars = this.data.map((value, index) => {
      const barHeight = this.maxValue > 0 ? (value / this.maxValue) * this.height : 0;
      // If label is provided, use it as-is (may already include count)
      // Otherwise create a default label with count
      const label = this.labels && this.labels[index]
        ? this.labels[index]
        : `#${index + 1}: ${value}`;
      return {
        x: index * barWidth,
        y: this.height - barHeight,
        width: actualBarWidth,
        height: barHeight,
        label: label,
        value: value
      };
    });
  }

  private generateLine(): void {
    if (this.data.length === 0) {
      this.svgPath = '';
      return;
    }

    const stepX = this.width / (this.data.length - 1);
    const points = this.data.map((value, index) => {
      const x = index * stepX;
      const y = this.maxValue > 0 ? this.height - (value / this.maxValue) * this.height : this.height;
      return `${x},${y}`;
    });

    this.svgPath = `M ${points.join(' L ')}`;
  }
}
