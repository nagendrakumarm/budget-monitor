import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GiftCardService } from '../../../core/services/gift-card.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { GiftCard } from '../../../core/models/gift-card.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-gift-card-usage',
  standalone: true,
  imports: [
    CommonModule, 
    MatFormFieldModule,
    MatInputModule,
    MatDialogContent,
    ReactiveFormsModule
  ],
  templateUrl: './add-gift-card-usage.component.html'
})
export class AddGiftCardUsageComponent {
  @Input({ required: true }) cardId!: number;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddGiftCardUsageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GiftCard,
    private giftCardService: GiftCardService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.nonNullable.group({
      used_amount: [0, [Validators.required, Validators.min(0.01)]],
      location: [''],
      note: ['']
    });
  }

  async addGCUsage() {
    
    if (this.form.invalid) return;

    const usage = {
      gift_card_id: this.data.id,
      used_amount: this.form.value.used_amount,
      location: this.form.value.location,
      note: this.form.value.note
    };

    console.log("Adding usage:", usage);

    try {
        await this.giftCardService.addUsage(usage);
        this.snack.open('Gift Card Usage added successfully', 'OK', { duration: 2000 });
        this.dialogRef.close(true);
    } catch(err) {
         this.snack.open('Gift Card Usage adding Failed', 'OK', { duration: 2000 });
    }
  }

}