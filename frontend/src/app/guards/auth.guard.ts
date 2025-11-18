import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Verificar si hay token y si NO está expirado
  if (token && authService.isLoggedIn()) {
    return true; // ✅ usuario autenticado, puede pasar
  } else {
    // ❌ No autenticado → mandar a login
    router.navigate(['/auth']);
    return false;
  }
};
