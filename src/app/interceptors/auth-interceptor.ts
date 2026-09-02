import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    if (req.url.endsWith('/Auth/login') || req.url.endsWith('/Auth/register')) {
      return next(req);
    }

    const token =
      localStorage.getItem('token');

    if (token) {

      const authRequest =
        req.clone({

          setHeaders: {

            Authorization:
              `Bearer ${token}`

          }

        });

      return next(authRequest).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            ['token', 'user', 'userId', 'fullName', 'email', 'role'].forEach(key => {
              localStorage.removeItem(key);
            });
          }
          return throwError(() => error);
        })
      );
    }

    return next(req);
  };