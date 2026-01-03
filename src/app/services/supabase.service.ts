import { Injectable, NgZone, Inject, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private ngZone = inject(NgZone);
  private supabase: SupabaseClient;

 constructor() {
    //this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

      this.supabase = this.ngZone.runOutsideAngular(() =>
        createClient(environment.supabaseUrl, environment.supabaseKey, {
          auth: {
            persistSession: false, // Prevents hanging on local storage checks
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        })
      );
  }

  // Example: Get all items from a table named 'posts'
  async getCategories() {
    console.debug('getting categories' + this.supabase.from('Categories').select());
    const {data, error} = await this.supabase
      .from('Categories')
      .select('id, type, subtype');
    
    if (error) throw error;

    console.debug('data in service:', data?.length)
    return data;
  }

  async getTransactions() {
    console.debug('getting transacations')
    const { data, error } = await this.supabase
    .from('Transactions')
    .select(`
      id,
      amount,
      date,
      description,
      Categories (
        id,
        subtype
      )
    `);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data;
  }
}