import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { MatTableModule, MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    DatePipe, 
    CurrencyPipe, 
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements AfterViewInit  {
  displayedColumns = ['date', 'store', 'description', 'category', 'amount'];
  dataSource = new MatTableDataSource<Transaction>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  textFilter = '';
  startDate: Date | null = null;
  endDate: Date | null = null;      
  selectedCategoryType: string = '';
  categoryTypes: string[] = ['Expense', 'Income', 'Transfer']; // or dynamic  

  transactions: Transaction[] = [];

  constructor(
    private txService: TransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const categoryType = params['categoryType']
        ? Number(params['categoryType'])
        : undefined;
      
      this.load(categoryType);
    });
  }

  load(categoryType?: number): void {
    const types = categoryType ? [categoryType] : [1, 2, 3, 5];
    this.txService.getTransactions(types).then(list => {
        this.transactions = list;
        this.dataSource.data = this.transactions;
    });
  }

  addNew(): void {
    this.router.navigate(['/transactions/new']);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.dataSource.sort = this.sort;

    // Custom sorting for nested fields + date parsing
    this.dataSource.sortingDataAccessor = (item: Transaction, property: string) => {
      switch (property) {

        case 'date':
          // Force local date parsing to avoid timezone shifts
          return new Date(item.date + 'T00:00:00').getTime();

        case 'category':
          // Sort by nested subtype
          return item.Categories?.subtype?.toLowerCase() ?? '';

        case 'amount':
          return item.amount;

        case 'store':
          return item.store?.toLowerCase() ?? '';

        case 'description':
          return item.description?.toLowerCase() ?? '';

        default:
          return (item as any)[property];
      }
    };

    this.dataSource.filterPredicate = (item: Transaction, filter: string) => {
      
      // 1. TEXT FILTER
      const matchesText =
        item.store.toLowerCase().includes(this.textFilter) ||
        item.description?.toLowerCase().includes(this.textFilter) ||
        item.Categories?.subtype?.toLowerCase().includes(this.textFilter) ||
        item.amount.toString().includes(this.textFilter);

      if (!matchesText) return false;

      // 2. DATE RANGE FILTER
      const itemDate = new Date(item.date + 'T00:00:00');

      if (this.startDate && itemDate < this.startDate) return false;
      if (this.endDate && itemDate > this.endDate) return false;

      return true;
    };    
  }

  applyTextFilter(event: any) {
    this.textFilter = event.target.value.trim().toLowerCase();
    this.dataSource.filter = Math.random().toString(); // trigger filterPredicate
  }

  applyDateFilter() {
    this.dataSource.filter = Math.random().toString(); // trigger filterPredicate
  }

  applyCategoryTypeFilter() {
    this.load();
  }  
  
  getTotalAmount(): number {
    if (!this.dataSource || !this.dataSource.filteredData) return 0;

    return this.dataSource.filteredData
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  }  

  getCurrentPageTotal(): number {
    if (!this.table) return 0;

    const renderedData = (this.table.dataSource as MatTableDataSource<any>)
      .filteredData
      .slice(
        this.paginator.pageIndex * this.paginator.pageSize,
        (this.paginator.pageIndex + 1) * this.paginator.pageSize
      );

    return renderedData.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
}