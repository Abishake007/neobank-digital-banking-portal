import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html'
})
export class TransactionHistoryComponent implements OnInit {

  transactions: any[] = [];
  // accountId = 1; // ❌ Removed: Not needed for JWT-based requests

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    // ✅ Updated: Calling without arguments to match the Service signature
    this.transactionService.getMyTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
      },
      error: (err) => {
        console.error('Error fetching transaction history:', err);
      }
    });
  }
}