import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogContainer, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction } from '../../../core/models/transaction.model';
import { CategoryService } from '../../../core/services/category.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-transaction-dialog',
  standalone: true,
  templateUrl: './edit-transaction-dialog.component.html',
  styleUrls: ['./edit-transaction-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggle,
    NgFor,
    NgIf
  ]
})
export class EditTransactionDialogComponent {

  form: FormGroup;
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Transaction,
    private txService: TransactionService,
    private categoryService: CategoryService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      date: [data.date, Validators.required],
      store: [data.store, Validators.required],
      description: [data.description],
      category: [data.Categories?.id, Validators.required],
      amount: [data.amount, Validators.required],
      isSubscription: [false],
      months: []
    });
  }

  async ngOnInit() {
    this.categories = await this.categoryService.getCategories();
  }

  async save() {
    if (this.form.invalid) return;

    const updated = {
      ...this.data,
      ...this.form.value,
      category_id: this.form.value.category
    };

    console.log("Updating:", updated);
    
    try {
      await this.txService.updateTransaction(updated);
      this.snack.open('Transaction updated successfully', 'OK', { duration: 2000 });
      this.dialogRef.close(true);
    } catch (err) {
      this.snack.open('Failed to update transaction', 'OK', { duration: 2000 });
    }
  }

  close() {
    this.dialogRef.close(false);
  }
}