import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';
import { AlertService } from '../../services/alert.service';

declare const bootstrap: any;

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
  accountNumber = '';
  monthlyIncome = 0;
  monthlySpending = 0;
  previousMonthSpending = 0;
  private allTransactions: any[] = [];
  recentTransactions: any[] = [];
  transactionsLoading = true;
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
      backgroundColor: ['#353535', '#3C6E71', '#284B63', '#D9D9D9', '#3C6E71'] 
    }]
  };

  get hasSpendingInsights(): boolean {
    const values = this.doughnutChartData.datasets[0]?.data ?? [];
    return values.some(value => Number(value) > 0);
  }

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
    private router: Router,
    private alerts: AlertService
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
      this.accountNumber = acc.accountNumber || '';
      this.calculateMonthlyTotals(this.allTransactions);
      
      console.log("Dashboard Refreshed. New Available Balance:", this.balance);
    },
    error: (err) => console.error('Account data error', err)
  });

  // 📜 Refresh other parts
  this.dashboardService.getMyTransactions().subscribe({
    next: (data) => {
      const sorted = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.recentTransactions = sorted.slice(0, 5);
      this.allTransactions = data;
      this.calculateMonthlyTotals(data);
      this.transactionsLoading = false;
    },
    error: (err) => {
      console.error('Transaction error', err);
      this.transactionsLoading = false;
    }
  });

  this.loadSpendingStats();
  this.loadPockets();
}

  private calculateMonthlyTotals(transactions: any[]): void {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    this.monthlyIncome = 0;
    this.monthlySpending = 0;
    this.previousMonthSpending = 0;

    for (const tx of transactions) {
      const createdAt = new Date(tx.createdAt);
      if (tx.status !== 'SUCCESS') continue;

      const amount = Number(tx.amount) || 0;
      const isIncoming = tx.toAccount?.accountNumber === this.accountNumber;
      const isOutgoing = tx.fromAccount?.accountNumber === this.accountNumber;
      if (createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth()) {
        if (isIncoming) this.monthlyIncome += amount;
        if (isOutgoing) this.monthlySpending += amount;
      } else if (createdAt.getFullYear() === previousMonth.getFullYear() && createdAt.getMonth() === previousMonth.getMonth() && isOutgoing) {
        this.previousMonthSpending += amount;
      }
    }
  }

  transactionDirection(tx: any): string {
    return tx.toAccount?.accountNumber === this.accountNumber ? 'Money in' : 'Money out';
  }

  transactionCounterparty(tx: any): string {
    const otherAccount = tx.fromAccount?.accountNumber === this.accountNumber
      ? tx.toAccount?.accountNumber
      : tx.fromAccount?.accountNumber;
    return otherAccount || 'External account';
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
            backgroundColor: ['#353535', '#3C6E71', '#284B63', '#D9D9D9', '#3C6E71']
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
      this.alerts.show('Savings pocket created!', 'success');
      this.closeModal('createGoalModal');
      this.newGoal = { name: '', target: 0 };
      this.loadPockets(); 
    },
    error: (err) => {
      console.error("Create Pocket Error:", err);
      this.alerts.show(err.error?.message || 'Could not create the savings pocket. Please try again.', 'error');
    }
  });
}


  /**
   * Sends request to "lock" money into a specific pocket
   */
 onStash() {
  if (this.stashData.amount <= 0) {
    this.alerts.show('Please enter a valid amount.', 'error');
    return;
  }

  this.transactionService.stashMoney(this.stashData.goalId, this.stashData.amount).subscribe({
    next: () => {
      this.alerts.show('Money stashed successfully!', 'success');
      this.closeModal('stashModal');
      
      // ✅ VERY IMPORTANT: Refresh everything
      this.loadDashboardData(); // Refreshes balance & pockets
      this.stashData.amount = 0; // Reset the input field
    },
    error: (err) => {
      console.error('Stash request failed:', err);
      const serverMessage = typeof err.error === 'string' ? err.error : err.error?.message;
      this.alerts.show(serverMessage || `The server could not complete this stash (HTTP ${err.status || 'unknown'}). Please try again.`, 'error');
    }
  });
}
claimPocket(id: number) {
  this.alerts.confirm('Goal reached! This will move the saved funds back to your main balance and close this pocket. Proceed?').then(accepted => {
    if (!accepted) return;
    this.transactionService.claimPocket(id).subscribe({
      next: (res) => {
        this.alerts.show('Funds released successfully.', 'success');
        this.loadDashboardData(); // ✅ This refreshes the Balance and the Pockets list
      },
      error: (err) => {
        console.error(err);
        this.alerts.show('Error releasing funds. Please try again.', 'error');
      }
    });
  });
}

  private closeModal(id: string): void {
    const element = document.getElementById(id);
    if (element) bootstrap.Modal.getInstance(element)?.hide();
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
