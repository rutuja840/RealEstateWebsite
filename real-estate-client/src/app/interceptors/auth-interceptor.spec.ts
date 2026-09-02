import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  it('passes requests through without a token', () => {
    localStorage.removeItem('realEstateToken');
    const request = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = (nextRequest: HttpRequest<unknown>) => {
      expect(nextRequest.headers.has('Authorization')).toBe(false);
      return of(new HttpResponse({ status: 200 }));
    };

    authInterceptor(request, next);
  });
});