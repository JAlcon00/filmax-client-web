import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="grid w-full gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/30 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
      <div class="relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_32%)]"></div>
        <div class="relative max-w-xl">
          <span class="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            FE-01 Registro
          </span>
          <h1 class="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Crea tu cuenta en Filmax
          </h1>
          <p class="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            Completa tus datos para empezar a explorar el catálogo, guardar tu progreso y acceder a futuras funciones de sesión.
          </p>

          <ul class="mt-8 space-y-3 text-sm text-slate-300">
            <li class="flex items-center gap-3"><span class="h-2 w-2 rounded-full bg-cyan-400"></span> Validación básica para nombre, correo y contraseña.</li>
            <li class="flex items-center gap-3"><span class="h-2 w-2 rounded-full bg-cyan-400"></span> Mensajes claros cuando un campo es inválido.</li>
            <li class="flex items-center gap-3"><span class="h-2 w-2 rounded-full bg-cyan-400"></span> Base lista para conectar el endpoint de registro.</li>
          </ul>
        </div>
      </div>

      <div class="bg-slate-950/80 px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
        <form class="space-y-5" [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
          <div>
            <label for="name" class="mb-2 block text-sm font-medium text-slate-200">Nombre completo</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              autocomplete="name"
              placeholder="Tu nombre"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <p *ngIf="isInvalid('name')" class="mt-2 text-sm text-rose-300">
              El nombre es obligatorio y debe tener al menos 3 caracteres.
            </p>
          </div>

          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-slate-200">Correo electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="correo@ejemplo.com"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <p *ngIf="isInvalid('email')" class="mt-2 text-sm text-rose-300">
              Ingresa un correo electrónico válido.
            </p>
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-slate-200">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            />
            <p *ngIf="isInvalid('password')" class="mt-2 text-sm text-rose-300">
              La contraseña debe tener mínimo 8 caracteres e incluir letras y números.
            </p>
          </div>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            [disabled]="registerForm.invalid"
          >
            Crear cuenta
          </button>

          <p *ngIf="submitted" class="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            Formulario válido. La integración con el backend se conectará en la siguiente subtarea.
          </p>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly registerForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
  });

  protected submitted = false;

  protected onSubmit(): void {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.submitted = false;
      return;
    }

    this.submitted = true;
  }

  protected isInvalid(controlName: 'name' | 'email' | 'password'): boolean {
    const control = this.registerForm.get(controlName);

    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }
}