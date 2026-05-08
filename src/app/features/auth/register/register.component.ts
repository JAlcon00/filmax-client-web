import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { APP_ICONS } from '../../../shared/icons/app-icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="grid w-full gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/30 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
      <div class="relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_32%)]"></div>
        <div class="relative max-w-xl">
          <h1 class="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Crea tu cuenta en Filmax
          </h1>
          <p class="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            Completa tus datos para empezar a explorar el catálogo, guardar tu progreso y acceder a futuras funciones de sesión.
          </p>

          <ul class="mt-8 space-y-3 text-sm text-slate-300">
            <li class="flex items-center gap-3">
              <i [class]="icons.personBadge + ' text-cyan-300'" aria-hidden="true"></i>
              Validación básica para nombre, correo y contraseña.
            </li>
            <li class="flex items-center gap-3">
              <i [class]="icons.exclamationCircle + ' text-cyan-300'" aria-hidden="true"></i>
              Mensajes claros cuando un campo es inválido.
            </li>
            <li class="flex items-center gap-3">
              <i [class]="icons.send + ' text-cyan-300'" aria-hidden="true"></i>
              Envío al endpoint de backend para crear usuario.
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-slate-950/80 px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <form class="space-y-5" [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
          <div>
            <label for="name" class="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
              <i [class]="icons.user" aria-hidden="true"></i>
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              autocomplete="name"
              placeholder="Tu nombre"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <p *ngIf="isInvalid('name')" class="mt-2 inline-flex items-center gap-2 text-sm text-rose-300">
              <i [class]="icons.exclamationCircle" aria-hidden="true"></i>
              El nombre es obligatorio y debe tener al menos 3 caracteres.
            </p>
          </div>

          <div>
            <label for="email" class="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
              <i [class]="icons.email" aria-hidden="true"></i>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="correo@ejemplo.com"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <p *ngIf="isInvalid('email')" class="mt-2 inline-flex items-center gap-2 text-sm text-rose-300">
              <i [class]="icons.exclamationCircle" aria-hidden="true"></i>
              Ingresa un correo electrónico válido.
            </p>
          </div>

          <div>
            <label for="password" class="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
              <i [class]="icons.lock" aria-hidden="true"></i>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <p *ngIf="isInvalid('password')" class="mt-2 inline-flex items-center gap-2 text-sm text-rose-300">
              <i [class]="icons.exclamationCircle" aria-hidden="true"></i>
              La contraseña debe tener mínimo 8 caracteres e incluir letras y números.
            </p>
          </div>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            [disabled]="registerForm.invalid || isSubmitting"
          >
            <i [class]="isSubmitting ? icons.arrowRepeat + ' animate-spin' : icons.userPlus" aria-hidden="true"></i>
            {{ isSubmitting ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>

          <p *ngIf="errorMessage" class="flex items-start gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            <i [class]="icons.exclamationTriangle" aria-hidden="true"></i>
            {{ errorMessage }}
          </p>

          <p *ngIf="successMessage" class="flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <i [class]="icons.checkCircle" aria-hidden="true"></i>
            {{ successMessage }}
          </p>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly icons = APP_ICONS;
  protected readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
  });

  protected isSubmitting = false;
  protected successMessage = '';
  protected errorMessage = '';

  protected onSubmit(): void {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService
      .register(this.registerForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.successMessage = response.message ?? 'Registro exitoso. Ya puedes iniciar sesion.';
          this.registerForm.reset();
        },
        error: (error: unknown) => {
          this.errorMessage = this.resolveErrorMessage(error);
        },
      });
  }

  protected isInvalid(controlName: 'name' | 'email' | 'password'): boolean {
    const control = this.registerForm.get(controlName);

    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }

  private resolveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo completar el registro. Intenta de nuevo.';
    }

    const backendMessage = this.extractBackendMessage(error.error);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.status === 0) {
      return 'No hay conexion con el servidor. Verifica que el backend este activo.';
    }

    return 'No se pudo completar el registro. Revisa tus datos e intenta nuevamente.';
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
