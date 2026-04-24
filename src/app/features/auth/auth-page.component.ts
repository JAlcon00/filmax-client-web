import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  template: `
    <section class="flex w-full flex-col items-center justify-center py-4">
      <div class="mb-8 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          class="rounded-xl px-5 py-2 text-sm font-semibold transition"
          [class]="currentView === 'login' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'"
          (click)="currentView = 'login'"
        >
          Iniciar sesion
        </button>
        <button
          type="button"
          class="rounded-xl px-5 py-2 text-sm font-semibold transition"
          [class]="currentView === 'register' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'"
          (click)="currentView = 'register'"
        >
          Registrarse
        </button>
      </div>

      <app-login *ngIf="currentView === 'login'"></app-login>
      <app-register *ngIf="currentView === 'register'"></app-register>
    </section>
  `,
})
export class AuthPageComponent {
  protected currentView: 'login' | 'register' = 'login';
}