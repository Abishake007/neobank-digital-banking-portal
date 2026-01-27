import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { SendMoneyComponent } from './pages/send-money/send-money.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { MonthlyReportComponent } from './pages/monthly-report/monthly-report.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'send-money', component: SendMoneyComponent },
  { path: 'monthly-report', component: MonthlyReportComponent },
  { path: 'transactions', component: TransactionHistoryComponent },
  { path: 'admin/users', component:AdminComponent},

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard]
  },

  { path: '**', redirectTo: 'login' }
];
