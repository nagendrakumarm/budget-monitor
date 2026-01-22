export interface MonthlyPayment {
  id?: number;
  month: string;
  amount: number;
  previous_amount?: number;
  Accounts?: PaymentAccount;
  is_paid: boolean;
}

export interface PaymentAccount {
  id: number;
  name: string;
  duedate: number;
  isactive: boolean;
  type: number;
  AccountTypes?: AccountType[];
}

export interface AccountType {
  id: number;
  type: string;
}  
