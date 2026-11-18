import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { PdfStatementService } from '../../services/pdf-statement.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {

  transactions: any[] = [];
  accountNumber = '';
  searchTerm = '';
  fromDate = '';
  toDate = '';
  typeFilter = 'ALL';
  statusFilter = 'ALL';
  // accountId = 1; // ❌ Removed: Not needed for JWT-based requests

  constructor(private transactionService: TransactionService, private pdfStatement: PdfStatementService,
              private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.dashboardService.getMyAccountData().subscribe({
      next: account => this.accountNumber = account.accountNumber || '',
      error: err => console.error('Error fetching account details:', err)
    });
  }

  get filteredTransactions(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.transactions.filter(tx => {
      const date = tx.createdAt ? new Date(tx.createdAt) : null;
      const dateKey = date ? this.localDateKey(date) : '';
      const isIncoming = tx.toAccount?.accountNumber === this.accountNumber;
      const type = isIncoming ? 'CREDIT' : 'DEBIT';
      const searchable = [
        tx.fromAccount?.accountNumber, tx.toAccount?.accountNumber,
        tx.category, tx.status, tx.amount, type
      ].join(' ').toLowerCase();

      return (!term || searchable.includes(term))
        && (!this.fromDate || (dateKey && dateKey >= this.fromDate))
        && (!this.toDate || (dateKey && dateKey <= this.toDate))
        && (this.typeFilter === 'ALL' || this.typeFilter === type)
        && (this.statusFilter === 'ALL' || String(tx.status).toUpperCase() === this.statusFilter);
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.fromDate = '';
    this.toDate = '';
    this.typeFilter = 'ALL';
    this.statusFilter = 'ALL';
  }

  private localDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
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

  downloadStatement(): void {
    const rows = this.filteredTransactions.map(tx => [
      tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-',
      tx.fromAccount?.accountNumber || 'External',
      tx.toAccount?.accountNumber || 'External',
      String(tx.category || 'OTHERS'),
      String(tx.amount ?? ''),
      String(tx.status || '')
    ]);
    this.pdfStatement.download('Transaction Statement',
      ['Date', 'From account', 'To account', 'Category', 'Amount (INR)', 'Status'],
      rows, 'my-filtered-transaction-statement.pdf');
  }
}
