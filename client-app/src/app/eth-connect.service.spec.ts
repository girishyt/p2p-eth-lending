import { TestBed } from '@angular/core/testing';

import { EthConnectService } from './eth-connect.service';

describe('EthConnectService', () => {
  let service: EthConnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
