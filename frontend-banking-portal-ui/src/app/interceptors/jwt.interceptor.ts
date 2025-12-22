import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {

  const authService = inject(AuthService);

  // 🚫 DO NOT intercept auth endpoints
  if (req.url.includes('/api/auth')) {
    return next(req);
  }

  const accessToken = localStorage.getItem('accessToken');
  let authReq = req;

  // ✅ Attach access token
  if (accessToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(err => {

      // 🔁 Access token expired
      if (err.status === 401 && localStorage.getItem('refreshToken')) {

        return authService.refreshToken().pipe(
          switchMap(res => {
            localStorage.setItem('accessToken', res.accessToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`
              }
            });

            return next(retryReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => err);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
