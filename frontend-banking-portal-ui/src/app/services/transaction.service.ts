import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = `${API_BASE_URL}/api/transactions`;
  private savingsUrl = `${API_BASE_URL}/api/savings`;

  constructor(private http: HttpClient) {}

  transferMoney(data: { toAccountNumber: string; amount: number; category: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfer`, data);
  }

  getSpendingStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/spending-stats`);
  }

  // Changed to Observable<any[]> to ensure the report component gets an array
  getMyTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }

  // ✅ TIP: If /monthly is returning [], try changing this to /my 
  // just to see if your data appears in the table.
  getMonthlyReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }

  addFundsViaUPI(amount: number, vpa: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-funds`, { amount, vpa, password });
  }

  claimPocket(id: number): Observable<any> {
    return this.http.delete(`${this.savingsUrl}/claim/${id}`);
  }

  getPockets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.savingsUrl}/my-pockets`);
  }

  createPocket(name: string, target: number): Observable<any> {
    const body = { goalName: name, targetAmount: target };
    return this.http.post(`${this.savingsUrl}/create`, body); // Fixed: ensure this uses correct base
  }

  stashMoney(goalId: number, amount: number): Observable<any> {
    // Note: It's better to send these as a JSON body rather than Params if your backend allows
    return this.http.post(`${this.savingsUrl}/stash?goalId=${goalId}&amount=${amount}`, {});
  }
}
