import { Component, OnInit } from '@angular/core';
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

  constructor(private trasactionService: TransactionService) {}

  async ngOnInit() {
    this.summaries = await this.trasactionService.getMonthlySummary();
  }
}