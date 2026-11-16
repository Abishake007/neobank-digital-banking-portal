import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AddFundsComponent } from './pages/add-funds/add-funds.component';
import { SendMoneyComponent } from './pages/send-money/send-money.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { MonthlyReportComponent } from './pages/monthly-report/monthly-report.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'send-money', component: SendMoneyComponent, canActivate: [authGuard] },
  { path: 'add-funds', component: AddFundsComponent, canActivate: [authGuard] },
  { path: 'monthly-report', component: MonthlyReportComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionHistoryComponent, canActivate: [authGuard] },
  { path: 'admin/users', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin', redirectTo: 'admin/users', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }
];
