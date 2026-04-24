import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RatingStarsComponent } from '../../ratings/rating-stars/rating-stars.component';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  template: `
    <section class="space-y-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 shadow-xl shadow-emerald-950/20">
      <h1 class="text-3xl font-bold tracking-tight text-emerald-100">Catalogo protegido</h1>
      <p class="max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
        Esta vista solo es accesible para usuarios autenticados. Si no hay token en sesion, el guard redirige automaticamente a la pantalla de autenticacion.
      </p>

      <div class="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-200">
        FE-06 completo: ruta protegida activa con <span class="font-semibold text-cyan-300">Auth Guard</span>.
      </div>

      <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">FE-10 Componente de Calificacion</p>
        <h2 class="mt-2 text-xl font-semibold text-white">Califica esta pelicula</h2>
        <p class="mt-1 text-sm text-slate-300">Selecciona una calificacion del 1 al 5 con el mouse o teclado.</p>

        <div class="mt-4">
          <app-rating-stars [value]="userRating" (valueChange)="onRatingChange($event)"></app-rating-stars>
        </div>

        <p class="mt-4 text-sm text-slate-200" *ngIf="userRating > 0">
          Tu calificacion actual es <span class="font-semibold text-amber-300">{{ userRating }}</span> de 5.
        </p>
        <p class="mt-4 text-sm text-slate-400" *ngIf="userRating === 0">
          Aun no has seleccionado una calificacion.
        </p>
      </article>
    </section>
  `,
})
export class CatalogListComponent {
  protected userRating = 0;

  protected onRatingChange(value: number): void {
    this.userRating = value;
  }
}