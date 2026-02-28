import { Categories } from "./category.model";

export interface Transaction {
  id: number;
  date: string; 
  store: string;
  description?: string;
  category: number;
  amount: number; 
  Categories: Categories;
}


export interface MonthlySummary {
  month: string;   
  income: number;     
  total: number;
  needs: number;
  wants: number;
  investments: number;
}
