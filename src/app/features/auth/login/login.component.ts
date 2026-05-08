import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { APP_ICONS } from '../../../shared/icons/app-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="grid w-full gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-sky-950/30 backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
      <div class="relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_32%)]"></div>
        <div class="relative max-w-xl">
          <h1 class="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Bienvenido de vuelta
          </h1>
          <p class="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            Inicia sesion para continuar con tu experiencia en Filmax y acceder al contenido protegido de tu cuenta.
          </p>

          <ul class="mt-8 space-y-3 text-sm text-slate-300">
            <li class="flex items-center gap-3">
              <i [class]="icons.email + ' text-sky-300'" aria-hidden="true"></i>
              Validacion de correo electronico con formato correcto.
            </li>
            <li class="flex items-center gap-3">
              <i [class]="icons.key + ' text-sky-300'" aria-hidden="true"></i>
              Contrasena obligatoria con minimo 8 caracteres.
            </li>
            <li class="flex items-center gap-3">
              <i [class]="icons.shieldCheck + ' text-sky-300'" aria-hidden="true"></i>
              El token se guarda en sesion y se usa en solicitudes protegidas.
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-slate-950/80 px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <form class="space-y-5" [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <div>
            <label for="login-email" class="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
              <i [class]="icons.email" aria-hidden="true"></i>
              Correo electronico
            </label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="correo@ejemplo.com"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            />
            <p *ngIf="isInvalid('email')" class="mt-2 inline-flex items-center gap-2 text-sm text-rose-300">
              <i [class]="icons.exclamationCircle" aria-hidden="true"></i>
              Ingresa un correo valido.
            </p>
          </div>

          <div>
            <label for="login-password" class="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
              <i [class]="icons.lock" aria-hidden="true"></i>
              Contrasena
            </label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Minimo 8 caracteres"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            />
            <p *ngIf="isInvalid('password')" class="mt-2 inline-flex items-center gap-2 text-sm text-rose-300">
              <i [class]="icons.exclamationCircle" aria-hidden="true"></i>
              La contrasena es obligatoria y debe tener al menos 8 caracteres.
            </p>
          </div>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            [disabled]="loginForm.invalid || isSubmitting"
          >
            <i [class]="isSubmitting ? icons.arrowRepeat + ' animate-spin' : icons.signIn" aria-hidden="true"></i>
            {{ isSubmitting ? 'Validando credenciales...' : 'Iniciar sesion' }}
          </button>

          <p *ngIf="errorMessage" class="flex items-start gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <i [class]="icons.exclamationTriangle" aria-hidden="true"></i>
            {{ errorMessage }}
          </p>

          <p *ngIf="successMessage" class="flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <i [class]="icons.checkCircle" aria-hidden="true"></i>
            {{ successMessage }}
          </p>

          <p *ngIf="tokenPreview" class="flex items-start gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-xs text-sky-100 break-all">
            <i [class]="icons.infoCircle" aria-hidden="true"></i>
            Token recibido: {{ tokenPreview }}
          </p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly icons = APP_ICONS;
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected isSubmitting = false;
  protected successMessage = '';
  protected errorMessage = '';
  protected tokenPreview = '';

  protected onSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.tokenPreview = '';

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          const token = this.authService.saveTokenFromLogin(response);

          if (!token) {
            this.errorMessage = 'La respuesta del backend no incluye token de acceso.';
            return;
          }

          this.successMessage = 'Credenciales validas. Token recibido correctamente.';
          this.tokenPreview = this.maskToken(token);
          this.router.navigateByUrl('/catalog');
        },
        error: (error: unknown) => {
          this.errorMessage = this.resolveErrorMessage(error);
        },
      });
  }

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.get(controlName);

    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  private maskToken(token: string): string {
    if (token.length <= 14) {
      return token;
    }

    return `${token.slice(0, 7)}...${token.slice(-7)}`;
  }

  private resolveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo iniciar sesion. Intenta de nuevo.';
    }

    const backendMessage = this.extractBackendMessage(error.error);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.status === 0) {
      return 'No hay conexion con el servidor. Verifica que el backend este activo.';
    }

    if (error.status === 401) {
      return 'Credenciales invalidas. Verifica correo y contrasena.';
    }

    return 'No se pudo iniciar sesion. Revisa tus datos e intenta nuevamente.';
  }

  private extractBackendMessage(errorPayload: unknown): string | null {
    if (!errorPayload || typeof errorPayload !== 'object') {
      return null;
    }

    if ('message' in errorPayload && typeof errorPayload.message === 'string') {
      return errorPayload.message;
    }

    return null;
  }
}
