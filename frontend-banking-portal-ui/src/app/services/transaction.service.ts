import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = `${API_BASE_URL}/api/transactions`;
  // ✅ Create a separate base for the savings/pockets API
  private savingsUrl = `${API_BASE_URL}/api/savings`;

  constructor(private http: HttpClient) {}

  transferMoney(data: { toAccountNumber: string; amount: number; category: string }) {
    return this.http.post(`${this.baseUrl}/transfer`, data);
  }

  getSpendingStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/spending-stats`);
  }

  getMyTransactions() {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }

  getMonthlyReport() {
    return this.http.get<any[]>(`${this.baseUrl}/monthly`);
  }

  addFundsViaUPI(amount: number, vpa: string, password: string) {
    return this.http.post(`${this.baseUrl}/add-funds`, 
      { amount, vpa, password }, 
      { responseType: 'text' }
    );
  }

  // ✅ UPDATED: Fixed Localhost to Cloud URL
  claimPocket(id: number) {
    return this.http.delete(`${this.savingsUrl}/claim/${id}`);
  }

  // ✅ UPDATED: Fixed Localhost to Cloud URL
  getPockets() {
    return this.http.get<any[]>(`${this.savingsUrl}/my-pockets`);
  }

  // ✅ UPDATED: Fixed Localhost to Cloud URL
  createPocket(name: string, target: number) {
    const body = {
      goalName: name,
      targetAmount: target
    };
    return this.http.post(`${this.savingsUrl}/create`, body);
  }

  // ✅ UPDATED: Fixed Localhost to Cloud URL
  stashMoney(goalId: number, amount: number) {
    return this.http.post(`${this.savingsUrl}/stash?goalId=${goalId}&amount=${amount}`, {});
  }
}
