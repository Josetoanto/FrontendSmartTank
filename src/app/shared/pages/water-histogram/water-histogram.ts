import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';
import { WebSocketService, SensorMessage } from '../../../features/example/data/web-socket-service';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-water-quality-chart',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './water-histogram.html',
  styleUrls: ['./water-histogram.scss']
})
export class WaterHistogram implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  public conductValues: number[] = [];
  public conductLabels: string[] = [];

  public waterQualityPercentage: number = 100;
  public conductLastValue: number | null = null;
  public avgConduct: number = 0;

  public simulandoAguaLimpia: boolean = true;   // ✅ propiedad agregada

  private wsSub?: Subscription;

  constructor(private wsService: WebSocketService) {}

  ngAfterViewInit() {
    this.createChart();

    this.wsSub = this.wsService.getMessages().subscribe((msg: SensorMessage) => {
      console.log('🌐 Mensaje WS recibido:', msg);
      console.log('📊 Datos del sensor:', msg.data);

      if (msg.data?.['conductividad'] !== undefined) {
        const newVal = msg.data['conductividad'];
        const newLabel = new Date(msg.date).toLocaleTimeString();

        this.conductValues.push(newVal);
        this.conductLabels.push(newLabel);

        if (this.conductValues.length > 12) {
          this.conductValues.shift();
          this.conductLabels.shift();
        }

        this.conductLastValue = newVal;
        this.calculateAverage();
        this.calculateWaterQuality();
        this.updateChart();
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  // ✅ método agregado
  alternarModo() {
    this.simulandoAguaLimpia = !this.simulandoAguaLimpia;
  }

  private calculateAverage() {
    if (this.conductValues.length === 0) return;
    const sum = this.conductValues.reduce((a, b) => a + b, 0);
    this.avgConduct = +(sum / this.conductValues.length).toFixed(2);
  }

  private calculateWaterQuality() {
    let quality = 100;
    if (this.avgConduct > 50) {
      quality = Math.max(30, 100 - (this.avgConduct - 50) * 0.3);
    }
    this.waterQualityPercentage = Math.round(quality);
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.conductLabels,
        datasets: [{
          label: 'Conductividad eléctrica (µS/cm)',
          data: this.conductValues,
          backgroundColor: '#1cc88a',
          borderRadius: 5,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 1500,
            title: { display: true, text: 'Conductividad (µS/cm)' }
          },
          x: {
            title: { display: true, text: 'Hora' }
          }
        },
        plugins: {
          legend: { display: true }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.conductLabels;
    this.chart.data.datasets[0].data = this.conductValues;
    this.chart.update('none');
  }
}
