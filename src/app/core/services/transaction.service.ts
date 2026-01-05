import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Transaction, MonthlySummary } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {

  async getTransactions(): Promise<Transaction[]> {
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
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    const normalized = data.map(t => ({
        ...t,
        Categories: Array.isArray(t.Categories)
            ? t.Categories[0]   // take the first element
            : t.Categories
    }));

    return normalized as Transaction[];
  }

  async addTransaction(tx: Transaction): Promise<void> {
    const { error } = await supabase
      .from('Transactions')
      .insert([tx]);

    if (error) {
        console.error('Transaction insert error', error);
        throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('Transactions')
      .delete()
      .eq('id', id);

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
}