import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = `${API_BASE_URL}/api/accounts`;

  constructor(private http: HttpClient) {}

  getMyAccount() {
    return this.http.get<any>(`${this.apiUrl}/my`);
  }
}

