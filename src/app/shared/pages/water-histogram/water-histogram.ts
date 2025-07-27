import { Component } from '@angular/core';
import { ChartType, ChartConfiguration } from 'chart.js';
import { Sidebar } from '../../components/sidebar/sidebar';
import { NgChartsModule } from 'ng2-charts';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-water-histogram',
  imports: [NgChartsModule, Sidebar],
  templateUrl: './water-histogram.html',
  styleUrl: './water-histogram.scss'
})
export class WaterHistogram {
  chartType: ChartType = 'bar';
  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['pH', 'Conductividad', 'Turbidez'],
    datasets: [
      {
        label: 'Lectura actual',
        data: [0, 0, 0],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc']
      }
    ]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valor'
        }
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  private socket$!: WebSocketSubject<any>;
private sensorSubscription!: Subscription;


  ngOnInit(): void {
    // Conéctate a tu WebSocket (reemplaza por tu URL real)
    this.socket$ = new WebSocketSubject('http://localhost:8000/sensors');

    this.sensorSubscription = this.socket$.subscribe((message) => {
      // Se espera que el mensaje sea un objeto como:
      // { ph: number, conductividad: number, turbidez: number }

      if (message.ph !== undefined && message.conductividad !== undefined && message.turbidez !== undefined) {
        this.chartData.datasets[0].data = [
          message.ph,
          message.conductividad,
          message.turbidez
        ];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sensorSubscription) this.sensorSubscription.unsubscribe();
    if (this.socket$) this.socket$.complete();
  }
}
