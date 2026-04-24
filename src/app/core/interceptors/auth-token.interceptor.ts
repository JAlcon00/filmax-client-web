import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
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
  );
};