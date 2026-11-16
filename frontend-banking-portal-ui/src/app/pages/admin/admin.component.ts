import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  users: any[] = [];
  loading = true;
  error = '';

  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  constructor(
    private adminService: AdminService,
    public authService: AuthService,
    private alerts: AlertService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
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

  createUser() {
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
