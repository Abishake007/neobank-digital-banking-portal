import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = 'http://localhost:8080/api/transactions';

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
    'http://localhost:8080/api/transactions/monthly'
  );
}

}
