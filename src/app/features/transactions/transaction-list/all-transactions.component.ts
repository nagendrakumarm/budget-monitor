import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { MatTableModule, MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { EditTransactionDialogComponent } from '../edit-transaction/edit-transaction-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'all-transactions',
  standalone: true,
  imports: [
    CommonModule,
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
    MatIconModule,
    FormsModule
  ],
  templateUrl: './all-transactions.component.html',
  styleUrls: ['./all-transactions.component.scss']
})
export class AllTransactionsComponent implements OnInit, AfterViewInit  {
  displayedColumns = ['date', 'store', 'description', 'category', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Transaction>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  textFilter = '';
  startDate: Date | null = null;
  endDate: Date | null = null;      
  selectedTypes: number[] = [];
  categoryTypes: Category[] = [];

  transactions: Transaction[] = [];

  constructor(
    private txService: TransactionService,
    private categoryService: CategoryService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const types = params.getAll('categoryTypes')
        .map(Number)
        .filter(x => !isNaN(x));
      
      this.selectedTypes = types; 
      
      //this.search(types);
    });

    // Load categories from Supabase
    this.categoryTypes = await this.categoryService.getCategories();
    console.log('Categories:' , this.categoryTypes.length);
  }

  search() {
    const params: any = {};
    console.log('Start: ', this.startDate);
    if (this.startDate) {
      params.startDate = this.startDate.toISOString().split('T')[0];
    }

    if (this.endDate) {
      params.endDate = this.endDate.toISOString().split('T')[0];
    }

    console.log("Selected:" , this.selectedTypes);
    if (this.selectedTypes.length > 0) {
      params.categoryTypes = this.selectedTypes;
    }

    console.log("Selected:After, " , params.categoryTypes);
    //this.router.navigate(['/transactions'], { queryParams: params });

    this.txService.getTransactions([], params.startDate, params.endDate, params.categoryTypes).then(list => {
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
    this.search();
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

  editTransaction(row: Transaction) {
    const dialogRef = this.dialog.open(EditTransactionDialogComponent, {
      width: '400px',
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.search(); // refresh table
      }
    });
  }

  deleteTransaction(row: Transaction) {
    if (!confirm(`Delete transaction: ${row.description}?`)) return;

    if (!row.id) {
      alert('Nothing selected to delete');
      return;
    }

    this.txService.deleteTransaction(row.id).then(() => {
      this.search(); // reload table
    });
  }  
}