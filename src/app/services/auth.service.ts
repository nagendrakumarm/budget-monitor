import { Injectable, signal } from '@angular/core';
import { supabase } from '../core/supabase.client';
import { Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Angular signal to store session reactively
  session = signal<Session | null>(null);

  constructor() {
    this.restoreSession();
    this.listenToAuthChanges();
  }

  // Restore session on page reload
  async restoreSession() {
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session);
    return { data };
  }

  // Listen for login/logout events
  private listenToAuthChanges() {
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  // Login
  async login(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  // Logout
  async logout() {
    await supabase.auth.signOut();
    this.session.set(null);
  }

  // Helper
  isLoggedIn() {
    return this.session() !== null;
  }
}