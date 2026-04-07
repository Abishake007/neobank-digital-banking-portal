import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // 1. Get the token using your specific key name 'accessToken'
  const token = localStorage.getItem('accessToken'); 
  
  let authReq = req;

  // 2. Clone the request and add the Authorization header
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("🔑 Security Handshake: Token attached to", req.url);
  } else {
    console.warn("⚠️ No accessToken found! Backend will reject this request.");
  }

  loaderService.show();

  return next(authReq).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};