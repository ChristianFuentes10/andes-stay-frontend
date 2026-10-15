import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Maneja el login contra el Hosted UI de Cognito con Authorization Code + PKCE
 * (sin depender de amazon-cognito-identity-js/Amplify), y guarda los tokens
 * en localStorage. Todo lo que toca window/localStorage esta protegido con
 * isPlatformBrowser porque el proyecto tiene SSR habilitado (si no, se cae
 * al renderizar en el servidor, donde no existe "window").
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** true si hay un access token guardado y se pudo leer el ID token. */
  readonly isAuthenticated = signal(false);
  /** claim "cognito:groups" del ID token, ej: ['ADMIN'] */
  readonly roles = signal<string[]>([]);
  readonly username = signal<string | null>(null);

  constructor() {
    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('access_token') : null;
  }

  /** Redirige al Hosted UI de Cognito para iniciar sesion. */
  async login(): Promise<void> {
    if (!this.isBrowser) return;

    const codeVerifier = this.randomString(64);
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    const codeChallenge = await this.sha256Base64Url(codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: environment.cognito.clientId,
      redirect_uri: environment.cognito.redirectUri,
      scope: 'openid email profile',
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    window.location.href = `https://${environment.cognito.domain}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Se llama desde CallbackComponent con el "code" que viene en la URL
   * despues de que Cognito redirige de vuelta. Intercambia el code por
   * tokens usando el code_verifier guardado en login().
   */
  async handleCallback(code: string): Promise<void> {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) {
      throw new Error('No se encontro el code_verifier en esta sesion. Vuelve a iniciar sesion desde /login.');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: environment.cognito.clientId,
      code,
      redirect_uri: environment.cognito.redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(`https://${environment.cognito.domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Cognito rechazo el intercambio de codigo por tokens (${response.status}). ` +
        `Revisa que redirect_uri este autorizado en el App Client y que client_id sea correcto. Detalle: ${detail}`
      );
    }

    const tokens = await response.json() as {
      access_token: string;
      id_token: string;
      refresh_token?: string;
    };

    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('id_token', tokens.id_token);
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    sessionStorage.removeItem('pkce_code_verifier');

    this.hydrateFromTokens(tokens.id_token);
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticated.set(false);
    this.roles.set([]);
    this.username.set(null);

    const params = new URLSearchParams({
      client_id: environment.cognito.clientId,
      logout_uri: environment.cognito.logoutUri,
    });
    window.location.href = `https://${environment.cognito.domain}/logout?${params.toString()}`;
  }

  private loadFromStorage(): void {
    const idToken = localStorage.getItem('id_token');
    const accessToken = localStorage.getItem('access_token');
    if (idToken && accessToken) {
      this.hydrateFromTokens(idToken);
    }
  }

  private hydrateFromTokens(idToken: string): void {
    const payload = this.decodeJwt(idToken);
    if (!payload) {
      this.isAuthenticated.set(false);
      return;
    }
    this.isAuthenticated.set(true);
    this.roles.set(payload['cognito:groups'] ?? []);
    this.username.set(payload['email'] ?? payload['cognito:username'] ?? null);
  }

  private decodeJwt(token: string): Record<string, any> | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private randomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => ('0' + b.toString(16)).slice(-2)).join('').slice(0, length);
  }

  private async sha256Base64Url(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    let binary = '';
    new Uint8Array(hashBuffer).forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
