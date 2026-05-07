import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  // Backend standard (Filmax API)
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: User;
  
  // Fallback for other formats
  token?: string;
  jwt?: string;
  message?: string;
}

const AUTH_TOKEN_KEY = 'filmax_auth_token';
const AUTH_TOKEN_TYPE_KEY = 'filmax_auth_token_type';
const AUTH_EXPIRES_IN_KEY = 'filmax_auth_expires_in';
const AUTH_USER_KEY = 'filmax_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;
  // Observable auth state to allow components to react to login/logout
  private readonly _authState = new BehaviorSubject<boolean>(this.isAuthenticated());
  readonly authState$ = this._authState.asObservable();

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, payload);
  }

  /**
   * Extrae y guarda el token de la respuesta de login del backend
   * Normaliza la respuesta que contiene accessToken, tokenType, expiresIn
   * @param response - Respuesta del servidor de autenticación
   * @returns Token guardado o vacío si no se encontró
   */
  saveTokenFromLogin(response: LoginResponse): string {
    const token = this.extractToken(response);

    if (!token) {
      return '';
    }

    // Guardar token principal
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);

    // Guardar metadatos si existen (para futuro refresh/expiration handling)
    if (response.tokenType) {
      sessionStorage.setItem(AUTH_TOKEN_TYPE_KEY, response.tokenType);
    }
    if (response.expiresIn) {
      sessionStorage.setItem(AUTH_EXPIRES_IN_KEY, response.expiresIn.toString());
    }

    const user = response.user ?? this.decodeUserFromToken(token);

    if (user) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    // Notify subscribers that authentication state changed
    this._authState.next(true);

    return token;
  }

  getToken(): string {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) ?? '';
  }

  getCurrentUser(): User | null {
    const storedUser = sessionStorage.getItem(AUTH_USER_KEY);

    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        sessionStorage.removeItem(AUTH_USER_KEY);
      }
    }

    const decodedUser = this.decodeUserFromToken(this.getToken());

    if (decodedUser) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(decodedUser));
    }

    return decodedUser;
  }

  clearToken(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    sessionStorage.removeItem(AUTH_EXPIRES_IN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);

    // Notify subscribers that authentication was cleared
    this._authState.next(false);
  }

  isAuthenticated(): boolean {
    return this.getToken().length > 0;
  }

  /**
   * Extrae el token de la respuesta de login del backend
   * Prioriza accessToken (estándar JWT del backend)
   * @param response - Respuesta del servidor
   * @returns Token extraído
   */
  private extractToken(response: LoginResponse): string {
    // Preferir accessToken (formato estándar del backend Filmax)
    // Luego intentar token, jwt para retrocompatibilidad
    return response.accessToken ?? response.token ?? response.jwt ?? '';
  }

  private decodeUserFromToken(token: string): User | null {
    const [, payload] = token.split('.');

    if (!payload || typeof globalThis.atob !== 'function') {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
      const decoded = JSON.parse(globalThis.atob(paddedPayload)) as {
        sub?: string;
        id?: string;
        name?: string;
        email?: string;
      };
      const id = decoded.sub ?? decoded.id;

      if (!id && !decoded.email) {
        return null;
      }

      return {
        id,
        name: decoded.name,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  }
}
