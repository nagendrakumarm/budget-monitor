import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { RawTransactionFromExcel } from '../models/raw-transaction.model';

@Injectable({ providedIn: 'root' })
export class ExcelImportService {

  parseExcel(file: File): Promise<RawTransactionFromExcel[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const json: any[] = XLSX.utils.sheet_to_json(sheet);

            const transactions: RawTransactionFromExcel[] = json.map(row => ({
                date: typeof row['Date'] === 'number'
                    ? excelDateToISO(row['Date'])
                    : row['Date'],

                store: row['Store'],
                description: row['Description'] ?? '',
                subtype: row['Subtype'],
                amount: Number(row['Amount']),
            }));
          resolve(transactions);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = err => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
  
}

function excelDateToISO(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30); // Excel's zero date
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}