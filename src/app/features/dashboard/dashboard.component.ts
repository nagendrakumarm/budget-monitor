import { Component, OnInit } from '@angular/core';
import { Transaction } from '../../core/models/transaction.model';
import { TransactionService } from '../../core/services/transaction.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, CurrencyPipe, PercentPipe, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  totalIncome = 0;
  totalExpenses = 0;
  totalNeeds = 0;
  totalWants = 0;
  totalInvestments = 0;
  needsPct = 0;
  wantsPct = 0;
  investmentsPct = 0;
  expensePct = 0;
  netCash = 0;

  
  constructor(private txService: TransactionService) {}

  ngOnInit(): void {
    this.txService.getTransactions().then(list => {
        this.transactions = list;
        this.calculate();
    });

    console.log('Transactions:', this.transactions);
  }

  private calculate(): void {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthTx = this.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    this.totalIncome = monthTx
      .filter(t => t.Categories?.type === 4)
      .reduce((sum, t) => sum + Number(t.amount), 0);


    this.totalExpenses = monthTx
      .filter(t => t.Categories && [1, 2, 3].includes(t.Categories.type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.netCash = this.totalIncome - this.totalExpenses;

    this.totalNeeds = monthTx
      .filter(t => t.Categories?.type === 1)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.totalWants = monthTx
      .filter(t => t.Categories?.type === 2)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.totalInvestments = monthTx
      .filter(t => t.Categories?.type === 3)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.needsPct = this.totalIncome ? (this.totalNeeds / this.totalIncome) * 100 : 0;
    this.wantsPct = this.totalIncome ? (this.totalWants / this.totalIncome) * 100 : 0;
    this.investmentsPct = this.totalIncome ? (this.totalInvestments / this.totalIncome) * 100 : 0;
    this.expensePct = this.totalIncome ? (this.totalExpenses/this.totalIncome) * 100 : 0;
    }
}