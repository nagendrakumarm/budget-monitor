export interface RawTransactionFromExcel {
  date: string;
  store: string;
  description?: string;
  subtype: string;   // Excel column
  amount: number;
}