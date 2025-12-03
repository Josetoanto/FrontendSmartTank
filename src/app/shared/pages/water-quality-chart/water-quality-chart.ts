import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';
import { WebSocketService, SensorMessage } from '../../../features/example/data/web-socket-service';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-water-quality-chart',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './water-quality-chart.html',
  styleUrls: ['./water-quality-chart.scss'] // ✅ corregido: era styleUrl
})
export class WaterQualityChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private phValues: number[] = [];
  private phDates: string[] = [];

  public waterQualityPercentage: number = 100;
  public circularProgress: number = 0;

  phLastValue: number | null = null;
  avgPh: number = 0;

  simulandoAguaLimpia: boolean = true;

  private wsSub?: Subscription;

  ngOnInit() {
    // No crear gráfica aquí porque canvas no está listo
  }

  ngAfterViewInit() {
    this.createChart();

    // ✅ Suscribirse al WebSocketService
    this.wsSub = this.wsService.getMessages().subscribe((msg: SensorMessage) => {
      console.log('🌐 Mensaje WS recibido en WaterQualityChart:', msg);

      if (msg.data?.['ph'] !== undefined) {
        const newVal = msg.data['ph'];
        const newLabel = new Date(msg.date).toLocaleTimeString();

        this.phValues.push(newVal);
        this.phDates.push(newLabel);
        this.phLastValue = newVal;

        if (this.phValues.length > 12) {
          this.phValues.shift();
          this.phDates.shift();
        }

        this.updateChart();
        this.calcularPromedio();
        this.calculateWaterQuality();
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  alternarModo() {
    this.simulandoAguaLimpia = !this.simulandoAguaLimpia;
    console.log('Modo cambiado a:', this.simulandoAguaLimpia ? 'Agua Limpia' : 'Agua Sucia');
  }

  private calcularPromedio() {
    if (this.phValues.length === 0) return;
    const suma = this.phValues.reduce((a, b) => a + b, 0);
    this.avgPh = +(suma / this.phValues.length).toFixed(2);
    console.log('Promedio pH calculado:', this.avgPh);
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement) {
      console.warn('Canvas no disponible para crear gráfica');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('Contexto 2D no disponible');
      return;
    }

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
          legend: { display: true, position: 'top' },
          tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#fff', bodyColor: '#fff' }
        },
        scales: {
          y: { beginAtZero: true, min: 0, max: 14 },
          x: { grid: { display: false } }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    console.log('Gráfica creada');
  }

  private updateChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.phDates.length ? this.phDates : Array(12).fill('');
    this.chart.data.datasets[0].data = this.phValues.length ? this.phValues : Array(12).fill(0);
    this.chart.update('none');
    console.log('Gráfica actualizada');
  }

  private calculateWaterQuality() {
    if (this.phValues.length === 0) return;

    const avgPh = this.avgPh;
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
      if (progress < 1) requestAnimationFrame(animate);
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

  constructor(private wsService: WebSocketService) {}
}
