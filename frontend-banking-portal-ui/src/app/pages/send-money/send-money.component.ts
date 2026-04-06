import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api.config';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-money.component.html'
})
export class SendMoneyComponent implements OnInit {

  accountNumber: string = '';
  balance: number = 0; // This is Total Balance
  lockedBalance: number = 0; // ✅ Add this to track stashed funds

  toAccountNumber!: string;
  amount!: number;
  category: string = ''; 

  message: string = '';
  error: string = '';

  constructor(
    private transactionService: TransactionService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadMyAccount();
  }

  // ✅ Updated to capture both balances
 loadMyAccount() {
  this.http.get<any>(`${API_BASE_URL}/api/accounts/my`)
    .subscribe({
      next: acc => {
        console.log("Account Data Received:", acc); // ✅ Debug: Check if lockedBalance is here
        this.balance = acc.balance;
        this.lockedBalance = acc.lockedBalance || 0; // ✅ Ensure this is captured
        this.accountNumber = acc.accountNumber;
      },
      error: () => {
        this.error = 'Failed to load account';
      }
    });
}

  // ✅ Logic: Calculate spendable amount
  get availableBalance(): number {
    return this.balance - this.lockedBalance;
  }

  sendMoney() {
    if (!this.category) {
      this.error = 'Please select a category for this transaction';
      return;
    }

    // ✅ CRITICAL VALIDATION: Check against Available Balance, not Total
    if (this.amount > this.availableBalance) {
      this.error = `Insufficient spendable funds. ₹${this.lockedBalance} is locked in your Savings Pockets.`;
      return;
    }

    this.transactionService.transferMoney({
      toAccountNumber: this.toAccountNumber,
      amount: this.amount,
      category: this.category 
    }).subscribe({
      next: () => {
        this.message = '✅ Transfer successful';
        this.error = ''; 
        this.loadMyAccount();
        this.toAccountNumber = '';
        this.amount = 0;
        this.category = '';
      },
      error: err => {
        this.error = err.error?.message || 'Transfer failed';
        this.message = '';
      }
    });
  }
}
