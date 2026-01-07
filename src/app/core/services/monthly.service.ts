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
  async getPayments(month? : string) {
    const { data, error } = await supabase
      .from(this.table)
      .select(`
        id,
        account_id,
        account_id (
          id,
          name,
          duedate,
          isactive,
          type,
          AccountTypes:type (
            id,
            type
          )
        ),
        month,
        amount,
        is_paid  
      `)
      .eq('month', month);
      //.order('account_id.duedate', { ascending: true });

    if (error) throw error;

    const normalized = data.map(t => ({
        ...t,
        Accounts: Array.isArray(t.account_id)
            ? t.account_id[0]   // take the first element
            : t.account_id
    }));

    console.log('Mounth: ', month);
    console.log('Payments: ', data);
    return normalized as MonthlyPayment[];
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

  async togglePaid(payment: any) {
    console.log('Payment: ', payment);
    console.log.apply('Paid: ', payment.is_paid);
    const { error } = await supabase
      .from('monthly_payments')
      .update({ is_paid: !payment.is_paid })
      .eq('id', payment.id);

    if (!error) {
      payment.is_paid = !payment.is_paid;
      console.log('Error toglle: ', error);
    }
  }  
}