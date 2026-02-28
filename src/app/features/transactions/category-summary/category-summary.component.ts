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

    console.log(JSON.stringify(tx[0], null, 2));

    // Normalize category name
    const normalized = tx.map(t => {
      const cat = Array.isArray(t.Categories)
        ? t.Categories[0]
        : t.Categories;

      const ct = Array.isArray(cat.CategoryType)
        ? cat.CategoryType[0]
        : cat.CategoryType;

      console.log(ct + ":::" + cat?.subtype + ":::" + ct?.type);
      return {
        amount: t.amount,
        date: new Date(t.date),
        type: ct?.type ?? null,       // <-- NOW WORKS
        category: cat?.subtype ?? null
      };
    });
    // Structure:
    // { Food: [Jan, Feb, Mar, ...], Utilities: [...], ... }
    const summary: Record<string, Record<string, Record<string, number>>> = {};
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
      const type = t.type ?? 'Uncategorized';

      if (!summary[type]) {
        summary[type] = {};
      }

      if (!summary[type][cat]) {
        summary[type][cat] = {};
      }

      summary[type][cat][label] = (summary[type][cat][label] || 0) + t.amount;
      //monthlyTotals[label] = (monthlyTotal[label] || 0 ) + t.amount;
    });

    /*const normalized2 = normalize(tx);*/

    //const monthlyTotals = this.calculateMonthlyTotals(summary);

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

    this.categoryTotals = [];

    Object.entries(summary).forEach(([type, cat]) => {
      // Compute total for the whole type
      const typeTotal = Object.values(cat)
        .flatMap(m => Object.values(m))
        .reduce((a, b) => a + b, 0);

      this.categoryTotals.push({
        isType: true,
        name: `Category ${type}`,
        months: this.buildMonthMapForType(cat),
        total: typeTotal
      });

      console.log(this.categoryTotals);
      // Add each subtype row
      Object.entries(cat).forEach(([subtype, months]) => {
        const subtypeTotal = Object.values(months).reduce((a, b) => a + b, 0);

        this.categoryTotals.push({
          isType: false,
          name: subtype,
          months,
          total: subtypeTotal
        });
      });
    });    
 
    Object.values(this.categoryTotals).forEach(monthMap => {
      this.months.forEach(m => {
        if(monthMap.isType) {
          for (const month of Object.keys(monthMap.months)) { 
            if (m == month) {
              this.monthlyTotals[m] = (this.monthlyTotals[m] || 0) + monthMap.months[m];
            } 
          }
        }
      });
    });
}

  getMonthlyGrandTotal(): number {
    return this.months.reduce(
      (acc, m) => acc + (this.monthlyTotals[m] || 0),
      0
    );
  }

  buildMonthMapForType(subtypes: Record<string, Record<string, number>>) {
    const map: Record<string, number> = {};
    this.months.forEach(m => (map[m] = 0));

    Object.values(subtypes).forEach(monthMap => {
      this.months.forEach(m => {
        map[m] += monthMap[m] || 0;
      });
    });

    return map;
  }  
}