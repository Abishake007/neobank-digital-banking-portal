import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

export interface Investment {
  id: number;
  productType: 'FD' | 'RD';
  amount: number;
  annualRate: number;
  termMonths: number;
  paidInstallments: number;
  startDate: string;
  maturityDate: string;
  currentValue: number;
  estimatedMaturityValue: number;
  status: 'ACTIVE' | 'MATURED';
}

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private readonly url = `${API_BASE_URL}/api/investments`;

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Investment[]>(this.url); }
  create(productType: 'FD' | 'RD', amount: number, termMonths: number,
         acceptedTerms: boolean, acknowledgedSimulation: boolean, password: string) {
    return this.http.post<Investment>(this.url, {
      productType, amount, termMonths, acceptedTerms, acknowledgedSimulation, password
    });
  }
  payInstallment(id: number, password: string) { return this.http.post<Investment>(`${this.url}/${id}/installment`, { password }); }
  mature(id: number, password: string) { return this.http.post<Investment>(`${this.url}/${id}/mature`, { password }); }
}
