import { Injectable } from '@angular/core';
import { MonthlyPayment, PaymentAccount } from '../models/payment.models';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPaymentsService {
  private table = 'monthly_payments';

  // CREATE
  async addPayment(payment: MonthlyPayment) {
    const { data, error } = await supabase
      .from(this.table)
      .upsert(payment, {
        onConflict: 'account_id,month'
      })
      .select();

    if (error) throw error;
    return data;
  }

  // READ ALL
  async getPayments(month: string): Promise<{
    current: MonthlyPayment[],
    previous: MonthlyPayment[]
  }> {
    // 1. Fetch all accounts
    const { data: accounts, error: accError } = await supabase
      .from('Accounts')
      .select(`
        id,
        name,
        duedate,
        isactive,
        type,
        AccountTypes:type (
          id,
          type
        )
      `)
      .order('duedate');

    if (accError) throw accError;

    // 2. Fetch ALL previous months payments
    const { data: previousPayments, error: prevError } = await supabase
      .from(this.table)
      .select('*')
      .lt('month', month); // <--- ALL months before the given month

    if (prevError) throw prevError;

    // 3. Fetch current month payments
    const { data: currentPayments, error: currError } = await supabase
      .from(this.table)
      .select('*')
      .eq('month', month);

    if (currError) throw currError;

    // 4. Build current month payments (one per account)
    const current: MonthlyPayment[] = accounts.map(acc => {
      const payment = currentPayments.find(p => p.account_id === acc.id);

      return {
        id: payment?.id ?? null,
        month,
        amount: payment?.amount ?? 0,
        Accounts: acc,
        is_paid: payment?.is_paid ?? false
      };
    });

    // 5. Build ALL previous months payments (each month separate)
    const previous = previousPayments.map(p => {
      const acc = accounts.find(a => a.id === p.account_id);

      return {
        id: p.id,
        month: p.month,
        amount: p.amount,
        Accounts: acc,
        is_paid: p.is_paid
      };
    });

    return {
      current,
      previous
    };
  }

  // READ ONE
  async getPayment(id: number) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // UPDATE
  async updatePayment(id: number, updates: Partial<MonthlyPayment>) {
    const { data, error } = await supabase
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // DELETE
  async deletePayment(id: number) {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // GET ALL ACCOUNTS
  async getAccounts(): Promise<PaymentAccount[]> {
    const { data, error } = await supabase
      .from('Accounts')
      .select(`
        id,
        name,
        duedate,
        isactive,
        type,
        type (
          id,
          type
        )        
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    console.log('Accounts length: ', data.length);
    const normalized = data.map(t => ({
        ...t,
        AccountTypes: Array.isArray(t.type)
            ? t.type[0]   // take the first element
            : t.type
    }));
    
    return normalized as PaymentAccount[];
  }

  async togglePaid(payment: MonthlyPayment) {
    console.log('Payment: ', payment.id);
    const { data, error, count } = await supabase
      .from('monthly_payments')
      .update({ is_paid: !payment.is_paid })
      .eq('id', payment.id)
      .select('*');

    console.log('ID value:', payment.id, 'Type:', typeof payment.id);

    if (error) {
      console.error('Toggle failed:', error);
      return;
    } else if (data.length === 0) {
      console.warn('No rows matched the filter. ID may be wrong or RLS blocked it.');
    } else {
      payment.is_paid = !payment.is_paid;
      console.log('Toggle success: ', data[0]);
    }
  }  
}

function getPreviousMonth(month: string): string {
  // month is expected in "YYYY-MM" format
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  // If January, roll back to December of previous year
  if (m === 1) {
    return `${year - 1}-12`;
  }

  // Otherwise just subtract one month, pad with leading zero
  const prev = m - 1;
  const prevMonth = prev.toString().padStart(2, "0");
  return `${year}-${prevMonth}`;
}