import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-send-money',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-money.component.html'
})
export class SendMoneyComponent implements OnInit {

  toAccountId!: number;
  amount!: number;

  balance: number = 0;
  message: string = '';
  error: string = '';

  constructor(
    private transactionService: TransactionService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadMyAccount();
  }

  // 🔹 Load logged-in user's account & balance
  loadMyAccount() {
    this.http.get<any>('http://localhost:8080/api/accounts/my')
      .subscribe({
        next: acc => {
          this.balance = acc.balance;
        },
        error: () => {
          this.error = 'Failed to load account';
        }
      });
  }

  // 🔹 Send money (JWT decides sender)
  sendMoney() {
    const payload = {
      toAccountId: this.toAccountId,
      amount: this.amount
    };

    this.transactionService.transferMoney({
  toAccountId: this.toAccountId,
  amount: this.amount
}).subscribe({
  next: () => {
    this.message = '✅ Transfer successful';
    this.loadMyAccount(); // refresh balance
  },
  error: err => {
    this.error = err.error?.message || 'Transfer failed';
  }
});

  }
}
