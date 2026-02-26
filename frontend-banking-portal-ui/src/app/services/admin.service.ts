import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private baseUrl = `${API_BASE_URL}/api/admin`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  updateUserStatus(id: number, enabled: boolean): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/users/${id}/status?enabled=${enabled}`,
      {}
    );
  }
}
