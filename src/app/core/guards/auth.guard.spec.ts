import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard - FR-06.4 acceso y redireccion', () => {
  const authServiceMock = {
    isAuthenticated: jasmine.createSpy('isAuthenticated'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    authServiceMock.isAuthenticated.calls.reset();
  });

  it('permite acceso al catalogo cuando hay sesion', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeTrue();
  });

  it('redirige a /auth cuando no hay sesion', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result instanceof UrlTree).toBeTrue();
    const url = router.serializeUrl(result as UrlTree);
    expect(url).toBe('/auth');
  });
});
