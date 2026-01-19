import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GiftCard, GiftCardBalance } from '../models/gift-card.model';
import { GiftCardUsage } from '../models/gift-card-usage.model';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root'
})
export class GiftCardService {

    async addGiftCard(card: Pick<GiftCard, 'name' | 'card_number' | 'initial_amount'>) {
    const { data, error } = await supabase.from('gift_cards').insert(card).select().single();
    if (error) throw error;
    return data as GiftCard;
  }

  async addUsage(usage: Pick<GiftCardUsage, 'gift_card_id' | 'used_amount' | 'location' | 'note'>) {
    const { data, error } = await supabase.from('gift_card_usage').insert(usage).select().single();
    if (error) throw error;
    return data as GiftCardUsage;
  }

  async getGiftCardBalances() {
    const { data, error } = await supabase.rpc('get_gift_card_balances');
    if (error) throw error;
    return data as GiftCardBalance[];
  }

  async getUsageByCard(cardId: number) {
    const { data, error } = await supabase
      .from('gift_card_usage')
      .select('*')
      .eq('gift_card_id', cardId)
      .order('used_at', { ascending: false });

    if (error) throw error;
    return data as GiftCardUsage[];
  }
}