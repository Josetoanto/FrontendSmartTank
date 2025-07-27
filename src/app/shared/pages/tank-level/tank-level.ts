import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-tank-level',
  standalone: true,
  imports: [CommonModule,Sidebar],
  templateUrl: './tank-level.html',
  styleUrl: './tank-level.scss'
})
export class TankLevel implements OnInit, OnDestroy {
  waterLevel = 100; 
  isAnimating = false;
  private animationInterval: any;

  sensorData = {
    ph: 7.2, 
    conductivity: 450,
    turbidity: 2.1 
  };

  waterQuality = 0;
  waterPollution = 0;

  ngOnInit() {
    this.startWaterLevelAnimation();
    this.calculateWaterQuality();
    this.startSensorSimulation();
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  calculateWaterQuality() {
    let quality = 100;
    let pollution = 0;

    if (this.sensorData.ph < 6.5 || this.sensorData.ph > 8.5) {
      quality -= 30;
      pollution += 30;
    } else if (this.sensorData.ph < 7.0 || this.sensorData.ph > 8.0) {
      quality -= 10;
      pollution += 10;
    }

    if (this.sensorData.turbidity > 5) {
      quality -= 40;
      pollution += 40;
    } else if (this.sensorData.turbidity > 2) {
      quality -= 15;
      pollution += 15;
    }

    if (this.sensorData.conductivity < 200 || this.sensorData.conductivity > 800) {
      quality -= 20;
      pollution += 20;
    } else if (this.sensorData.conductivity < 300 || this.sensorData.conductivity > 700) {
      quality -= 5;
      pollution += 5;
    }

    this.waterQuality = Math.max(0, quality);
    this.waterPollution = Math.min(100, pollution);
  }

  startSensorSimulation() {
    setInterval(() => {
      this.sensorData.ph += (Math.random() - 0.5) * 0.3;
      this.sensorData.conductivity += (Math.random() - 0.5) * 50;
      this.sensorData.turbidity += (Math.random() - 0.5) * 0.5;

      this.sensorData.ph = Math.max(6.0, Math.min(9.0, this.sensorData.ph));
      this.sensorData.conductivity = Math.max(200, Math.min(800, this.sensorData.conductivity));
      this.sensorData.turbidity = Math.max(0.5, Math.min(10, this.sensorData.turbidity));

      this.calculateWaterQuality();
    }, 3000);
  }

  getQualityClass() {
    if (this.waterQuality >= 80) return 'excellent';
    if (this.waterQuality >= 60) return 'good';
    if (this.waterQuality >= 40) return 'fair';
    return 'poor';
  }

  getQualityStatus() {
    if (this.waterQuality >= 80) return 'Excelente';
    if (this.waterQuality >= 60) return 'Buena';
    if (this.waterQuality >= 40) return 'Regular';
    return 'Mala';
  }

  getPollutionClass() {
    if (this.waterPollution < 20) return 'low';
    if (this.waterPollution < 50) return 'medium';
    if (this.waterPollution < 80) return 'high';
    return 'critical';
  }

  getPollutionStatus() {
    if (this.waterPollution < 20) return 'Baja';
    if (this.waterPollution < 50) return 'Media';
    if (this.waterPollution < 80) return 'Alta';
    return 'Crítica';
  }

  getPollutionColor() {
    if (this.waterPollution < 30) {
      return '#27ae60'; 
    } else if (this.waterPollution < 60) {
      return '#f1c40f'; 
    } else if (this.waterPollution < 80) {
      return '#e67e22'; 
    } else {
      return '#e74c3c'; 
    }
  }

  startWaterLevelAnimation() {
    this.isAnimating = true;
    this.waterLevel = 100;
    
    this.animationInterval = setInterval(() => {
      if (this.waterLevel > 0) {
        this.waterLevel -= 0.5; 
      } else {
        this.isAnimating = false;
        clearInterval(this.animationInterval);
        setTimeout(() => {
          this.startWaterLevelAnimation();
        }, 2000);
      }
    }, 100);
  }

  resetAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.startWaterLevelAnimation();
  }

  emptyTank() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.isAnimating = false;
    
    const targetLevel = 0;
    const currentLevel = this.waterLevel;
    const steps = 50; 
    const stepSize = (currentLevel - targetLevel) / steps;
    let currentStep = 0;
    
    const emptyInterval = setInterval(() => {
      currentStep++;
      this.waterLevel = Math.max(0, currentLevel - (stepSize * currentStep));
      
      if (currentStep >= steps) {
        this.waterLevel = 0;
        clearInterval(emptyInterval);
      }
    }, 20);
  }

  fillTank() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.isAnimating = false;
    
    const targetLevel = 100;
    const currentLevel = this.waterLevel;
    const steps = 50; 
    const stepSize = (targetLevel - currentLevel) / steps;
    let currentStep = 0;
    
    const fillInterval = setInterval(() => {
      currentStep++;
      this.waterLevel = Math.min(100, currentLevel + (stepSize * currentStep));
      
      if (currentStep >= steps) {
        this.waterLevel = 100;
        clearInterval(fillInterval);
      }
    }, 20); 
  }

  getWaterLevelStyle() {
    return {
      height: `${this.waterLevel}%`,
      transition: 'height 0.1s ease-out'
    };
  }

  getWaterLevelClass() {
    if (this.waterLevel > 70) return 'high';
    if (this.waterLevel > 30) return 'medium';
    return 'low';
  }
} 