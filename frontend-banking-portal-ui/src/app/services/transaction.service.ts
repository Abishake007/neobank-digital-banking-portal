import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = `${API_BASE_URL}/api/transactions`;

  constructor(private http: HttpClient) {}

  // ✅ Updated to include category
  transferMoney(data: { toAccountNumber: string; amount: number; category: string }) {
    return this.http.post(`${this.baseUrl}/transfer`, data);
  }

  // ✅ New method for the Chart.js Analytics
  getSpendingStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/spending-stats`);
  }

  // Transaction history
  getMyTransactions() {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }

  // Monthly report
  getMonthlyReport() {
    return this.http.get<any[]>(`${this.baseUrl}/monthly`);
  }

  // Inside src/app/services/transaction.service.ts

addFundsViaUPI(amount: number, vpa: string, password: string) {
  // ✅ Now accepting 3 parameters to match the Component call
  return this.http.post(`${this.baseUrl}/add-funds`, 
    { amount, vpa, password }, 
    { responseType: 'text' } // Matches your Spring Boot String response
  );
}

claimPocket(id: number) {
  // Matches the @DeleteMapping("/claim/{id}") in your Controller
  return this.http.delete(`http://localhost:8080/api/savings/claim/${id}`);
}
// Inside TransactionService
// Inside transaction.service.ts

// ✅ Use the base URL without '/transactions' if necessary, 
// or just hardcode the correct path for these specific ones:

getPockets() {
  // Make sure this matches your Spring Boot @RequestMapping("/api/savings")
  return this.http.get<any[]>(`http://localhost:8080/api/savings/my-pockets`);
}

createPocket(name: string, target: number) {
  const body = {
    goalName: name,      // ✅ Must match payload.get("goalName") in Java
    targetAmount: target // ✅ Must match payload.get("targetAmount") in Java
  };
  return this.http.post(`http://localhost:8080/api/savings/create`, body);
}

stashMoney(goalId: number, amount: number) {
  return this.http.post(`http://localhost:8080/api/savings/stash?goalId=${goalId}&amount=${amount}`, {});
}
}
