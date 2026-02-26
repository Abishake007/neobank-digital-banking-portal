import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = `${API_BASE_URL}/api/transactions`;

  constructor(private http: HttpClient) {}

  // ✅ JWT-based transfer (CORRECT)
  transferMoney(data: { toAccountId: number; amount: number }) {
    return this.http.post(`${this.baseUrl}/transfer`, data);
  }

  // ✅ JWT-based transaction history (future use)
  getMyTransactions(accountId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }
  getMonthlyReport() {
  return this.http.get<any[]>(
    `${API_BASE_URL}/api/transactions/monthly`
  );
}

}
