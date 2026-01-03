import { Component, OnInit, ViewChild } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    DatePipe, 
    CurrencyPipe, 
    MatTableModule,
    MatPaginator,
    MatSort
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  displayedColumns = ['date', 'store', 'description', 'category', 'amount'];
  dataSource = new MatTableDataSource<Transaction>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  transactions: Transaction[] = [];

  constructor(
    private txService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.txService.getTransactions().then(list => {
        this.transactions = list;
    });
  }

  addNew(): void {
    this.router.navigate(['/transactions/new']);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.dataSource.sort = this.sort;

    // Default sort: newest first
    this.sort.active = 'date';
    this.sort.direction = 'desc';
    this.sort.sortChange.emit();
  }

}