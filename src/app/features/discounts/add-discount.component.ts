import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MonthlyPaymentsService } from '../../core/services/monthly.service';
import { PaymentAccount } from '../../core/models/payment.models';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

export interface Discount {
  id: string;
  account: string;
  merchant: string;
  description: string;
  expiryDate: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-add-discount',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.css']
})
export class AddDiscountComponent implements OnInit {
  form: FormGroup;
  accounts: PaymentAccount[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentService: MonthlyPaymentsService
  ) {
    this.form = this.fb.group({
      account: ['', Validators.required],
      merchant: ['', Validators.required],
      description: [''],
      expiryDate: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.paymentService.getAccounts().then(acc => this.accounts = acc)
    ]);
    
  }

  save() {
    console.log('Save clicked. Value:', this.form.valid, this.form.value);
    if (this.form.valid) {
      const val = this.form.value;
      const newDiscount: Discount = {
        id: crypto.randomUUID(),
        account: val.account,
        merchant: val.merchant,
        description: val.description,
        expiryDate: val.expiryDate,
        isActive: true
      };

      const data = localStorage.getItem('discounts');
      const list: Discount[] = data ? JSON.parse(data) : [];
      list.push(newDiscount);
      localStorage.setItem('discounts', JSON.stringify(list));

      alert('Discount added successfully!');
      this.form.patchValue({ account: '', merchant: '', description: '', expiryDate: '' });
    }
  }

  onAccountChange(accountId: number) {
    const selected = this.accounts.find(a => a.id === accountId);

    if (selected) {
      this.form.patchValue({ account: selected.name });   
    }
  }  

}
