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

  // ✅ AUTH STATE
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken') && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() > payload.exp * 1000;
  }

  // ✅ USER INFO
  getUserEmail(): string {
    return localStorage.getItem('userEmail') || 'User';
  }

  getUserInitial(): string {
    const email = this.getUserEmail();
    return email.charAt(0).toUpperCase();
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
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

  // ✅ LOGOUT
  logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post(
      `${this.apiUrl}/logout`,
      { refreshToken }
    ).pipe(
      tap(() => {
        localStorage.clear();
      })
    );
  }
}
