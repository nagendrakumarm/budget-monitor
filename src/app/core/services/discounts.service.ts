import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Discount } from '../models/discount.model';

@Injectable({ providedIn: 'root' })
export class DiscountsService {

  // ✅ Get all discounts from Supabase
  async getDiscounts(): Promise<Discount[]> {
    const { data, error } = await supabase
      .from('Discounts')
      .select(`
        id,
        account_id,
        merchant,
        description,
        expiry_date,
        is_active,
        created_at,
        Accounts ( id, name )
      `)
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    console.log('Fetched discounts:', data);
    const today = new Date();
    const discounts: Discount[] = data.map((d: any) => ({
      id: d.id,
      account_id: d.account_id,
      merchant: d.merchant,
      description: d.description,
      expiry_date: d.expiry_date,
      is_active: d.expiry_date < today ? false : d.is_active,
      created_at: d.created_at,
      Accounts: d.Accounts ? { id: d.Accounts.id, name: d.Accounts.name} : undefined
    }));
    console.log('updated discounts:', discounts);
    return discounts;
  }

  // ✅ Insert a new discount
  async addDiscount(discount: Discount): Promise<void> {
    const { error } = await supabase
      .from('Discounts')
      .insert([discount]);

    if (error) throw error;
  }

  // ✅ Update an existing discount
  async updateDiscount(id: string, changes: Partial<Discount>): Promise<void> {
    const { error } = await supabase
      .from('Discounts')
      .update(changes)
      .eq('id', id);

    if (error) throw error;
  }

  // ✅ Delete a discount
  async deleteDiscount(id: string): Promise<void> {
    const { error } = await supabase
      .from('Discounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ✅ Utility: check if expiring soon
  isExpiringSoon(date: string): boolean {
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 3600 * 24);
    return diff <= 7;
  }
}
