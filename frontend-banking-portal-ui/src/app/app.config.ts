import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { LoaderService } from './services/loader.service';
import { loaderInterceptor } from './interceptors/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loaderInterceptor ,jwtInterceptor]) // ✅ THIS LINE FIXES EVERYTHING
    ),
    provideCharts(withDefaultRegisterables())
  ]
};
