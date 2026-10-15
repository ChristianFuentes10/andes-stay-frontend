import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Ruta a la que Cognito redirige despues del login (redirect_uri).
 * Lee "?code=..." de la URL, intercambia el codigo por tokens y
 * manda al usuario al catalogo.
 */
@Component({
  selector: 'app-callback',
  standalone: false,
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.css',
})
export class CallbackComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly error = signal<string | null>(null);

  constructor() {
    this.route.queryParamMap.subscribe(async (params) => {
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        this.error.set(`Cognito devolvio un error: ${errorParam}`);
        return;
      }
      if (!code) {
        this.error.set('Falta el parametro "code" en la URL de retorno.');
        return;
      }

      try {
        await this.auth.handleCallback(code);
        this.router.navigateByUrl('/catalog');
      } catch (e) {
        this.error.set(e instanceof Error ? e.message : 'Error desconocido al iniciar sesion.');
      }
    });
  }
}
