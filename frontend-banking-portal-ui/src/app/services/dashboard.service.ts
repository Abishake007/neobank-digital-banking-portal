import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${API_BASE_URL}/api`;

  constructor(private http: HttpClient) {}

  // ✅ JWT-based balance
 getMyBalance() {
  return this.http.get<number>(
    `${API_BASE_URL}/api/accounts/balance`
  );
}


  // ✅ JWT-based recent transactions
  getMyTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/my`);
  }

  getMyAccount() {
  return this.http.get<{ id: number; balance: number }>(
    `${this.apiUrl}/accounts/my`
  );
}

}
