import { Component } from '@angular/core';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MovieListComponent } from './features/catalog/movie-list/movie-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, MovieListComponent],
  template: `
    <div class="app-shell">
      <app-navbar></app-navbar>

      <main class="app-main">
        <app-movie-list></app-movie-list>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .app-shell {
        background-color: var(--color-bg);
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .app-main {
        flex: 1;
      }
    `
  ]
})
export class AppComponent {}
