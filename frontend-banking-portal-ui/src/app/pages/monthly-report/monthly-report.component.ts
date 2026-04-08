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

 
 loadMonthlyReport() {
  this.transactionService.getMonthlyReport().subscribe({
    next: (data: any[]) => {
      // ✅ Sort by date (Newest First)
      this.reports = data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      this.calculateTotals();
    },
    error: (err) => {
      this.error = 'Failed to load monthly report';
    }
  });
}

ngOnInit(): void {
    this.loadMyAccount();
  }

    loadMyAccount() {
  this.dashboardService.getMyAccount().subscribe({
    next: (acc: any) => {
      // Use accountNumber since 'id' is missing from the backend response
      this.myAccountId = acc.accountNumber; 
      this.balance = acc.balance;

      console.log("Using Account Number for Math:", this.myAccountId);
      this.loadMonthlyReport(); 
    }
  });
}

    calculateTotals() {
  this.totalCredit = 0;
  this.totalDebit = 0;

  if (!this.myAccountId) return;

  this.reports.forEach((tx: any) => {
    const amount = Number(tx.amount);
    
    // ✅ FIX: Compare against the dynamic variable this.myAccountId
    if (tx.fromAccount && tx.fromAccount.accountNumber === this.myAccountId) {
      this.totalDebit += amount;
    } else {
      this.totalCredit += amount;
    }
  });

  this.netChange = this.totalCredit - this.totalDebit;
}
}