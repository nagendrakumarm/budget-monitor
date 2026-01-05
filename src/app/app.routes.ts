import { Routes } from '@angular/router';
import { DashboardComponent } from '../app/features/dashboard/dashboard.component';
import { TransactionListComponent } from '../app/features/transactions/transaction-list/transaction-list.component';
import { AddTransactionComponent } from '../app/features/transactions/add-transaction/add-transaction.component';
import { TransactionUploadComponent } from './features/transactions/upload/upload.component';
import { MonthlyTableComponent } from './features/transactions/transaction-list/monthly-table.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/new', component: AddTransactionComponent },
  { path: 'upload', component: TransactionUploadComponent },
  { path: 'monthly', component: MonthlyTableComponent },
  { path: '**', redirectTo: 'dashboard' }
];