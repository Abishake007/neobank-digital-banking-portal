import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ✅ JWT-based balance
 getMyBalance() {
  return this.http.get<number>(
    'http://localhost:8080/api/accounts/balance'
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
