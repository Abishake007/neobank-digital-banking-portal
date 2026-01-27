import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

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
    public authService: AuthService
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
      error: err => alert(err.error || 'Failed to create user')
    });
  }

  toggleUser(user: any) {

    // ❌ Prevent admin disabling themselves
    if (user.email === this.authService.getUserEmail()) {
      alert("You cannot disable your own account");
      return;
    }

    const action = user.enabled ? 'DISABLE' : 'ENABLE';

    const confirmAction = confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmAction) return;

    this.adminService
      .updateUserStatus(user.id, !user.enabled)
      .subscribe(() => this.loadUsers());
  }
}
