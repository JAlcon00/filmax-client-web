import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';
import { APP_ICONS } from './shared/icons/app-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <header class="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div class="mx-auto flex w-full max-w-6xl items-center px-4 py-4 sm:px-6 lg:px-8" [class.justify-center]="isAuthRoute" [class.justify-between]="!isAuthRoute">
          <a routerLink="/catalog" class="inline-flex items-center gap-2 text-lg font-bold tracking-wide text-cyan-300" aria-label="Ir al catálogo de Filmax" data-cy="brand-link">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-base" aria-hidden="true">
              <i [class]="icons.logo"></i>
            </span>
            <span>FILMAX</span>
          </a>

          <nav *ngIf="!isAuthRoute" class="flex items-center gap-2">
            <a
              *ngIf="!authService.isAuthenticated()"
              routerLink="/auth"
              routerLinkActive="bg-white/20 text-white"
              class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              data-cy="nav-auth"
            >
              <i [class]="icons.signIn" aria-hidden="true"></i>
              Auth
            </a>
            <a
              routerLink="/catalog"
              routerLinkActive="bg-white/20 text-white"
              class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              data-cy="nav-catalog"
            >
              <i [class]="icons.catalog" aria-hidden="true"></i>
              Catalogo
            </a>
            <a
              *ngIf="authService.isAuthenticated()"
              routerLink="/favorites"
              routerLinkActive="bg-white/20 text-white"
              class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              data-cy="nav-favorites"
            >
              <i [class]="icons.heartFill" aria-hidden="true"></i>
              Favoritos
            </a>
            <button
              *ngIf="authService.isAuthenticated()"
              type="button"
              class="ml-2 inline-flex items-center gap-2 rounded-xl border border-rose-400/40 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20"
              (click)="logout()"
              data-cy="nav-logout"
            >
              <i [class]="icons.signOut" aria-hidden="true"></i>
              Cerrar sesion
            </button>
          </nav>
        </div>
      </header>

      <div *ngIf="isAnonymousAccessEnabled" class="border-b border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-100">
        <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 text-sm sm:px-6 lg:px-8">
          <span class="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            <i [class]="icons.infoCircle + ' mr-1.5'" aria-hidden="true"></i>
            Modo temporal
          </span>
          <span>La app está permitiendo acceso anónimo para validar el catálogo sin autenticación.</span>
        </div>
      </div>

      <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  protected readonly icons = APP_ICONS;
  protected readonly isAnonymousAccessEnabled = environment.allowAnonymousAccess;
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected get isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth');
  }

  protected logout(): void {
    this.authService.clearToken();
    this.router.navigateByUrl('/auth');
  }
}
