import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

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

    return token;
  }

  getToken(): string {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) ?? '';
  }

  clearToken(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    sessionStorage.removeItem(AUTH_EXPIRES_IN_KEY);
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
}