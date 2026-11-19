import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const API_BASE_URL = "http://localhost:8080";
//export const API_BASE_URL = "https://neobank-digital-banking-portal.onrender.com";

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ]
};