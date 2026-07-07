import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MonthlyPaymentsService } from '../../core/services/monthly.service';
import { PaymentAccount } from '../../core/models/payment.models';
import { DiscountsService } from '../../core/services/discounts.service';
import { Router } from '@angular/router';
import { Discount } from '../../core/models/discount.model';


// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

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
    private discountService: DiscountsService,
    private paymentService: MonthlyPaymentsService,
    private router: Router
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

  async submit() {
    console.log('Save clicked. Value:', this.form.valid, this.form.value);
    if (this.form.valid) {
      const val = this.form.value;
      const newDiscount: Discount = {
        account_id: this.accounts.find(a => a.name === val.account)?.id || 0,
        merchant: val.merchant,
        description: val.description || '',
        expiry_date: val.expiryDate,
        created_at: new Date().toISOString(),
        is_active: true
      };

      try {
        await this.discountService.addDiscount(newDiscount).then(() => {
          alert('Discount added successfully!');
          this.router.navigate(['/discounts']);
        });
      }
      catch (err) {
        console.error('Insert Discount failed:', err);
        alert('Insert failed:'+ err);
      }

    }
  }

  onAccountChange(accountId: number) {
    const selected = this.accounts.find(a => a.id === accountId);

    if (selected) {
      this.form.patchValue({ account: selected.name });   
    }
  }  

}
