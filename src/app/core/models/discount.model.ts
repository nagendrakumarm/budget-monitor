export interface Discount {
  id: string;
  accountId: string;       // e.g., "HDFC-Credit", "Chase-Savings"
  account: string;     // Display name
  merchant: string;        // e.g., "Amazon", "Uber"
  description: string;     // e.g., "5% cashback on groceries"
  expiryDate: Date;      
  isActive: boolean;       // Auto false if expired
  createdAt: string;
}
