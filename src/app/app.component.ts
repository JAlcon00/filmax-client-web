import { Component } from '@angular/core';
import { MovieListComponent } from './features/catalog/movie-list/movie-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MovieListComponent],
  template: '<app-movie-list></app-movie-list>',
  styles: [':host { display: block; min-height: 100vh; background: #020617; }']
})
export class AppComponent {}
