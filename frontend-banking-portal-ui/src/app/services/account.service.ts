import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = `${API_BASE_URL}/api/accounts`;

  constructor(private http: HttpClient) {}

  getMyAccounts() {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }
}

