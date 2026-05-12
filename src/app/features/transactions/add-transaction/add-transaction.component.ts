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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { Categories } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    MatIconModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    NgFor,
    NgIf
  ],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss']
})
export class AddTransactionComponent implements OnInit {

  form!: FormGroup;
  categories: Categories[] = [];


  constructor(
    private fb: FormBuilder,
    private txService: TransactionService,
    private categoryService: CategoryService,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      store: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      amount: ['', Validators.required],
      isSubscription: [false],
      months: []
    });

    // Load categories from Supabase
    this.categories = await this.categoryService.getCategories();
    console.log('Categories:' , this.categories.length);

    this.form.get('isSubscription')?.valueChanges.subscribe(isSub => {
      const monthsControl = this.form.get('months');

      if (isSub) {
        monthsControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        monthsControl?.clearValidators();
        monthsControl?.setValue(null);
      }

      monthsControl?.updateValueAndValidity();
    });
  }

  async submit() {
    if (this.form.invalid) return;

    const value = this.form.value;

    console.log('Form Sub:', value.isSubscription)

    const tx = {
      date: this.formatDateOnly(value.date),
      store: value.store!,
      description: value.description || '',
      category: value.category.id!,
      amount: Number(value.amount),
      isSubscription: Boolean(value.isSubscription),
      months: Number(value.months)
    };
    console.log(':date:', tx.date, ':store:', tx.store, ':description:', tx.description, ':cat:' , tx.category, ':Amt:', tx.amount)

    console.log('TX Sub:', tx.isSubscription)
    try {
      await this.txService.addTransaction(tx).then(() => {
        this.router.navigate(['/transactions']);
      });
    }
    catch (err) {
      console.error('Insert failed:', err);
      alert('Insert failed:'+ err);
    }
  }

  formatDateOnly(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }  
  goBack(): void {
    this.location.back();
  }
}
