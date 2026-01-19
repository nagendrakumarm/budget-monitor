import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GiftCardService } from '../../../core/services/gift-card.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-add-gift-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-gift-card.component.html'
})
export class AddGiftCardComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private giftCardService: GiftCardService
  ) {
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      card_number: ['', Validators.required],
      card_pin: [''],
      initial_amount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  async submit() {
    if (this.form.invalid) return;

    await this.giftCardService.addGiftCard(this.form.getRawValue());
    this.form.reset({ name: '', card_number: '', card_pin: '', initial_amount: 0 });
  }
}