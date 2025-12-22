import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  balance = 0;
  recentTransactions: any[] = [];
  isAdmin = false;

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // 🔐 Redirect if not logged in (safe guard)
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = this.authService.isAdmin();

    // 💰 Load balance
    this.dashboardService.getMyBalance().subscribe({
      next: (data) => this.balance = data,
      error: err => console.error('Balance error', err)
    });

    // 📜 Load transactions
    this.dashboardService.getMyTransactions().subscribe({
      next: (data) => this.recentTransactions = data
    });
  }

  // 🔐 Login redirect
  login() {
    this.router.navigate(['/login']);
  }

  // 🔓 Logout (WORKING & SAFE)
  logout() {
    this.authService.logout();   // clear token
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
