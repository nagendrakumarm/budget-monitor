export interface Accounts {
  id: number;
  name: string;
}  

export interface Discount {
  id?: number;              // Unique identifier
  account_id: number;         // Foreign key to PaymentAccount
  account?: string;     // Display name
  merchant: string;        // e.g., "Amazon", "Uber"
  description: string;     // e.g., "5% cashback on groceries"
  expiry_date: Date;      
  is_active: boolean;       // Auto false if expired
  created_at: string;
  Accounts?: Accounts; // Optional relationship to PaymentAccount
}
