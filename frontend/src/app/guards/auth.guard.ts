import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  // Verificar si hay token y si está logueado
  if (token && authService.isLoggedIn()) {
    return true;
  } else {
    // Redirigir a login si no está autenticado
    router.navigate(['/auth']);
    return false;
  }
};
