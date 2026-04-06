import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Router } from '@angular/router';

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

  constructor(private transactionService: TransactionService, private router: Router) {}

  onAddFunds() {
    if (!this.topupAmount || !this.userVpa || !this.password) {
      alert("Please fill in all fields, including your password.");
      return;
    }

    // Pass the password to the backend for verification
    this.transactionService.addFundsViaUPI(this.topupAmount, this.userVpa, this.password).subscribe({
      next: (res: any) => {
        alert("Success: ₹" + this.topupAmount + " added to your NeoBank account!");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error?.message || "Security Check Failed: Incorrect Password");
      }
    });
  }
}