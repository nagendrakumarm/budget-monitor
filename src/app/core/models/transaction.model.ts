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


export interface MonthlySummary {
  month: string;   
  income: number;     
  total: number;
  needs: number;
  wants: number;
  investments: number;
}
