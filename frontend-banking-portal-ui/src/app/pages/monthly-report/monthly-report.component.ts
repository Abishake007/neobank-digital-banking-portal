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

  reports: any[] = []; // This is your data array
  error = '';

  totalCredit = 0;
  totalDebit = 0;
  balance = 0;
  netChange = 0; // Added this missing variable

  myAccountId!: number;

  constructor(
    private transactionService: TransactionService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadMyAccount();
  }

  loadMyAccount() {
  this.dashboardService.getMyAccount().subscribe({
    next: (acc: any) => {
      // Use the 'accessToken' logic we fixed in the interceptor
      this.myAccountId = acc.id || acc.accountId;
      this.balance = acc.balance;

      if (this.myAccountId) {
        console.log("✅ Identity Verified. Fetching transactions...");
        this.loadMonthlyReport(); // ONLY fetch once we have the ID
      }
    },
    error: () => this.error = "Identity check failed. Please re-login."
  });
}

  loadMonthlyReport() {
  this.transactionService.getMonthlyReport().subscribe({
    next: (data: any[]) => {
      console.log("📊 Raw Transaction Data:", data); // Check if this is []
      this.reports = data;
      this.calculateTotals();
    },
    error: (err) => {
      console.error("Report Fetch Error:", err);
      this.error = 'Failed to load monthly report';
    }
  });
}

 calculateTotals() {
  this.totalCredit = 0;
  this.totalDebit = 0;

  if (!this.myAccountId) return;

  this.reports.forEach((tx: any) => {
    const amount = Number(tx.amount);

    // 1. If there is NO fromAccount, it's a Top-up/Add Funds (CREDIT)
    if (!tx.fromAccount) {
      this.totalCredit += amount;
    } 
    // 2. If I am the sender, money is leaving (DEBIT)
    else if (tx.fromAccount.id == this.myAccountId) {
      this.totalDebit += amount;
    } 
    // 3. Otherwise, someone sent money to me (CREDIT)
    else {
      this.totalCredit += amount;
    }
  });

  this.netChange = this.totalCredit - this.totalDebit;
}
}