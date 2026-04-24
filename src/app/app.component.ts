import { Component } from '@angular/core';
import { RegisterComponent } from './features/auth/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegisterComponent],
  template: `
    <main class="min-h-screen bg-slate-950 text-white">
      <section class="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <app-register></app-register>
      </section>
    </main>
  `,
  styles: []
})
export class AppComponent {}
