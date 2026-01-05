import { Component } from '@angular/core';
import { ExcelImportService } from '../../../core/services/excel.import.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { Transaction } from '../../../core/models/transaction.model';
import { RawTransactionFromExcel } from '../../../core/models/raw-transaction.model';

@Component({
  selector: 'app-transaction-upload',
  templateUrl: './upload.component.html',
})
export class TransactionUploadComponent {

  rawTransactions: RawTransactionFromExcel[] = [];
  finalTransactions: Transaction[] = [];

  constructor(
    private excelService: ExcelImportService,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) {}

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.rawTransactions = await this.excelService.parseExcel(file);

    // Convert subtype → categoryId
    this.finalTransactions = await Promise.all(
      this.rawTransactions.map(async (t) => {
        const categoryId = await this.categoryService.getCategoryIdBySubtype(t.subtype);

        console.log('Subtype:', t.subtype, '→ CategoryId:', categoryId);
        
        return {
          date: t.date,
          store: t.store,
          description: t.description,
          category: categoryId ?? 0,   // fallback if not found
          amount: t.amount
        } as Transaction;
      })
    );

    console.log('Final Transactions:', this.finalTransactions);
  }

  async upload() {
    try {
      const result = await this.transactionService.uploadTransactions(this.finalTransactions);
      console.log('Supabase result:', result);

      alert('Transactions uploaded successfully');
    } catch (err) {
      console.error('upload error:', err);
      alert('Failed to upload transaction');
    }
  }
}
