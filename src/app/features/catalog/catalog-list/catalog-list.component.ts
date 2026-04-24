import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 shadow-xl shadow-emerald-950/20">
      <h1 class="text-3xl font-bold tracking-tight text-emerald-100">Catalogo protegido</h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
        Esta vista solo es accesible para usuarios autenticados. Si no hay token en sesion, el guard redirige automaticamente a la pantalla de autenticacion.
      </p>
      <div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
        FE-06 completo: ruta protegida activa con <span class="font-semibold text-cyan-300">Auth Guard</span>.
      </div>
    </section>
  `,
})
export class CatalogListComponent {}