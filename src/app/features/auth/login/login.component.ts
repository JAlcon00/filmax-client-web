import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="grid w-full gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-sky-950/30 backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
      <div class="relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_32%)]"></div>
        <div class="relative max-w-xl">
          <span class="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
            FE-03 Login
          </span>
          <h1 class="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Bienvenido de vuelta
          </h1>
          <p class="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            Inicia sesion para continuar con tu experiencia en Filmax y acceder al contenido protegido de tu cuenta.
          </p>

          <ul class="mt-8 space-y-3 text-sm text-slate-300">
            <li class="flex items-center gap-3"><span class="h-2 w-2 rounded-full bg-sky-400"></span> Validacion de correo electronico con formato correcto.</li>
            <li class="flex items-center gap-3"><span class="h-2 w-2 rounded-full bg-sky-400"></span> Contrasena obligatoria con minimo 8 caracteres.</li>
            <li class="flex items-center gap-3"><span class="h-2 w-2 rounded-full bg-sky-400"></span> Mensajes de error claros por campo invalido.</li>
          </ul>
        </div>
      </div>

      <div class="bg-slate-950/80 px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <form class="space-y-5" [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <div>
            <label for="login-email" class="mb-2 block text-sm font-medium text-slate-200">Correo electronico</label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="correo@ejemplo.com"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            />
            <p *ngIf="isInvalid('email')" class="mt-2 text-sm text-rose-300">
              Ingresa un correo valido.
            </p>
          </div>

          <div>
            <label for="login-password" class="mb-2 block text-sm font-medium text-slate-200">Contrasena</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Minimo 8 caracteres"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            />
            <p *ngIf="isInvalid('password')" class="mt-2 text-sm text-rose-300">
              La contrasena es obligatoria y debe tener al menos 8 caracteres.
            </p>
          </div>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            [disabled]="loginForm.invalid"
          >
            Iniciar sesion
          </button>

          <p *ngIf="submitted" class="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            Formulario de login valido. La conexion con API se implementa en FE-04.
          </p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submitted = false;

  protected onSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.submitted = false;
      return;
    }

    this.submitted = true;
  }

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.get(controlName);

    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }
}