import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // --- Account Data ---
  balance = 0;
  lockedBalance = 0;
  recentTransactions: any[] = [];
  isAdmin = false;

  // --- Virtual Pockets Data ---
  pockets: any[] = []; 
  selectedPocket: any = null; 
  newGoal = { name: '', target: 0 };
  stashData = { goalId: 0, amount: 0 };

  // --- UI State ---
  topupAmount: number | null = null;
  userVpa: string = '';

  // --- Chart Configuration ---
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ 
      data: [], 
      backgroundColor: ['#dc3545', '#0d6efd', '#ffc107', '#198754', '#6f42c1'] 
    }]
  };

  public chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private transactionService: TransactionService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = this.authService.isAdmin();
    this.loadDashboardData();
  }

  /**
   * Main data loader to keep the Dashboard in sync
   */
  loadDashboardData(): void {
  // 💰 Use the new getMyAccountData we just fixed in the Service
  this.dashboardService.getMyAccountData().subscribe({
    next: (acc) => {
      // ✅ Update the UI variables with the new data from DB
      this.balance = acc.availableBalance; 
      this.lockedBalance = acc.lockedBalance; // Make sure this variable exists at the top of your class
      
      console.log("Dashboard Refreshed. New Available Balance:", this.balance);
    },
    error: (err) => console.error('Account data error', err)
  });

  // 📜 Refresh other parts
  this.dashboardService.getMyTransactions().subscribe({
    next: (data) => this.recentTransactions = data,
    error: (err) => console.error('Transaction error', err)
  });

  this.loadSpendingStats();
  this.loadPockets();
}

  /**
   * Fetch spending analytics for the doughnut chart
   */
  loadSpendingStats(): void {
    this.transactionService.getSpendingStats().subscribe({
      next: (stats: any) => {
        const labels = Object.keys(stats);
        const values = Object.values(stats);

        this.doughnutChartData = {
          labels: labels,
          datasets: [{
            data: values as number[],
            backgroundColor: ['#dc3545', '#0d6efd', '#ffc107', '#198754', '#6f42c1']
          }]
        };
      },
      error: (err) => console.error('Error loading stats', err)
    });
  }

  // =========================
  // VIRTUAL POCKETS METHODS
  // =========================

  /**
   * Fetches savings goals from the backend
   */
  loadPockets(): void {
  this.transactionService.getPockets().subscribe({
    next: (data) => {
      console.log("Pockets received from backend:", data); // ✅ Check this in your F12 Console
      this.pockets = data;
    },
    error: (err) => console.error('Error loading pockets', err)
  });
}

  /**
   * Prepares the Stash Modal with the correct pocket ID
   */
  openStashModal(pocket: any): void {
    this.selectedPocket = pocket;
    this.stashData.goalId = pocket.id;
    this.stashData.amount = 0; // Reset input field
  }

  /**
   * Sends request to create a new savings goal
   */
  createGoal() {
  console.log("Attempting to create goal with data:", this.newGoal); // ✅ DEBUG LOG

  this.transactionService.createPocket(this.newGoal.name, this.newGoal.target).subscribe({
    next: (res) => {
      console.log("Server Response:", res);
      alert("Savings Pocket Created!");
      this.newGoal = { name: '', target: 0 };
      this.loadPockets(); 
    },
    error: (err) => {
      console.error("Create Pocket Error:", err);
      alert("Error: " + (err.error?.message || "Check console for details"));
    }
  });
}


  /**
   * Sends request to "lock" money into a specific pocket
   */
 onStash() {
  if (this.stashData.amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  this.transactionService.stashMoney(this.stashData.goalId, this.stashData.amount).subscribe({
    next: () => {
      alert("Money stashed successfully!");
      
      // ✅ VERY IMPORTANT: Refresh everything
      this.loadDashboardData(); // Refreshes balance & pockets
      this.stashData.amount = 0; // Reset the input field
    },
    error: (err) => {
      alert(err.error?.message || "Insufficient funds in your available balance!");
    }
  });
}
claimPocket(id: number) {
  if (confirm("Goal reached! This will move the saved funds back to your main balance and close this pocket. Proceed?")) {
    this.transactionService.claimPocket(id).subscribe({
      next: (res) => {
        alert("Success! Funds released.");
        this.loadDashboardData(); // ✅ This refreshes the Balance and the Pockets list
      },
      error: (err) => {
        console.error(err);
        alert("Error releasing funds. Please try again.");
      }
    });
  }
}
  // =========================
  // NAVIGATION & AUTH
  // =========================

  onAddFunds(): void {
    this.router.navigate(['/add-funds']);
  }
  
  logout(): void {
    this.authService.logout();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
