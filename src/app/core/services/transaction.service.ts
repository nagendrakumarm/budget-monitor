import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Transaction, MonthlySummary } from '../models/transaction.model';
import { start } from 'node:repl';

@Injectable({ providedIn: 'root' })
export class TransactionService {

  async getThisMonthTransactions(categoryTypes?: number[]): Promise<Transaction[]> {
    const now = new Date();

    // First day of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    // Last day of this month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    console.log('Main: ', categoryTypes);
    return this.getTransactions(categoryTypes, startOfMonth, endOfMonth);
  }

  async getTransactions(
    categoryTypes?: number[], 
    startDate?: String, 
    endDate?: String,
    subTypes?: number[]
  ): Promise<Transaction[]> {

    let query = supabase
      .from('Transactions')
      .select(`
        id,
        amount,
        date,
        description,
        store,
        category,
        Categories!inner (
            id,
            type,
            subtype,
            Categories_Type_fkey (
              id,
              type
            )
        )
      `)
      .order('date', { ascending: false });

    if(categoryTypes && categoryTypes.length > 0) {
      query = query.in('Categories.type', categoryTypes);
    }

    if(startDate) {
      query.gte('date', startDate);
    }

    if(endDate) {
      query.lte('date', endDate);
    }

    if(subTypes && subTypes.length > 0) {
      query = query.in('Categories.id', subTypes);
    }

    console.log("In:" , query);
    const {data, error} = await query;

    if (error) throw error;

    const normalized: Transaction[] = data.map((t: any) => {
      const cat = t.Categories;
      const ctArray = cat.Categories_Type_fkey;

      const normalizedCategoryType =
        ctArray && ctArray.length > 0
          ? {
              id: Number(ctArray[0].id),
              type: String(ctArray[0].type)
            }
          : {
            id: Number(ctArray.id),
            type: String(ctArray.type)
          };

      return {
        id: Number(t.id),
        amount: Number(t.amount),
        date: t.date,
        description: t.description,
        store: t.store,
        category: Number(t.category),

        Categories: {
          id: Number(cat.id),
          type: Number(cat.type),
          subtype: String(cat.subtype),
          CategoryType: normalizedCategoryType
        }
      };
    });

    return normalized;
  }

  async addTransaction(tx: any): Promise<void> {
    try {
      // Extract UI-only fields
      const { isSubscription, months, category, amount, ...rest } = tx;

      console.log('Amount:', amount, '::month:', months);
      const trAmount = months == 0 ? amount: amount/months;
      console.log('TX:', trAmount);

      // Convert category object → category ID
      const categoryId = category?.id ?? category;

      // Base transaction object (cleaned)
      const baseTx = {
        ...rest,
        category: categoryId,
        amount: trAmount
      };

      // If NOT subscription → insert single transaction
      if (!isSubscription || !months || months <= 1) {
        const { error } = await supabase
          .from('Transactions')
          .insert([baseTx]);

        if (error) throw error;
        return;
      }

      // Subscription → generate multiple monthly transactions
      const transactions = [];
      const [y, m, d] = tx.date.split('-').map(Number);
      const newDate = new Date(y, m - 1, d); // local time
      for (let i = 0; i < months; i++) {
        transactions.push({
          ...baseTx,
          date: newDate.toLocaleDateString('en-CA').split('T')[0], // YYYY-MM-DD
        });
        newDate.setMonth(newDate.getMonth() + 1);
     }
      console.log(transactions);
      const { error } = await supabase
        .from('Transactions')
        .insert(transactions);

      if (error) throw error;

    } catch (err) {
      console.error('Insert failed:', err);
      throw err;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    const { error } = await supabase
      .from('Transactions')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
  }

  async updateTransaction(tx: any) {
    const { error } = await supabase
      .from('Transactions')
      .update({
        date: tx.date,
        store: tx.store,
        description: tx.description,
        amount: tx.amount,
        category: tx.category_id
      })
      .eq('id', tx.id);

    if (error) throw error;
  }
    
  async clearAll(): Promise<void> {
    const { error } = await supabase
      .from('Transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  }

  async uploadTransactions(transactions: Transaction[]) {
    const { data, error } = await supabase
      .from('Transactions')
      .insert(transactions);

    console.log('Insert response: ' , {data, error});
    if (error) throw error;
    return data;
  }

  async getMonthlySummary(): Promise<MonthlySummary[]> {
    const { data, error } = await supabase
      .from('Transactions')
      .select(`
        id,
        amount,
        date,
        description,
        store,
        category,
        Categories (
            id,
            type,
            subtype
        )
      `);

    if (error) throw error;

    const normalized = data.map(t => ({
        ...t,
        Categories: Array.isArray(t.Categories)
            ? t.Categories[0]   // take the first element
            : t.Categories
    }));

    return this.groupByMonth(normalized as Transaction[]);
  }

  private groupByMonth(transactions: Transaction[]): MonthlySummary[] {
    const map = new Map<string, MonthlySummary>();

    for (const t of transactions) {
      const month = t.date.slice(0, 7); // "YYYY-MM"

      if (!map.has(month)) {
        map.set(month, {
          month,
          income: 0,
          total: 0,
          needs: 0,
          wants: 0,
          investments: 0
        });
      }

      const entry = map.get(month)!;
      const type = t.Categories?.type;
      //entry.total += t.amount;

      if (typeof type === 'number' && [1, 2, 3].includes(type)) entry.total += t.amount;
      if (t.Categories?.type === 1) entry.needs += t.amount;
      if (t.Categories?.type === 2) entry.wants += t.amount;
      if (t.Categories?.type === 3) entry.investments += t.amount;
      if (t.Categories?.type === 4) entry.income += t.amount;
    }

    return Array.from(map.values());
  }  

  async getCategoryTotals() {
    const { data, error } = await supabase
      .from('Transactions')
      .select(`
        amount,
        category,
        date,
        Categories (
        id,
        subtype,
        type
      )
    `).neq('category', 26);

    if (error) throw error;

    // Normalize because Supabase returns Categories as an array
    const normalized = data.map(t => ({
      ...t,
      categoryObj: Array.isArray(t.Categories) ? t.Categories[0] : t.Categories
    }));

    // Group by category name
    const totals: Record<string, number> = {};

    normalized.forEach(t => {
      const catName = t.categoryObj?.subtype ?? 'Uncategorized';

      if (!totals[catName]) totals[catName] = 0;
      totals[catName] += t.amount;
    });

    return totals;
  }

async getCategoryTotalsByMonth(month: number, year: number) {

  console.log('Month:', month, ': Year: ', year);
  const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const end = new Date(year, month, 0).toISOString().split('T')[0];
  console.log('Start:', start, ': End: ', end);

  const { data, error } = await supabase
    .from('Transactions')
    .select(`
      amount,
        date,
        Categories (
        id,
        subtype,
        type
      )
    `)
    .neq('category', 26)
    .gte('date', start)
    .lte('date', end);

    if (error) throw error;

    // Normalize because Supabase returns Categories as an array
    const normalized = data.map(t => ({
      ...t,
      categoryObj: Array.isArray(t.Categories) ? t.Categories[0] : t.Categories
    }));

    // Group by category name
    const totals: Record<string, number> = {};

    normalized.forEach(t => {
      const catName = t.categoryObj?.subtype ?? 'Uncategorized';

      if (!totals[catName]) totals[catName] = 0;
      totals[catName] += t.amount;
    });

    return totals;
  }
}