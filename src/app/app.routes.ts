import { Routes } from '@angular/router';
import { DashboardComponent } from '../app/features/dashboard/dashboard.component';
import { TransactionListComponent } from '../app/features/transactions/transaction-list/transaction-list.component';
import { AddTransactionComponent } from '../app/features/transactions/add-transaction/add-transaction.component';
import { TransactionUploadComponent } from './features/transactions/upload/upload.component';
import { MonthlyTableComponent } from './features/transactions/transaction-list/monthly-table.component';
import { MonthlyPaymentsComponent } from './features/payments/monthly-payments.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../app/features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/new', component: AddTransactionComponent },
  { path: 'upload', component: TransactionUploadComponent },
  { path: 'payments', component: MonthlyPaymentsComponent },
  { path: 'monthly', component: MonthlyTableComponent },
  { path: '**', redirectTo: 'dashboard' }
];