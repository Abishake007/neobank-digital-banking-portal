import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule], // ✅ IMPORTANT
  templateUrl: './transaction-history.component.html'
})
export class TransactionHistoryComponent implements OnInit {

  transactions: any[] = [];
  accountId = 1;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService
      .getMyTransactions(this.accountId)
      .subscribe(data => {
        this.transactions = data;
      });
  }
}
