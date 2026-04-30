import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MovieListComponent } from '../movie-list/movie-list.component';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, MovieListComponent],
  template: `
    <app-movie-list></app-movie-list>
  `,
})
export class CatalogListComponent {}