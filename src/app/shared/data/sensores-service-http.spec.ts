import { TestBed } from '@angular/core/testing';

import { SensoresServiceHttp } from './sensores-service-http';

describe('SensoresServiceHttp', () => {
  let service: SensoresServiceHttp;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensoresServiceHttp);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
