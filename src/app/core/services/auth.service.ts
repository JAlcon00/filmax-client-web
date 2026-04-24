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

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  message?: string;
}

const AUTH_TOKEN_KEY = 'filmax_auth_token';

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

  saveTokenFromLogin(response: LoginResponse): string {
    const token = this.extractToken(response);

    if (!token) {
      return '';
    }

    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    return token;
  }

  getToken(): string {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) ?? '';
  }

  clearToken(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken().length > 0;
  }

  private extractToken(response: LoginResponse): string {
    return response.token ?? response.accessToken ?? response.jwt ?? '';
  }
}