import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiscountsService } from '../../core/services/discounts.service';
import { Router } from '@angular/router';
import { Discount } from '../../core/models/discount.model';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-discounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Material modules
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],  
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.css']
})
export class DiscountsComponent implements OnInit {
  displayedColumns: string[] = ['account', 'merchant', 'description', 'expiryDate', 'actions'];
  dataSource = new MatTableDataSource<Discount>([]);
  searchText = '';

  constructor(
    private router: Router,
    private discountService: DiscountsService
  ) {}

  ngOnInit() {
    this.loadDiscounts();
  }

  loadDiscounts() {
    const data = this.discountService.getDiscounts().then(discounts => {
      const today = new Date();
      const list: Discount[] = discounts || [];
      list.forEach(d => {
        //if (new Date(d.expiry_date) < today) d.is_active = false;
      });
      this.dataSource.data = list;
      console.log('Loaded discounts:', this.dataSource.data);
    });
  }

  addNew() {
    this.router.navigate(['/discounts/new']);
    console.log('Add new discount');
  }

  editDiscount(row: Discount) {
    console.log('Edit discount', row);
  }

  deleteDiscount(row: Discount) {
    this.dataSource.data = this.dataSource.data.filter(d => d.id !== row.id);
    localStorage.setItem('discounts', JSON.stringify(this.dataSource.data));
  }

  applyTextFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getActiveTotal(): number {
    return this.dataSource.data
      .filter(d => d.is_active)
      .length;
  }

  isExpiringSoon(date: Date): boolean {
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 3600 * 24);
    return diff <= 7;
  }
}