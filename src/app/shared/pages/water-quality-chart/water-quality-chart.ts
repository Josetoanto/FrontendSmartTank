import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../features/example/data/web-socket-service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';

Chart.register(...registerables);


interface WaterSensorData {
  turbidity: number[];
}
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

  private sensorData: WaterSensorData = {
    turbidity: []
  };

  // Datos para las métricas
  public alertsPercentage: number = 15;
  public lostDealsPercentage: number = 4;
  public waterQualityPercentage: number = 84;

  // Datos para el gráfico circular
  public circularProgress: number = 0;

  constructor(private webSocketService: WebSocketService) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createChart();
      this.animateCircularProgress();
      this.connectToWebSocket();
    }, 0);
  }

  private connectToWebSocket() {
    this.webSocketService.getMessages().subscribe((msg) => {
      // msg: SensorMessage { sensor: string, data: { [key: string]: any }, date: string }
      const name = msg.sensor;
      const sensorData = msg.data;

      if (!name || !sensorData) {
        console.warn('Datos inválidos recibidos:', msg);
        return;
      }

      // Solo procesar datos del sensor de turbidez
      if (name === 'Turbidity Sensor' || name.toLowerCase().includes('turbidity')) {
        const turbidityValue = sensorData['turbidity'] ?? sensorData['value'] ?? sensorData;
        if (typeof turbidityValue === 'number') {
          this.sensorData.turbidity.push(turbidityValue);
          if (this.sensorData.turbidity.length > 12) {
            this.sensorData.turbidity.shift();
          }
          this.updateChart();
          this.calculateWaterQuality();
        }
      }
    });
  }

  // Eliminadas funciones de pH y turbidez separadas, todo se maneja en connectToWebSocket

  private createChart() {
    if (!this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
        datasets: [
          {
            label: 'pH',
            data: [450, 700, 600, 650, 480, 800, 900, 400, 850, 750, 950, 1000],
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
              font: {
                size: 12,
                weight: 'normal'
              },
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
            max: 1000,
            ticks: {
              stepSize: 200,
              color: '#9ca3af',
              font: {
                size: 11
              },
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: '#f3f4f6',
              lineWidth: 1
            }
          },
          x: {
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart) return;

    // Actualizar datos del gráfico con los últimos valores de los sensores
    if (this.sensorData.turbidity.length > 0) {
      // Simular datos basados en los valores reales de turbidez
      const turbidityData = this.sensorData.turbidity.slice(-12); // Últimos 12 valores
      const scaledData = turbidityData.map(value => value * 100); // Escalar para visualización
      
      this.chart!.data.datasets[0].data = scaledData;
      this.chart!.update('none'); // Actualización sin animación para mejor rendimiento
    }
  }

  private calculateWaterQuality() {
    if (this.sensorData.turbidity.length === 0) return;

    // Calcular calidad del agua basada solo en turbidez
    const avgTurbidity = this.sensorData.turbidity.reduce((a, b) => a + b, 0) / this.sensorData.turbidity.length;

    // Calcular porcentaje de calidad (ejemplo de lógica)
    let quality = 100;
    // Penalizar por turbidez alta
    if (avgTurbidity > 1) {
      quality -= avgTurbidity * 10;
    }

    this.waterQualityPercentage = Math.max(0, Math.min(100, Math.round(quality)));

    // Actualizar alertas basadas en la calidad
    this.alertsPercentage = this.waterQualityPercentage < 70 ? 25 : 15;
    this.lostDealsPercentage = this.waterQualityPercentage < 60 ? 8 : 4;
  }

  private animateCircularProgress() {
    const targetProgress = this.waterQualityPercentage;
    const duration = 1000; // 1 segundo
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

  // Método para obtener el offset del stroke del círculo
  getStrokeDashoffset(): number {
    const circumference = 2 * Math.PI * 52; // radio = 52
    return circumference - (circumference * this.circularProgress / 100);
  }

  // Método para obtener el color del trend
  getTrendColor(): string {
    return this.alertsPercentage > 20 ? '#ef4444' : '#10b981';
  }
}
