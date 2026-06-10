import { Injectable, NgZone, Inject, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/environment';

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

  // Login
  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  // Logout
  async logout() {
    await this.supabase.auth.signOut();
  }

  async restoreSession() {
    return await this.supabase.auth.getSession();
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

  async getUserId() {
    /*const session = (await this.supabase.auth.getSession())?.data?.session;  
    if (session?.user) {
      return session.user.id;
    }

    const user = (await this.supabase.auth.getUser()).data.user;
    return user ? user.id : null;*/
    const localSession = await this.supabase.auth.getSession();
  
    const serverUser = await this.supabase.auth.getUser();
  
    if (localSession.data.session?.user) {
      return localSession.data.session.user.id;
    }
    return serverUser.data.user ? serverUser.data.user.id : null;
  }

  async getWeightLogs() {
    const userId = await this.getUserId();
    if (!userId) {
      console.warn('No user logged in, cannot fetch weight logs.');
      return { data: null, error: 'User not authenticated' };
    } 

    const { data, error } = await this.supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });
    return { data, error };
  }

  async addWeight(weight: number) {
    const userId = await this.getUserId();
    const today = new Intl.DateTimeFormat('en-CA').format(new Date()); // Get today's date in YYYY-MM-DD format

    return await this.supabase
      .from('weight_logs')
      .upsert({ 
      weight: weight, 
      user_id: userId,
      logged_at: today // This matches the constraint above
    }, { 
      onConflict: 'user_id, logged_at' 
    });
  }  
}