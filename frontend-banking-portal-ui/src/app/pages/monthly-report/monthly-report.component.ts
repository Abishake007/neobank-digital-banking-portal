import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.css']
})
export class MonthlyReportComponent implements OnInit {

  reports: any[] = [];
  error = '';

  totalCredit = 0;
  totalDebit = 0;
  balance = 0;

  myAccountId!: number;

  constructor(
    private transactionService: TransactionService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadMyAccount();
  }

  // ✅ Load logged-in user's account
  loadMyAccount() {
    this.dashboardService.getMyAccount().subscribe({
      next: (acc: { id: number; balance: number }) => {
        this.myAccountId = acc.id;
        this.balance = acc.balance;
        this.loadMonthlyReport();
      },
      error: () => this.error = 'Failed to load account'
    });
  }

  loadMonthlyReport() {
    this.transactionService.getMonthlyReport().subscribe({
      next: (data: any[]) => {
        this.reports = data;
        this.calculateTotals();
      },
      error: () => this.error = 'Failed to load monthly report'
    });
  }

  // ✅ REAL BANKING LOGIC
  calculateTotals() {
    this.totalCredit = 0;
    this.totalDebit = 0;

    this.reports.forEach(tx => {
      if (tx.fromAccount?.id === this.myAccountId) {
        this.totalDebit += tx.amount;
      }

      if (tx.toAccount?.id === this.myAccountId) {
        this.totalCredit += tx.amount;
      }
    });
  }
}
