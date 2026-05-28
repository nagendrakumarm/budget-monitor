import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../../core/services/transaction.service';
import { MonthlySummary } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-monthly-table',
  imports: [CommonModule],
  templateUrl: './monthly-table.component.html',
  styleUrls: ['./monthly-table.component.scss']
})
export class MonthlyTableComponent implements OnInit {
  summaries: MonthlySummary[] = [];
  grandTotals: any;

  constructor(
    private trasactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.summaries = await this.trasactionService.getMonthlySummary();
    this.calculateGrandTotals();
    this.cdr.detectChanges();  
  }

  calculateGrandTotals() {
    const totals = {
      month: 'TOTAL',
      income: 0,
      total: 0,
      needs: 0,
      wants: 0,
      investments: 0
    };

    for (const row of this.summaries) {
      totals.income += row.income || 0;
      totals.total += row.total || 0;
      totals.needs += row.needs || 0;
      totals.wants += row.wants || 0;
      totals.investments += row.investments || 0;
    }

    this.grandTotals = totals;
  }

}