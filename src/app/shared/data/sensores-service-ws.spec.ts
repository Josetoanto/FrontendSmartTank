import { TestBed } from '@angular/core/testing';

import { SensoresServiceWs } from './sensores-service-ws';

describe('SensoresService', () => {
  let service: SensoresServiceWs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensoresServiceWs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
