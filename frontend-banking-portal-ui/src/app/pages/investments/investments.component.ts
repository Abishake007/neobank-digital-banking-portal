import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { AlertService } from '../../services/alert.service';
import { Investment, InvestmentService } from '../../services/investment.service';
import { PdfStatementService } from '../../services/pdf-statement.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})
export class InvestmentsComponent implements OnInit {
  investments: Investment[] = [];
  availableBalance = 0;
  accountHolderName = '';
  loading = true;
  saving = false;
  productType: 'FD' | 'RD' = 'FD';
  amount: number | null = null;
  termMonths = 12;
  calculatorType: 'FD' | 'RD' = 'FD';
  calculatorAmount: number | null = null;
  calculatorTermMonths = 12;
  showConfirmation = false;
  acceptedTerms = false;
  acknowledgedSimulation = false;
  investmentPassword = '';
  showActionConfirmation = false;
  actionPassword = '';
  pendingAction: 'INSTALLMENT' | 'MATURE' | null = null;
  pendingInvestment: Investment | null = null;
  readonly fdTerms = [3, 6, 12, 24];
  readonly rdTerms = [6, 12, 24];

  constructor(private investmentsApi: InvestmentService, private accountService: AccountService,
              private alerts: AlertService, private pdfStatement: PdfStatementService,
              private authService: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.accountService.getMyAccount().subscribe({
      next: account => {
        this.availableBalance = Number(account.availableBalance || 0);
        this.accountHolderName = account.accountHolderName || '';
      },
      error: () => this.alerts.show('Could not load your account balance.', 'error')
    });
    this.investmentsApi.list().subscribe({
      next: data => { this.investments = data; this.loading = false; },
      error: () => { this.loading = false; this.alerts.show('Could not load your investments.', 'error'); }
    });
  }

  setProduct(type: 'FD' | 'RD'): void {
    this.productType = type;
    this.termMonths = type === 'FD' ? 12 : 12;
    this.amount = null;
  }

  get terms(): number[] { return this.productType === 'FD' ? this.fdTerms : this.rdTerms; }
  get calculatorTerms(): number[] { return this.calculatorType === 'FD' ? this.fdTerms : this.rdTerms; }

  get annualRate(): number {
    if (this.productType === 'FD') return ({ 3: 4, 6: 4.5, 12: 5.5, 24: 6 } as Record<number, number>)[this.termMonths] || 0;
    return ({ 6: 4.5, 12: 5.5, 24: 6 } as Record<number, number>)[this.termMonths] || 0;
  }

  get estimatedMaturity(): number {
    if (!this.amount || this.amount <= 0) return 0;
    const monthlyRate = this.annualRate / 1200;
    return this.productType === 'FD'
      ? this.amount * Math.pow(1 + monthlyRate, this.termMonths)
      : this.amount * ((Math.pow(1 + monthlyRate, this.termMonths) - 1) / monthlyRate);
  }

  get calculatorRate(): number {
    if (this.calculatorType === 'FD') return ({ 3: 4, 6: 4.5, 12: 5.5, 24: 6 } as Record<number, number>)[this.calculatorTermMonths] || 0;
    return ({ 6: 4.5, 12: 5.5, 24: 6 } as Record<number, number>)[this.calculatorTermMonths] || 0;
  }

  get calculatorMaturity(): number {
    if (!this.calculatorAmount || this.calculatorAmount <= 0) return 0;
    const monthlyRate = this.calculatorRate / 1200;
    return this.calculatorType === 'FD'
      ? this.calculatorAmount * Math.pow(1 + monthlyRate, this.calculatorTermMonths)
      : this.calculatorAmount * ((Math.pow(1 + monthlyRate, this.calculatorTermMonths) - 1) / monthlyRate);
  }

  setCalculatorProduct(type: 'FD' | 'RD'): void {
    this.calculatorType = type;
    this.calculatorTermMonths = 12;
    this.calculatorAmount = null;
  }

  openInvestment(): void {
    if (!this.amount || this.amount <= 0) return;
    this.acceptedTerms = false;
    this.acknowledgedSimulation = false;
    this.investmentPassword = '';
    this.showConfirmation = true;
  }

  confirmInvestment(): void {
    if (!this.acceptedTerms || !this.acknowledgedSimulation || !this.amount || !this.investmentPassword) return;
    this.saving = true;
    this.investmentsApi.create(this.productType, this.amount, this.termMonths,
      this.acceptedTerms, this.acknowledgedSimulation, this.investmentPassword).subscribe({
      next: () => {
        this.saving = false;
        this.showConfirmation = false;
        this.amount = null;
        this.investmentPassword = '';
        this.alerts.show(`${this.productType} opened. Your deposit is now set aside from your available balance.`, 'success');
        this.load();
      },
      error: error => {
        this.saving = false;
        this.investmentPassword = '';
        this.alerts.show(error.error?.message || error.error?.detail || 'Could not open this investment.', 'error');
      }
    });
  }

