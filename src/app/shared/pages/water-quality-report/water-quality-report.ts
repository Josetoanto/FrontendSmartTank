import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';
import { SensoresServiceHttp } from '../../data/sensores-service-http';
import { SensoresServiceWs } from '../../data/sensores-service-ws';

Chart.register(...registerables);

@Component({
  selector: 'app-water-quality-report',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './water-quality-report.html',
  styleUrl: './water-quality-report.scss'
})
export class WaterQualityReport implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('qualityCanvas') qualityCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private qualityChart: any;

  public turbidityValues: number[] = [];
  public turbidityDates: string[] = [];

  public lastTurbidity: number | null = null;
  public avgTurbidity: number | null = null;

  public alerts = 15;
  public alertsTrend = 'up';
  public lostDeals = 4;
  public waterQuality = 84;

  constructor(
    private httpService: SensoresServiceHttp,
    private wsService: SensoresServiceWs
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.fetchLastTurbidityReadings();
      this.fetchLastTurbidity();
      this.fetchAvgTurbidity();
      this.connectToWebSocket();
    }, 0);
  }

  private fetchLastTurbidityReadings() {
    this.httpService.getLastReadings().subscribe((readings: any[]) => {
      const turbidityReadings = readings
        .filter(r => r.sensor?.toLowerCase() === 'turbidez' && r.data?.value !== undefined)
        .slice(-7);

      this.turbidityValues = turbidityReadings.map(r => r.data.value);
      this.turbidityDates = turbidityReadings.map(r => this.formatDate(r.date));

      this.createChart();
      this.updateMetrics();
    });
  }

  private fetchLastTurbidity() {
    this.httpService.getLastTurbidityReading().subscribe((data: any) => {
      if (data?.data?.value !== undefined) {
        this.lastTurbidity = data.data.value;
      }
    });
  }

  private fetchAvgTurbidity() {
    this.httpService.getAvgTurbidity().subscribe((avg: number) => {
      this.avgTurbidity = avg;
    });
  }

  private connectToWebSocket() {
    this.wsService.connect('/ws').subscribe((msg: any) => {
      if (msg.sensor?.toLowerCase() === 'turbidez' && msg.data?.value !== undefined) {
        this.turbidityValues.push(msg.data.value);
        if (this.turbidityValues.length > 7) {
          this.turbidityValues.shift();
        }
        this.updateChart();
        this.updateMetrics();
        this.lastTurbidity = msg.data.value;
      }
    });
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.turbidityDates,
        datasets: [{
          label: 'Turbidez (NTU)',
          data: this.turbidityValues,
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#9ca3af',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: 10,
            grid: { color: '#f3f4f6' },
            ticks: {
              color: '#9ca3af',
              font: { size: 12 }
            }
          }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart) return;

    const chartData = [...this.turbidityValues];
    while (chartData.length < 7) {
      chartData.unshift(0);
    }

    this.chart.data.datasets[0].data = chartData;
    this.chart.data.labels = this.turbidityDates;
    this.chart.update('none');
  }

  private updateMetrics() {
    if (this.turbidityValues.length > 0) {
      const alertCount = this.turbidityValues.filter(value => value > 5).length;
      const alertPercentage = Math.round((alertCount / this.turbidityValues.length) * 100);
      if (alertPercentage !== this.alerts) {
        this.alertsTrend = alertPercentage > this.alerts ? 'up' : 'down';
        this.alerts = alertPercentage;
      }

      const avg = this.turbidityValues.reduce((a, b) => a + b, 0) / this.turbidityValues.length;
      this.avgTurbidity = avg;

      if (avg <= 1) {
        this.waterQuality = 100;
      } else if (avg <= 5) {
        this.waterQuality = Math.floor(85 - (avg - 1) * 10);
      } else {
        this.waterQuality = Math.max(30, 60 - (avg - 5) * 5);
      }

      this.lostDeals = Math.floor(this.alerts / 4);

      if (this.qualityChart) {
        this.qualityChart.data.datasets[0].data = [this.waterQuality, 100 - this.waterQuality];
        this.qualityChart.update('none');
      }
    }
  }

  private createQualityChart() {
    if (!this.qualityCanvas?.nativeElement) return;

    const ctx = this.qualityCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.qualityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [this.waterQuality, 100 - this.waterQuality],
          backgroundColor: ['#fbbf24', '#f3f4f6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
          legend: {
            display: false
          }
        }
      } as any
    });
  }

  getTrendIcon(): string {
    return this.alertsTrend === 'up' ? '↗' : '↘';
  }

  getTrendColor(): string {
    return this.alertsTrend === 'up' ? '#ef4444' : '#10b981';
  }

  getQualityColor(): string {
    if (this.waterQuality >= 80) return '#10b981';
    if (this.waterQuality >= 60) return '#f59e0b';
    return '#ef4444';
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}
