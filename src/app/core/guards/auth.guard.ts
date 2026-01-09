import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../supabase.client';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for Supabase to restore session
  const { data } = await auth.restoreSession();

  if (!data?.session) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
