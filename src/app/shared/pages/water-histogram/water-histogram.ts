import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';

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

  public simulandoAguaLimpia: boolean = true;

  private minConduct = 0;
  private maxConduct = 50;

  private targetMinConduct = 0;
  private targetMaxConduct = 50;

  private transitionStep = 5;

  private simulationIntervalId?: any;

  ngAfterViewInit() {
    this.createChart();
    this.startTransitionRange();
    this.startSimulation();
  }

  ngOnDestroy() {
    if (this.simulationIntervalId) clearInterval(this.simulationIntervalId);
  }

  alternarModo() {
    this.simulandoAguaLimpia = !this.simulandoAguaLimpia;
    if (this.simulandoAguaLimpia) {
      this.targetMinConduct = 0;
      this.targetMaxConduct = 50;
    } else {
      this.targetMinConduct = 300;
      this.targetMaxConduct = 500;
    }
  }

  private startTransitionRange() {
    setInterval(() => {
      if (Math.abs(this.minConduct - this.targetMinConduct) > this.transitionStep) {
        this.minConduct += this.minConduct < this.targetMinConduct ? this.transitionStep : -this.transitionStep;
      } else {
        this.minConduct = this.targetMinConduct;
      }

      if (Math.abs(this.maxConduct - this.targetMaxConduct) > this.transitionStep) {
        this.maxConduct += this.maxConduct < this.targetMaxConduct ? this.transitionStep : -this.transitionStep;
      } else {
        this.maxConduct = this.targetMaxConduct;
      }
    }, 500);
  }

  private simulateConductivity(): number {
    return +(this.minConduct + Math.random() * (this.maxConduct - this.minConduct)).toFixed(2);
  }

  private startSimulation() {
    // Inicializar datos con 12 puntos
    this.conductValues = [];
    this.conductLabels = [];
    const now = Date.now();
    for (let i = 11; i >= 0; i--) {
      const val = this.simulateConductivity();
      this.conductValues.push(val);
      this.conductLabels.push(new Date(now - i * 2000).toLocaleTimeString());
    }
    this.conductLastValue = this.conductValues[this.conductValues.length - 1];
    this.calculateAverage();
    this.calculateWaterQuality();
    this.updateChart();

    // Actualizar cada 2 segundos con nuevos datos
    this.simulationIntervalId = setInterval(() => {
      const newVal = this.simulateConductivity();
      const newLabel = new Date().toLocaleTimeString();

      this.conductValues.push(newVal);
      this.conductLabels.push(newLabel);

      // Mantener máximo 12 puntos
      if (this.conductValues.length > 12) {
        this.conductValues.shift();
        this.conductLabels.shift();
      }

      this.conductLastValue = newVal;
      this.calculateAverage();
      this.calculateWaterQuality();
      this.updateChart();
    }, 2000);
  }

  private calculateAverage() {
    if (this.conductValues.length === 0) return;
    const sum = this.conductValues.reduce((a, b) => a + b, 0);
    this.avgConduct = +(sum / this.conductValues.length).toFixed(2);
  }

  private calculateWaterQuality() {
    // Ejemplo simple: mejor calidad con menos conductividad
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
            max: 600,
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
