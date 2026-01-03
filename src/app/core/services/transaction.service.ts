import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Transaction } from '../models/transaction.model';

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
}