import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { WebSocketService, SensorMessage } from '../../../features/example/data/web-socket-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tank-level',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './tank-level.html',
  styleUrls: ['./tank-level.scss'] // ✅ corregido: era styleUrl
})
export class TankLevel implements OnInit, OnDestroy {
  waterLevel = 100; 
  isAnimating = false;
  private animationInterval: any;
  private wsSub?: Subscription;

  sensorData = {
    ph: 7.2, 
    conductivity: 450,
    turbidity: 2.1 
  };

  waterQuality = 0;
  waterPollution = 0;

  constructor(private wsService: WebSocketService) {}

  ngOnInit() {
    this.startWaterLevelAnimation();
    this.calculateWaterQuality();

    // ✅ Suscribirse al WebSocketService
    this.wsSub = this.wsService.getMessages().subscribe((msg: SensorMessage) => {
      console.log('🌐 Mensaje WS recibido en TankLevel:', msg);

      if (msg.data?.['ph'] !== undefined) this.sensorData.ph = msg.data['ph'];
      if (msg.data?.['conductividad'] !== undefined) this.sensorData.conductivity = msg.data['conductividad'];
      if (msg.data?.['turbidez'] !== undefined) this.sensorData.turbidity = msg.data['turbidez'];
      if (msg.data?.['nivel'] !== undefined) this.waterLevel = msg.data['nivel'];

      this.calculateWaterQuality();
    });
  }

  ngOnDestroy() {
    if (this.animationInterval) clearInterval(this.animationInterval);
    this.wsSub?.unsubscribe();
  }

  calculateWaterQuality() {
    let quality = 100;
    let pollution = 0;

    if (this.sensorData.ph < 6.5 || this.sensorData.ph > 8.5) {
      quality -= 30; pollution += 30;
    } else if (this.sensorData.ph < 7.0 || this.sensorData.ph > 8.0) {
      quality -= 10; pollution += 10;
    }

    if (this.sensorData.turbidity > 5) {
      quality -= 40; pollution += 40;
    } else if (this.sensorData.turbidity > 2) {
      quality -= 15; pollution += 15;
    }

    if (this.sensorData.conductivity < 200 || this.sensorData.conductivity > 800) {
      quality -= 20; pollution += 20;
    } else if (this.sensorData.conductivity < 300 || this.sensorData.conductivity > 700) {
      quality -= 5; pollution += 5;
    }

    this.waterQuality = Math.max(0, quality);
    this.waterPollution = Math.min(100, pollution);
  }

  // ✅ Métodos tipados para ngClass
  getQualityClass(): string {
    if (this.waterQuality >= 80) return 'excellent';
    if (this.waterQuality >= 60) return 'good';
    if (this.waterQuality >= 40) return 'fair';
    return 'poor';
  }

  getQualityStatus(): string {
    if (this.waterQuality >= 80) return 'Excelente';
    if (this.waterQuality >= 60) return 'Buena';
    if (this.waterQuality >= 40) return 'Regular';
    return 'Mala';
  }

  getPollutionClass(): string {
    if (this.waterPollution < 20) return 'low';
    if (this.waterPollution < 50) return 'medium';
    if (this.waterPollution < 80) return 'high';
    return 'critical';
  }

  getPollutionStatus(): string {
    if (this.waterPollution < 20) return 'Baja';
    if (this.waterPollution < 50) return 'Media';
    if (this.waterPollution < 80) return 'Alta';
    return 'Crítica';
  }

  getPollutionColor(): string {
    if (this.waterPollution < 30) return '#27ae60'; 
    if (this.waterPollution < 60) return '#f1c40f'; 
    if (this.waterPollution < 80) return '#e67e22'; 
    return '#e74c3c'; 
  }

  getWaterLevelStyle(): { [key: string]: string } {
    return {
      height: `${this.waterLevel}%`,
      transition: 'height 0.1s ease-out'
    };
  }

  getWaterLevelClass(): string {
    if (this.waterLevel > 70) return 'high';
    if (this.waterLevel > 30) return 'medium';
    return 'low';
  }

  // ✅ Animaciones del tanque
  startWaterLevelAnimation() {
    this.isAnimating = true;
    this.waterLevel = 100;
    
    this.animationInterval = setInterval(() => {
      if (this.waterLevel > 0) {
        this.waterLevel -= 0.5; 
      } else {
        this.isAnimating = false;
        clearInterval(this.animationInterval);
        setTimeout(() => this.startWaterLevelAnimation(), 2000);
      }
    }, 100);
  }

  resetAnimation() { /* igual que antes */ }
  emptyTank() { /* igual que antes */ }
  fillTank() { /* igual que antes */ }
}