  closeConfirmation(): void {
    if (this.saving) return;
    this.showConfirmation = false;
    this.investmentPassword = '';
  }

  canPay(investment: Investment): boolean {
    if (investment.productType !== 'RD' || investment.status !== 'ACTIVE' || investment.paidInstallments >= investment.termMonths) return false;
    const dueMonth = new Date(investment.startDate);
    dueMonth.setMonth(dueMonth.getMonth() + investment.paidInstallments - 1);
    const today = new Date();
    return today.getFullYear() * 12 + today.getMonth() > dueMonth.getFullYear() * 12 + dueMonth.getMonth();
  }

  canMature(investment: Investment): boolean {
    return investment.status === 'ACTIVE' && new Date(`${investment.maturityDate}T00:00:00`) <= new Date();
  }

  beginSecureAction(investment: Investment, action: 'INSTALLMENT' | 'MATURE'): void {
    this.pendingInvestment = investment;
    this.pendingAction = action;
    this.actionPassword = '';
    this.showActionConfirmation = true;
  }

  confirmSecureAction(): void {
    if (!this.pendingInvestment || !this.pendingAction || !this.actionPassword) return;
    const investment = this.pendingInvestment;
    const action = this.pendingAction;
    this.saving = true;
    const request = action === 'INSTALLMENT'
      ? this.investmentsApi.payInstallment(investment.id, this.actionPassword)
      : this.investmentsApi.mature(investment.id, this.actionPassword);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeActionConfirmation();
        this.alerts.show(action === 'INSTALLMENT' ? 'Monthly installment paid.' : 'Investment matured and the proceeds were returned to your available balance.', 'success');
        this.load();
      },
      error: error => {
        this.saving = false;
        this.actionPassword = '';
        this.alerts.show(error.error?.message || error.error?.detail || 'Could not process this request.', 'error');
      }
    });
  }

  closeActionConfirmation(): void {
    if (this.saving) return;
    this.showActionConfirmation = false;
    this.actionPassword = '';
    this.pendingAction = null;
    this.pendingInvestment = null;
  }

  progress(investment: Investment): number {
    return investment.productType === 'FD' ? 100 : Math.min(100, investment.paidInstallments / investment.termMonths * 100);
  }

  currentValue(investment: Investment): number {
    if (investment.currentValue !== null && investment.currentValue !== undefined) {
      return Number(investment.currentValue);
    }
    const rate = Number(investment.annualRate) / 1200;
    const today = new Date();
    const maturity = new Date(`${investment.maturityDate}T00:00:00`);
    const asOfDate = today > maturity ? maturity : today;
    const start = new Date(`${investment.startDate}T00:00:00`);
    if (investment.productType === 'FD') {
      let elapsed = (asOfDate.getFullYear() - start.getFullYear()) * 12 + asOfDate.getMonth() - start.getMonth();
      if (asOfDate.getDate() < start.getDate()) elapsed--;
      elapsed = Math.max(0, Math.min(investment.termMonths, elapsed));
      return Math.round((investment.amount * Math.pow(1 + rate, elapsed) + Number.EPSILON) * 100) / 100;
    }
    let value = 0;
    for (let index = 0; index < investment.paidInstallments; index++) {
      const depositDate = new Date(start);
      depositDate.setMonth(depositDate.getMonth() + index);
      let elapsed = (asOfDate.getFullYear() - depositDate.getFullYear()) * 12 + asOfDate.getMonth() - depositDate.getMonth();
      if (asOfDate.getDate() < depositDate.getDate()) elapsed--;
      value += investment.amount * Math.pow(1 + rate, Math.max(0, elapsed));
    }
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  downloadStatement(): void {
    const rows = this.investments.map(investment => [
      investment.productType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit',
      investment.productType === 'FD' ? 'One-time' : `${investment.paidInstallments}/${investment.termMonths}`,
      String(investment.amount),
      String(this.currentValue(investment)),
      String(investment.estimatedMaturityValue),
      `${Number(investment.annualRate).toFixed(2)}%`,
      investment.maturityDate,
      investment.status
    ]);
    this.pdfStatement.download('Investment Statement',
      ['Product', 'Payments', 'Deposit (INR)', 'Current value', 'Est. maturity', 'Rate p.a.', 'Maturity date', 'Status'],
      rows, 'neobank-investment-statement.pdf', {
        subtitle: 'DEPOSIT PORTFOLIO STATEMENT',
        itemLabel: 'Deposits',
        accountHolder: this.accountHolderName || this.authService.getUserEmail()
      });
  }
}
