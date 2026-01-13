import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgFor
  ],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss']
})
export class AddTransactionComponent implements OnInit {

  form!: FormGroup;
  categories: Category[] = [];


  constructor(
    private fb: FormBuilder,
    private txService: TransactionService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      store: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      amount: [0, Validators.required]
    });

    // Load categories from Supabase
    this.categories = await this.categoryService.getCategories();
    console.debug('Categories:' , this.categories.length);
  }

  async submit() {
    if (this.form.invalid) return;

    const value = this.form.value;

    const tx = {
      date: (value.date as Date).toISOString().split('T')[0],
      store: value.store!,
      description: value.description || '',
      category: value.category.id!,
      amount: Number(value.amount)
    };
    console.log(':date:', tx.date, ':store:', tx.store, ':description:', tx.description, ':cat:' , tx.category, ':Amt:', tx.amount)

    try {
      await this.txService.addTransaction(tx).then(() => {
        this.router.navigate(['/transactions']);
      });
    }
    catch (err) {
      console.error('Insert failed:', err);
    }
  }
}