import { Routes } from '@angular/router';
import { DashboardComponent } from '../app/features/dashboard/dashboard.component';
import { TransactionListComponent } from '../app/features/transactions/transaction-list/transaction-list.component';
import { AddTransactionComponent } from '../app/features/transactions/add-transaction/add-transaction.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/new', component: AddTransactionComponent },
  { path: '**', redirectTo: 'dashboard' }
];