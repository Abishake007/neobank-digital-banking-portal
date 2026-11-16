import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-add-funds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-funds.component.html'
})
export class AddFundsComponent {
  topupAmount: number | null = null;
  userVpa: string = '';
  password: string = ''; // ✅ New Security Field

  constructor(private transactionService: TransactionService, private router: Router, private alerts: AlertService) {}

  onAddFunds() {
    if (!this.topupAmount || !this.userVpa || !this.password) {
      this.alerts.show('Please fill in all fields, including your password.', 'error');
      return;
    }

    // Pass the password to the backend for verification
    this.transactionService.addFundsViaUPI(this.topupAmount, this.userVpa, this.password).subscribe({
      next: (res: any) => {
        this.alerts.show(`₹${this.topupAmount} added to your NeoBank account!`, 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.alerts.show(err.error?.message || 'Security check failed: incorrect password.', 'error');
      }
    });
  }
}
