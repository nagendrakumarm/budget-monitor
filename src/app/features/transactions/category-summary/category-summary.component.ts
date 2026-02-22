import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../core/services/transaction.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-summary',
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    MatTableModule
  ],
  templateUrl: './category-summary.component.html',
})
export class CategorySummaryComponent implements OnInit {
  categoryTotals: any[] = [];

  selectedMonth = new Date().getMonth();   
  selectedYear = new Date().getFullYear();

  years: number[] = [];
  months: string[] = [];
  monthlyTotals: Record<string, number> = {};
  monthNames: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  monthIndex: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
  };
  constructor(private txService: TransactionService) {}

  ngOnInit() {
    //this.generateYearList();
    //this.generateMonthList();
    this.loadSummary();
  }

  generateYearList() {
    const current = new Date().getFullYear();
    this.years = Array.from({ length: current - 2026 + 1 }, (_, i) => current - i);
  }

   generateMonthList() {
    const current = 1;
    //this.months = Array.from({ length: 12 }, (_, i) => current + i);
  }

  async loadTotals() {
    const totals = await this.txService.getCategoryTotals();

    this.categoryTotals = Object.entries(totals).map(([category, total]) => ({
      category,
      total
    }));

    this.categoryTotals.sort((a, b) => b.total - a.total);
  }

  async loadTotalsByMonth() {
    const totals = await this.txService.getCategoryTotalsByMonth(
        this.selectedMonth, 
        this.selectedYear
    );

    this.categoryTotals = Object.entries(totals).map(([category, total]) => ({
      category,
      total
    }));

    this.categoryTotals.sort((a, b) => b.total - a.total);
  }
  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadTotals();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadTotals();
  }

  async loadSummary() {
    const tx = await this.txService.getTransactions();

    // Normalize category name
    const normalized = tx.map(t => ({
      amount: t.amount,
      date: new Date(t.date),
      category: Array.isArray(t.Categories)
        ? t.Categories[0]?.subtype
        : t.Categories?.subtype
    }));

    // Structure:
    // { Food: [Jan, Feb, Mar, ...], Utilities: [...], ... }
    const summary: Record<string, Record<string, number>> = {};
    const monthsWithData = new Set<string>();

    normalized.forEach(t => {
      if (t.category === 'Paycheck') {
        return;
      }
     
      const iso = t.date.toISOString().slice(0, 10);
      const [yearStr, monthStr] = iso.split('-');
      const month = Number(monthStr) - 1; // 0–11
      const year = Number(yearStr);
      const label = `${year}-${this.monthNames[month]}`;
     
      monthsWithData.add(label);
      const cat = t.category ?? 'Uncategorized';

      if (!summary[cat]) {
        summary[cat] = {};
      }

      summary[cat][label] = (summary[cat][label] || 0) + t.amount;
    });

    // Convert Set → sorted array
    this.months = Array.from(monthsWithData).sort((a, b) => {
      const [yearA, monA] = a.split('-');
      const [yearB, monB] = b.split('-');

      const yA = Number(yearA);
      const yB = Number(yearB);

      if (yA !== yB) return yA - yB;

      return this.monthIndex[monA] - this.monthIndex[monB];
    });

    // Build monthly totals
    this.monthlyTotals = {};

    this.months.forEach(m => {
      this.monthlyTotals[m] = 0;
    });

    Object.values(summary).forEach(monthMap => {
      this.months.forEach(m => {
        this.monthlyTotals[m] += monthMap[m] || 0;
      });
    });
    
    // Convert to array for table
    this.categoryTotals = Object.entries(summary).map(([category, months]) => ({
      category,
      months,
      total: Object.values(months).reduce((a, b) => a + b, 0)
    }));
  }  

  getMonthlyGrandTotal(): number {
    return this.months.reduce(
      (acc, m) => acc + (this.monthlyTotals[m] || 0),
      0
    );
  }
}