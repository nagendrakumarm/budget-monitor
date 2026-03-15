import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonthlyPaymentsService } from '../../core/services/monthly.service';
import { MonthlyPayment, PaymentAccount } from '../../core/models/payment.models';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { filter } from 'rxjs';

interface PivotRow {
  account: string;
  isPaid?: boolean;
  paymentRecord?: MonthlyPayment;
  [key: string]: string | number | boolean | MonthlyPayment | undefined; // months like "2026-03" map to numbers
}

@Component({
  selector: 'app-monthly-payments',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatIconModule,
    NgFor
  ],
  templateUrl: './monthly-payments.component.html',
  styleUrls: ['./monthly-payments.component.scss']
})
export class MonthlyPaymentsComponent implements OnInit {
  payments: MonthlyPayment[] = [];
  accounts: PaymentAccount[] = [];
  form!: FormGroup;
  editing: MonthlyPayment | null = null;
  currentMonth!: string;
 
  displayedColumns: string[] = [];
  totalsRow: any = {};
  pivotPayments: PivotRow[] = [];
  dataSource!: MatTableDataSource<PivotRow>;

  @ViewChild(MatSort) sort!: MatSort;

  totalPayments = 0;
  totalPaid = 0;
  totalUnpaid = 0;
  hideZeroPayments = true;
  showOnlyUnpaid = false;
  filteredPayments: MonthlyPayment[] = [];  
  paymentsData: MonthlyPayment[] = [];
  
  constructor(
    private fb: FormBuilder,
    private service: MonthlyPaymentsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.currentMonth = this.formatMonth(new Date());

    this.form = this.fb.group({
      accountId: [null],
      duedate: [{ value: null, disabled: true }],
      month: [{ value: this.currentMonth, disabled: true }],
      amount: [0, Validators.required]
    });
    this.loadPayments();
    this.accounts = await this.service.getAccounts();
  }

  async ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async submit() {
    console.log(this.form.invalid);
    console.log("submit");
  }
  
  async addPayment() {

    const value = this.form.getRawValue();
    console.log(value);
    const tx = {
      account_id: value.accountId,
      amount: value.amount,
      month: value.month,
      is_paid: false
    };
    console.log(tx.month);
    this.service.addPayment(tx).then(() => {
        this.snackBar.open('Payment saved successfully', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.loadPayments();
        this.form.reset({
          accountname: null,
          amount: null,
          month: tx.month,
          is_paid: false
        });
      })
      .catch (error => {
        this.snackBar.open('Error saving payment', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
      });
      console.error('Insert error:', error);
    });
  }

  loadPayments() {
    this.service.getPayments(this.currentMonth)
      .then(data => {
        const all = [...data.current, ...data.previous];

        //this.buildThisMonthTotals(data.current);
        this.pivotPayments = this.buildPivot(all);
        this.dataSource = new MatTableDataSource<PivotRow>(this.pivotPayments);
        this.buildThisMonthTotals();
        this.totalsRow = this.buildTotalsRow(this.pivotPayments, this.displayedColumns);
        this.applyFilters();

    });
  }  

  buildThisMonthTotals() {
    const data = this.dataSource.data;
    console.log("ROW:", data);
    
    this.totalPayments = data.reduce(
        (sum, p) => sum + Number(this.getCellValue(p, this.currentMonth) || 0),
        0
      );
    console.log("total: ", this.totalPayments);

    this.totalPaid = data
      .filter(p => p.isPaid)
      .reduce(
        (sum, p) => sum + Number(this.getCellValue(p, this.currentMonth) || 0),
        0
      );

    this.totalUnpaid = data
      .filter(p => !p.isPaid)
      .reduce(
        (sum, p) => sum + Number(this.getCellValue(p, this.currentMonth) || 0),
        0
      );
  }

  buildPivot(payments: MonthlyPayment[]): PivotRow[] {
    const pivot: Record<string, PivotRow> = {};
    const months = new Set<string>();

    for (const p of payments) {
      const accName = p.Accounts?.name ?? 'Unknown';

      if (!pivot[accName]) {
        pivot[accName] = { account: accName };
      }

      pivot[accName][p.month] = p.amount;
      months.add(p.month);

      // Add isPaid for the CURRENT month only
      if (p.month === this.currentMonth) {
        console.log("RosData: ", p.Accounts?.duedate);
        pivot[accName]['isPaid'] = p.is_paid || p.amount == 0;
        pivot[accName]['dueDate'] = p.Accounts?.duedate;
        pivot[accName]['paymentRecord'] = p;
      }
            
    }

    const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));
    this.displayedColumns = ['account', ...sortedMonths];

    return Object.values(pivot);
  }

  buildTotalsRow(pivot: PivotRow[], displayedColumns: string[]) {
    const totals: any = { account: 'TOTAL' };

    for (const col of displayedColumns) {
      if (col === 'account' || col === 'isPaid') continue;

      totals[col] = pivot.reduce((sum, row) => {
        const val = row[col];
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
    }

    return totals;
  }

  edit(payment: MonthlyPayment) {
    this.editing = { ...payment };
  }

  async saveEdit() {
    if (!this.editing?.id) return;

    const updated = await this.service.updatePayment(this.editing.id, this.editing);

    const index = this.payments.findIndex(p => p.id === updated.id);
    this.payments[index] = updated;

    this.editing = null;
  }

  async togglePaid(row: PivotRow) {
    // Build the payment object your backend expects
    const payment = row['paymentRecord']!;
    console.log('Toggle: ', payment);
    await this.service.togglePaid(payment);
    row.isPaid = !row.isPaid;
    this.applyFilters();
    this.buildThisMonthTotals();
  }  

  async delete(id: number) {
    await this.service.deletePayment(id);
    this.payments = this.payments.filter(p => p.id !== id);
  }

  onAccountChange(accountId: number) {
    const selected = this.accounts.find(a => a.id === accountId);

    if (selected) {
      this.form.patchValue({
        duedate: selected.duedate
      });
    }
  }  

  formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  goToPreviousMonth() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2); // subtract 1 month (JS months are 0-based)
    this.form.patchValue({
      month: this.formatMonth(date)
    });    
  }

  goToNextMonth() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month); // add 1 month
    this.form.patchValue({
      month: this.formatMonth(date)
    });    
  }

  applyFilters() {
    let filtered = this.pivotPayments;
    if (this.hideZeroPayments) {
      filtered = filtered.filter(row => {
        const amount = row[this.currentMonth];
        return amount !== 0 && amount !== null && amount !== undefined;
      });  
    }

    if (this.showOnlyUnpaid) {
      filtered = filtered.filter(row => {
        return !row.isPaid;
      });  
    }
    this.dataSource = new MatTableDataSource<PivotRow>(filtered);
  }


  groupByMonth(payments: MonthlyPayment[]) {
    return payments.reduce((acc, p) => {
      if (!acc[p.month]) acc[p.month] = [];
      acc[p.month].push(p);
      return acc;
    }, {} as Record<string, MonthlyPayment[]>);
  }

  sortMonths = (a: any, b: any) => {
    return a.key < b.key ? 1 : -1;
  };

  getCellValue(row: any, col: string): number | null {
    const value = row[col];
    return typeof value === 'number' ? value : null;
  }

}