import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterHistogram } from './water-histogram';

describe('WaterHistogram', () => {
  let component: WaterHistogram;
  let fixture: ComponentFixture<WaterHistogram>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterHistogram]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterHistogram);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
