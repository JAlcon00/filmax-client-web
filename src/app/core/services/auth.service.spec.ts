import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService - FR-06.3 persistencia de token', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('guarda el token cuando la respuesta trae `token`', () => {
    const response: LoginResponse = { token: 'abc123' };

    const saved = service.saveTokenFromLogin(response);

    expect(saved).toBe('abc123');
    expect(service.getToken()).toBe('abc123');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('guarda el token cuando la respuesta trae `accessToken`', () => {
    const response: LoginResponse = { accessToken: 'access-123' };

    const saved = service.saveTokenFromLogin(response);

    expect(saved).toBe('access-123');
    expect(service.getToken()).toBe('access-123');
  });

  it('guarda el token cuando la respuesta trae `jwt`', () => {
    const response: LoginResponse = { jwt: 'jwt-123' };

    const saved = service.saveTokenFromLogin(response);

    expect(saved).toBe('jwt-123');
    expect(service.getToken()).toBe('jwt-123');
  });

  it('no guarda token cuando la respuesta no trae token', () => {
    const response: LoginResponse = { message: 'ok' };

    const saved = service.saveTokenFromLogin(response);

    expect(saved).toBe('');
    expect(service.getToken()).toBe('');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('limpia token con clearToken', () => {
    service.saveTokenFromLogin({ token: 'to-clear' });

    service.clearToken();

    expect(service.getToken()).toBe('');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('hace POST a /auth/login con el payload recibido', () => {
    const payload = { email: 'test@mail.com', password: 'password123' };

    service.login(payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ token: 'login-token' });
  });

  it('hace POST a /auth/register con el payload recibido', () => {
    const payload = { name: 'Jane Doe', email: 'jane@mail.com', password: 'abc12345' };

    service.register(payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ message: 'Registro exitoso' });
  });

  it('ciclo login: al guardar token queda autenticado', () => {
    expect(service.isAuthenticated()).toBeFalse();

    const token = service.saveTokenFromLogin({ token: 'cycle-token' });

    expect(token).toBe('cycle-token');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toBe('cycle-token');
  });
});
