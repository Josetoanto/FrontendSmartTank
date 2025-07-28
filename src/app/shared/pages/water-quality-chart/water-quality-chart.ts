import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensoresServiceWs } from '../../data/sensores-service-ws';
import { SensoresServiceHttp } from '../../data/sensores-service-http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';

Chart.register(...registerables);

@Component({
  selector: 'app-water-quality-chart',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './water-quality-chart.html',
  styleUrl: './water-quality-chart.scss'
})
export class WaterQualityChart implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private phValues: number[] = [];
  private phDates: string[] = [];

  public waterQualityPercentage: number = 100;
  public circularProgress: number = 0;
  phLastValue: number | null = null; // Variable para última lectura pH

  constructor(
    private httpService: SensoresServiceHttp,
    private wsService: SensoresServiceWs,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone // <-- Inyectamos NgZone
  ) { }

  ngAfterViewInit(): void {
    this.fetchLastPh();
    this.fetchLastPhReadings();
    this.connectToWebSocket();  // <-- Mover aquí para una sola conexión
  }

  // Obtiene última lectura individual y asigna phLastValue
  private fetchLastPh() {
    this.httpService.getLastPhReading().subscribe((data: any) => {
      console.log('Última lectura de pH:', data);
      if (data && data.data && data.data.value !== undefined) {
        this.phLastValue = data.data.value;
        this.cd.detectChanges();
      }
    });
  }

  // Obtiene últimas 12 lecturas para gráfica
  private fetchLastPhReadings() {
    this.httpService.getLastReadings().subscribe((readings: any[]) => {
      console.log('Lecturas recibidas del backend:', readings);

      const phReadings = readings
        .filter(r => r.sensor?.toLowerCase() === 'ph' && r.data?.value !== undefined)
        .slice(-12);

      this.phValues = phReadings.map(r => r.data.value);
      this.phDates = phReadings.map(r => r.date ? this.formatDate(r.date) : '');

      if (!this.chart) {
        this.createChart();
      } else {
        this.updateChart();
      }
      this.calculateWaterQuality();
    });
  }

  private connectToWebSocket() {
    this.wsService.connect('/ws').subscribe((msg: any) => {
      console.log('Mensaje WSS recibido:', msg); // <-- Log para debug
      if (msg.sensor?.toLowerCase() === 'ph' && msg.data?.value !== undefined) {
        this.ngZone.run(() => {
          this.phValues.push(msg.data.value);
          this.phDates.push(msg.date ? this.formatDate(msg.date) : '');

          if (this.phValues.length > 12) {
            this.phValues.shift();
            this.phDates.shift();
          }

          this.updateChart();
          this.calculateWaterQuality();
        });
      }
    });
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.phDates.length ? this.phDates : Array(12).fill(''),
        datasets: [
          {
            label: 'pH',
            data: this.phValues.length ? this.phValues : Array(12).fill(0),
            backgroundColor: '#6366f1',
            borderColor: '#6366f1',
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#6366f1',
              font: { size: 12, weight: 'normal' },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 6,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: 14,
            ticks: {
              stepSize: 2,
              color: '#9ca3af',
              font: { size: 11 },
              callback: (value) => value
            },
            grid: { color: '#f3f4f6', lineWidth: 1 }
          },
          x: {
            ticks: { color: '#9ca3af', font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.phDates.length ? this.phDates : Array(12).fill('');
    this.chart.data.datasets[0].data = this.phValues.length ? this.phValues : Array(12).fill(0);
    this.chart.update('none');
  }

  private calculateWaterQuality() {
    if (this.phValues.length === 0) return;

    const avgPh = this.phValues.reduce((a, b) => a + b, 0) / this.phValues.length;
    let quality = 100;
    if (avgPh < 6.5 || avgPh > 8.5) {
      quality -= Math.abs(avgPh - 7.5) * 10;
    }
    this.waterQualityPercentage = Math.max(0, Math.min(100, Math.round(quality)));
    this.animateCircularProgress();
  }

  private animateCircularProgress() {
    const targetProgress = this.waterQualityPercentage;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.circularProgress = progress * targetProgress;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  getStrokeDashoffset(): number {
    const circumference = 2 * Math.PI * 52;
    return circumference - (circumference * this.circularProgress / 100);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}
