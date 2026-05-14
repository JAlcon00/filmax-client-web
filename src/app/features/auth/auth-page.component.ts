import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { APP_ICONS } from '../../shared/icons/app-icons';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  template: `
    <section class="flex w-full flex-col items-center justify-center py-4">
      <div class="mb-8 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition"
          [ngClass]="currentView === 'login' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'"
          [attr.aria-pressed]="currentView === 'login'"
          (click)="currentView = 'login'"
          data-cy="auth-login-tab"
        >
          <i [class]="icons.signIn" aria-hidden="true"></i>
          Iniciar sesion
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition"
          [ngClass]="currentView === 'register' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'"
          [attr.aria-pressed]="currentView === 'register'"
          (click)="currentView = 'register'"
          data-cy="auth-register-tab"
        >
          <i [class]="icons.userPlus" aria-hidden="true"></i>
          Registrarse
        </button>
      </div>

      <app-login *ngIf="currentView === 'login'"></app-login>
      <app-register *ngIf="currentView === 'register'" (registerSuccess)="currentView = 'login'"></app-register>
    </section>
  `,
})
export class AuthPageComponent {
  protected readonly icons = APP_ICONS;
  protected currentView: 'login' | 'register' = 'login';
}
