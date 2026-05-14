import { catchError, throwError } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const isBackendRequest = request.url.startsWith(environment.apiBaseUrl);
  const isAuthEndpoint = request.url.includes('/auth/login') || request.url.includes('/auth/register');

  if (!token || !isBackendRequest || isAuthEndpoint) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ).pipe(
    catchError((error: unknown) => {
      const status = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status?: number }).status) : 0;

      if (status === 401 || status === 403) {
        authService.clearToken();
        router.navigateByUrl('/auth');
      }

      return throwError(() => error);
    }),
  );
};
