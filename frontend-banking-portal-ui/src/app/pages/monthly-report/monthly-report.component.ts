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

  // ✅ NEW
  balance = 0;

  constructor(
    private transactionService: TransactionService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadMonthlyReport();
    this.loadBalance();   // ✅ NEW
  }

  loadMonthlyReport() {
    this.transactionService.getMonthlyReport().subscribe({
      next: data => {
        this.reports = data;
        this.calculateTotals();
      },
      error: () => this.error = 'Failed to load monthly report'
    });
  }

  // ✅ NEW
  loadBalance() {
    this.dashboardService.getMyBalance().subscribe({
      next: data => this.balance = data,
      error: () => console.error('Failed to load balance')
    });
  }

  calculateTotals() {
    this.totalCredit = 0;
    this.totalDebit = 0;

    this.reports.forEach(tx => {
      if (tx.fromAccount) {
        this.totalDebit += tx.amount;
      } else {
        this.totalCredit += tx.amount;
      }
    });
  }
}
