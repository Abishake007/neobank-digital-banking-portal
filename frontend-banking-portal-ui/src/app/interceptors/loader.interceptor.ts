import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize, delay } from 'rxjs'; // ✅ Keep delay

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  console.log("🚀 Interceptor Triggered for:", req.url);
  loaderService.show();

  return next(req).pipe(
    //delay(3000),
    finalize(() => {
      console.log("✅ Interceptor Finished");
      loaderService.hide();
    })
  );
};