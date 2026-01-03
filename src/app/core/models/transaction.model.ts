export interface Transaction {
  id?: number;
  date: string; 
  store: string;
  description?: string;
  category: number;
  amount: number; 
  Categories?: {
    id: number;
    type: number;
    subtype: string;
  };

}