import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class WaterQualityChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private phValues: number[] = [];
  private phDates: string[] = [];

  public waterQualityPercentage: number = 100;
  public circularProgress: number = 0;

  phLastValue: number | null = null;
  avgPh: number = 0;

  simulandoAguaLimpia: boolean = true;

  private simulationIntervalId?: any;

  // Rango actual de pH simulado (inicial agua limpia)
  private minPh: number = 6.5;
  private maxPh: number = 8.5;

  // Rango objetivo para transición suave
  private targetMinPh: number = 6.5;
  private targetMaxPh: number = 8.5;

  // Paso de cambio gradual en rango pH
  private transitionStep: number = 0.05;

  ngOnInit() {
    // No crear gráfica aquí porque canvas no está listo
  }

  ngAfterViewInit() {
    this.createChart();
    this.iniciarSimulacion();
    this.iniciarTransicionRango();
  }

  alternarModo() {
    this.simulandoAguaLimpia = !this.simulandoAguaLimpia;
    console.log('Modo cambiado a:', this.simulandoAguaLimpia ? 'Agua Limpia' : 'Agua Sucia');

    if (this.simulandoAguaLimpia) {
      this.targetMinPh = 6.5;
      this.targetMaxPh = 8.5;
    } else {
      this.targetMinPh = 8.6;
      this.targetMaxPh = 10.6;
    }
  }

  private iniciarTransicionRango() {
    setInterval(() => {
      if (Math.abs(this.minPh - this.targetMinPh) > this.transitionStep) {
        this.minPh += this.minPh < this.targetMinPh ? this.transitionStep : -this.transitionStep;
      } else {
        this.minPh = this.targetMinPh;
      }

      if (Math.abs(this.maxPh - this.targetMaxPh) > this.transitionStep) {
        this.maxPh += this.maxPh < this.targetMaxPh ? this.transitionStep : -this.transitionStep;
      } else {
        this.maxPh = this.targetMaxPh;
      }

      // Opcional para debug:
      // console.log(`Rango actual pH: ${this.minPh.toFixed(2)} - ${this.maxPh.toFixed(2)}`);
    }, 500);
  }

  private simularPh(): number {
    const val = +(this.minPh + Math.random() * (this.maxPh - this.minPh)).toFixed(2);
    console.log('Simulando pH:', val, `(rango ${this.minPh.toFixed(2)} - ${this.maxPh.toFixed(2)})`);
    return val;
  }

  private iniciarSimulacion() {
    this.phValues = [];
    this.phDates = [];

    for (let i = 0; i < 12; i++) {
      const valor = this.simularPh();
      const fecha = new Date(Date.now() - (12 - i) * 2000).toISOString();
      this.phValues.push(valor);
      this.phDates.push(this.formatDate(fecha));
      this.phLastValue = valor;
    }
    console.log('Datos iniciales pH:', this.phValues);

    this.calcularPromedio();
    this.calculateWaterQuality();
    this.updateChart();

    if (this.simulationIntervalId) clearInterval(this.simulationIntervalId);

    this.simulationIntervalId = setInterval(() => {
      const nuevoValor = this.simularPh();
      const fecha = new Date().toISOString();

      this.phValues.push(nuevoValor);
      this.phDates.push(this.formatDate(fecha));
      this.phLastValue = nuevoValor;

      if (this.phValues.length > 12) {
        this.phValues.shift();
        this.phDates.shift();
      }

      console.log('Datos actualizados pH:', this.phValues);

      this.updateChart();
      this.calcularPromedio();
      this.calculateWaterQuality();
    }, 2000);
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
    console.log('Gráfica creada');
  }

  private updateChart() {
    if (!this.chart) {
      console.warn('No hay gráfica para actualizar');
      return;
    }
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