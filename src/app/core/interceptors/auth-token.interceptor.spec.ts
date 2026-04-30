import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

describe('authTokenInterceptor - FR-06.3 envio de token', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const authServiceMock = {
    getToken: jasmine.createSpy('getToken'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceMock.getToken.calls.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega Authorization en request al backend cuando hay token', () => {
    authServiceMock.getToken.and.returnValue('token-123');

    httpClient.get(`${environment.apiBaseUrl}/movies/search?query=test`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/movies/search?query=test`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({ data: [] });
  });

  it('no agrega Authorization en /auth/login aunque exista token', () => {
    authServiceMock.getToken.and.returnValue('token-123');

    httpClient.post(`${environment.apiBaseUrl}/auth/login`, { email: 'a', password: 'b' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ token: 'new-token' });
  });

  it('no agrega Authorization cuando no hay token', () => {
    authServiceMock.getToken.and.returnValue('');

    httpClient.get(`${environment.apiBaseUrl}/movies/search?query=test`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/movies/search?query=test`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ data: [] });
  });

  it('no agrega Authorization para requests fuera del backend', () => {
    authServiceMock.getToken.and.returnValue('token-123');

    httpClient.get('https://example.com/public').subscribe();

    const req = httpMock.expectOne('https://example.com/public');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ ok: true });
  });

  it('agrega Authorization para endpoint de ratings cuando hay sesion', () => {
    authServiceMock.getToken.and.returnValue('token-123');

    httpClient.post(`${environment.apiBaseUrl}/ratings`, { movieId: 'm1', rating: 5 }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/ratings`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({ message: 'ok' });
  });
});
