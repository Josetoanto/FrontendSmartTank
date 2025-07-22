import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TankLevel } from './tank-level';

describe('TankLevel', () => {
  let component: TankLevel;
  let fixture: ComponentFixture<TankLevel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TankLevel]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TankLevel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with 100% water level', () => {
    expect(component.waterLevel).toBe(100);
  });

  it('should have correct water level class for high level', () => {
    component.waterLevel = 80;
    expect(component.getWaterLevelClass()).toBe('high');
  });

  it('should have correct water level class for medium level', () => {
    component.waterLevel = 50;
    expect(component.getWaterLevelClass()).toBe('medium');
  });

  it('should have correct water level class for low level', () => {
    component.waterLevel = 20;
    expect(component.getWaterLevelClass()).toBe('low');
  });

  it('should return correct water level style', () => {
    component.waterLevel = 75;
    const style = component.getWaterLevelStyle();
    expect(style.height).toBe('75%');
  });

  it('should empty tank when emptyTank is called', () => {
    component.waterLevel = 50;
    component.emptyTank();
    expect(component.waterLevel).toBe(0);
    expect(component.isAnimating).toBe(false);
  });

  it('should fill tank when fillTank is called', () => {
    component.waterLevel = 30;
    component.fillTank();
    expect(component.waterLevel).toBe(100);
    expect(component.isAnimating).toBe(false);
  });

  it('should calculate water quality correctly', () => {
    component.sensorData.ph = 7.5;
    component.sensorData.temperature = 22;
    component.sensorData.turbidity = 1.5;
    component.sensorData.dissolvedOxygen = 8.0;
    component.sensorData.chlorine = 1.0;
    
    component.calculateWaterQuality();
    expect(component.waterQuality).toBeGreaterThan(80);
  });

  it('should return correct quality class', () => {
    component.waterQuality = 85;
    expect(component.getQualityClass()).toBe('excellent');
    
    component.waterQuality = 70;
    expect(component.getQualityClass()).toBe('good');
    
    component.waterQuality = 50;
    expect(component.getQualityClass()).toBe('fair');
    
    component.waterQuality = 30;
    expect(component.getQualityClass()).toBe('poor');
  });

  it('should return correct quality status', () => {
    component.waterQuality = 85;
    expect(component.getQualityStatus()).toBe('Excelente');
    
    component.waterQuality = 70;
    expect(component.getQualityStatus()).toBe('Buena');
    
    component.waterQuality = 50;
    expect(component.getQualityStatus()).toBe('Regular');
    
    component.waterQuality = 30;
    expect(component.getQualityStatus()).toBe('Mala');
  });
}); 