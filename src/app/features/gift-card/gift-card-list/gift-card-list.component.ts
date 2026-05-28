import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftCardService } from '../../../core/services/gift-card.service';
import { GiftCard, GiftCardBalance } from '../../../core/models/gift-card.model';
import { AddGiftCardUsageComponent } from '../add-gift-card-usage/add-gift-card-usage.component';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-gift-card-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule, 
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './gift-card-list.component.html'
})
export class GiftCardListComponent implements OnInit {
  cards: GiftCardBalance[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private giftCardService: GiftCardService
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.error = null;
    await this.loadGiftCards();
    this.cdr.detectChanges();  
  }

  async loadGiftCards() {
    try {
      this.cards = await this.giftCardService.getGiftCardBalances();
      console.log("Cards:", this.cards);
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to load gift cards';
    } finally {
      this.loading = false;
    }
  }
  addNew(): void {
    this.router.navigate(['/addgiftcard']);
  }

  addGiftCardUsage(row: GiftCard) {
    const dialogRef = this.dialog.open(AddGiftCardUsageComponent, {
      width: '400px',
      data: row
    });  

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGiftCards();
      }
    });
  }
}