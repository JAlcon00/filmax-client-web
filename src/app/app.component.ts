import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <header class="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a routerLink="/auth" class="text-lg font-bold tracking-wide text-cyan-300">FILMAX</a>

          <nav class="flex items-center gap-2">
            <a
              routerLink="/auth"
              routerLinkActive="bg-white/20 text-white"
              class="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Auth
            </a>
            <a
              routerLink="/catalog"
              routerLinkActive="bg-white/20 text-white"
              class="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Catalogo
            </a>
            <button
              *ngIf="authService.isAuthenticated()"
              type="button"
              class="ml-2 rounded-xl border border-rose-400/40 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20"
              (click)="logout()"
            >
              Cerrar sesion
            </button>
          </nav>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.clearToken();
    this.router.navigateByUrl('/auth');
  }
}
