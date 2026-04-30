import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent - FR-06.4 cierre de sesion', () => {
  const authServiceMock = {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
    clearToken: jasmine.createSpy('clearToken'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    authServiceMock.clearToken.calls.reset();
  });

  it('al cerrar sesion limpia token y redirige a /auth', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance as any;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    component.logout();

    expect(authServiceMock.clearToken).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/auth');
  });
});
