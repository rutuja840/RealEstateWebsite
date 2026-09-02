import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth';

describe('AuthService', () => {
  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    const service = TestBed.inject(AuthService);

    expect(service).toBeTruthy();
  });
});