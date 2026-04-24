import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  template: `
    <main class="min-h-screen bg-slate-950 text-white">
      <section class="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
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
    </main>
  `,
  styles: []
})
export class AppComponent {
  protected currentView: 'login' | 'register' = 'login';
}
