import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { PdfStatementService } from '../../services/pdf-statement.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  users: any[] = [];
  userSearchTerm = '';
  loading = true;
  error = '';
  selectedUser: any = null;
  detailsLoading = false;
  detailsError = '';
  transactionFromDate = '';
  transactionToDate = '';

  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  constructor(
    private adminService: AdminService,
    public authService: AuthService,
    private alerts: AlertService,
    private pdfStatement: PdfStatementService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): any[] {
    const term = this.userSearchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(user =>
      [user.id, user.name, user.email, user.role, user.enabled ? 'enabled' : 'disabled']
        .some(value => String(value ?? '').toLowerCase().includes(term))
    );
  }

  get newUserPasswordMeetsRequirements(): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(this.newUser.password);
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: data => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  viewDetails(user: any) {
    this.selectedUser = null;
    this.detailsError = '';
    this.transactionFromDate = '';
    this.transactionToDate = '';
    this.detailsLoading = true;
    this.adminService.getUserDetails(user.id).subscribe({
      next: details => {
        this.selectedUser = details;
        this.detailsLoading = false;
      },
      error: () => {
        this.detailsError = 'Failed to load account and transaction details.';
        this.detailsLoading = false;
      }
    });
  }

  closeDetails() {
    this.selectedUser = null;
    this.detailsError = '';
  }

  get filteredTransactions(): any[] {
    const transactions = this.selectedUser?.transactions ?? [];
    const from = this.transactionFromDate ? new Date(`${this.transactionFromDate}T00:00:00`) : null;
    const to = this.transactionToDate ? new Date(`${this.transactionToDate}T23:59:59.999`) : null;

    return transactions.filter((transaction: any) => {
      const date = new Date(transaction.createdAt);
      return (!from || date >= from) && (!to || date <= to);
    });
  }

  clearTransactionDates() {
    this.transactionFromDate = '';
    this.transactionToDate = '';
  }

  downloadUserStatement(): void {
    if (!this.selectedUser) return;
    const user = this.selectedUser;
    const rows = this.filteredTransactions.map((transaction: any) => [
      transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '-',
      transaction.fromUserName || 'External',
      transaction.fromAccountNumber || '-',
      transaction.toUserName || 'External',
      transaction.toAccountNumber || '-',
      String(transaction.category || ''),
      String(transaction.amount ?? ''),
      String(transaction.status || '')
    ]);
    const safeName = String(user.name || `user-${user.id}`).replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '');
    this.pdfStatement.download(`Transaction Statement - ${user.name}`,
      ['Date', 'From user', 'From account', 'To user', 'To account', 'Category', 'Amount (INR)', 'Status'],
      rows, `${safeName || `user-${user.id}`}-transaction-statement.pdf`);
  }

  createUser() {
    if (!this.newUserPasswordMeetsRequirements) {
      this.alerts.show('Password must be 8–72 characters and include uppercase and lowercase letters, a number, and a special character.', 'error');
      return;
    }
    this.adminService.createUser(this.newUser).subscribe({
      next: () => {
        this.newUser = { name:'', email:'', password:'', role:'USER' };
        this.loadUsers();
      },
      error: err => this.alerts.show(err.error?.message || err.error || 'Failed to create user', 'error')
    });
  }

  toggleUser(user: any) {

    // ❌ Prevent admin disabling themselves
    if (user.email === this.authService.getUserEmail()) {
      this.alerts.show('You cannot disable your own account.', 'error');
      return;
    }

    const action = user.enabled ? 'DISABLE' : 'ENABLE';

    this.alerts.confirm(`Are you sure you want to ${action.toLowerCase()} this user?`).then(confirmed => {
      if (!confirmed) return;
      this.adminService.updateUserStatus(user.id, !user.enabled).subscribe({
        next: () => this.loadUsers(),
        error: () => this.alerts.show('Could not update this user. Please try again.', 'error')
      });
    });
  }
}
