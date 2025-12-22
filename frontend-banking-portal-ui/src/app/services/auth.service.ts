import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ✅ LOGIN + SAVE TOKENS
  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('userEmail', res.email);
        })
      );
  }

  isLoggedIn(): boolean {
  return !!localStorage.getItem('accessToken');
}

isTokenExpired(): boolean {
  const token = localStorage.getItem('accessToken');
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return Date.now() > payload.exp * 1000;
}

getUserRole(): string | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.role;
}

getUserEmail(): string {
  return localStorage.getItem('userEmail') || 'User';
}

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  // ✅ REFRESH TOKEN
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(
      `${this.apiUrl}/refresh`,
      { refreshToken }
    );
  }

  getUserInitial(): string {
  const email = localStorage.getItem('userEmail');
  return email ? email.charAt(0).toUpperCase() : 'U';
}


  // ✅ LOGOUT
 logout() {
  const refreshToken = localStorage.getItem('refreshToken');

  return this.http.post(
    'http://localhost:8080/api/auth/logout',
    { refreshToken }
  );
}

}
