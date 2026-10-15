import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Exige sesion iniciada Y rol ADMIN (claim cognito:groups). Usado en /audit. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.hasRole('ADMIN')) {
    return true;
  }
  return router.parseUrl(auth.isAuthenticated() ? '/catalog' : '/login');
};
