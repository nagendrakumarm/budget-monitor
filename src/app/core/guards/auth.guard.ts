import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Wait for Supabase to restore session
  const { data } = await supabase.restoreSession();

  if (!data?.session) {
    router.navigate(['/login']);
    return false;
  }

  const id = await supabase.getUserId();

  if (!id) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
