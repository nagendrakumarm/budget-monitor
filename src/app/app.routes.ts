import { Routes } from '@angular/router';
import { DashboardComponent } from '../app/features/dashboard/dashboard.component';
import { TransactionListComponent } from '../app/features/transactions/transaction-list/transaction-list.component';
import { AddTransactionComponent } from '../app/features/transactions/add-transaction/add-transaction.component';
import { TransactionUploadComponent } from './features/transactions/upload/upload.component';
import { MonthlyTableComponent } from './features/transactions/transaction-list/monthly-table.component';
import { MonthlyPaymentsComponent } from './features/payments/monthly-payments.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { AllTransactionsComponent } from './features/transactions/transaction-list/all-transactions.component';
import { GiftCardListComponent } from './features/gift-card/gift-card-list/gift-card-list.component';
import { AddGiftCardComponent } from './features/gift-card/add-gift-card/add-gift-card.component';
import { CategorySummaryComponent } from './features/transactions/category-summary/category-summary.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // --- PROTECTED ROUTES ---
  // Everything inside 'children' now requires a login session
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../app/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { path: 'transactions', component: TransactionListComponent },
      { path: 'transactions/new', component: AddTransactionComponent },
      { path: 'upload', component: TransactionUploadComponent },
      { path: 'payments', component: MonthlyPaymentsComponent },
      { path: 'monthly', component: MonthlyTableComponent },
      { path: 'alltransactions', component: AllTransactionsComponent },
      { path: 'giftcards', component: GiftCardListComponent },
      { path: 'addgiftcard', component: AddGiftCardComponent },
      { path: 'categorySummary', component: CategorySummaryComponent },
    ]
  },

  // --- WILDCARD ---
  // If the route doesn't exist, send them to dashboard 
  // (the guard will then catch them if they aren't logged in)
  { path: '**', redirectTo: 'dashboard' }
];