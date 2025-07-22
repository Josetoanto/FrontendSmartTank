
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

  public pieChartData = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [
      {
        data: [30, 50, 20],
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

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
