import { Component, OnInit } from '@angular/core';
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
  displayedColumns = ['account', 'amount', 'is_paid'];
  dataSource = new MatTableDataSource<MonthlyPayment>();
  totalPayments = 0;
  totalPaid = 0;
  totalUnpaid = 0;
  hideZeroPayments = true;
  showOnlyUnpaid = false;
  filteredPayments: MonthlyPayment[] = [];  

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
          month: this.formatMonth(new Date()),
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
        this.payments = data;
        this.filteredPayments = [... this.payments];

        this.totalPayments = data.reduce((sum, p) => sum + p.amount, 0);

        this.totalPaid = data
          .filter(p => p.is_paid) 
          .reduce((sum, p) => sum + p.amount, 0);

        this.totalUnpaid = data
          .filter(p => !p.is_paid)
          .reduce((sum, p) => sum + p.amount, 0);
          
        this.payments.sort((a, b) => {
          const dateA = Number(a.Accounts?.duedate);
          const dateB = Number(b.Accounts?.duedate);
          return dateA - dateB;
        });
        
        this.applyFilters();
      });
  }  

  goToPreviousMonthPayments() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2); // subtract 1 month (JS months are 0-based)
    this.currentMonth = this.formatMonth(date);

    this.form.get('month')?.setValue(this.currentMonth);
    this.loadPayments();
  }

  goToNextMonthPayments() {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month); // add 1 month
    this.currentMonth = this.formatMonth(date);

    this.form.get('month')?.setValue(this.currentMonth);
    this.loadPayments()
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

  async togglePaid(payment: any) {
    await this.service.togglePaid(payment);
    this.applyFilters();
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
    this.filteredPayments = this.payments.filter(p => {
      let include = true;

      if (this.hideZeroPayments) {
        include = include && p.amount !== 0;
      }

      if (this.showOnlyUnpaid) {
        include = include && !p.is_paid;
      }

      return include;
    });
  }  
}