import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-water-quality',
  templateUrl: './water-quality.html',
  styleUrls: ['./water-quality.scss'],
  standalone: true,
  imports: [CommonModule, NgChartsModule, Sidebar],
})
export class WaterQuality implements OnInit, OnDestroy {
  public isBrowser: boolean;
  private socket: WebSocket | null = null;

  public pieChartData = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [
      {
        data: [30, 50, 20], // Default values
        backgroundColor: ['#f87171', '#60a5fa', '#facc15'],
      }
    ]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.socket = new WebSocket('ws://localhost:8000/water-quality'); // Cambia la URL según tu backend

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.updateChart(data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

 private updateChart(data: any): void {
  const counts = { Alta: 0, Media: 0, Baja: 0 };
  let score = 0;

  data.observations.forEach((obs: any) => {
    const status = obs.status.toLowerCase();

    // Calificación por puntos para quality_value
    if (status === 'normal' || status === 'perfecta') {
      counts.Alta++;
      score += 2;
    } else if (status === 'aceptable' || status === 'bajo' || status === 'muy baja') {
      counts.Media++;
      score += 1;
    } else if (status === 'alta' || status === 'no data') {
      counts.Baja++;
    }
  });

  // Cálculo quality_value basado en puntos
  let qualityValue = 0;
  switch (score) {
    case 6: qualityValue = 100; break;
    case 5: qualityValue = 83; break;
    case 4: qualityValue = 66; break;
    case 3: qualityValue = 50; break;
    case 2: qualityValue = 33; break;
    case 1: qualityValue = 16; break;
    default: qualityValue = 0; break;
  }

  // Actualiza la gráfica
  this.pieChartData.datasets[0].data = [counts.Alta, counts.Media, counts.Baja];

  console.log(`quality_value calculado: ${qualityValue}%`);
}

}
