import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { APP_ICONS } from '../../../shared/icons/app-icons';

export interface MovieCardViewModel {
  externalId?: string;
  contentId?: string;
  type?: 'movie' | 'series';
  title: string;
  year: number;
  rating: number;
  ratingLabel: string;
  imageUrl: string;
}

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css']
})
export class MovieCardComponent {
  @Input() movie!: MovieCardViewModel;
  @Output() movieSelected = new EventEmitter<MovieCardViewModel>();

  readonly icons = APP_ICONS;
  readonly stars = [1, 2, 3, 4, 5];
  private readonly fallbackPoster = 'assets/poster-placeholder.svg';

  get starCount(): number {
    return Math.max(0, Math.min(5, Math.round(this.movie.rating)));
  }

  /**
   * Abre el modal de detalle de película
   */
  openModal(): void {
    this.movieSelected.emit(this.movie);
  }

  trackByStar(_index: number, star: number): number {
    return star;
  }

  onPosterError(event: Event): void {
    const img = event.target as HTMLImageElement | null;

    if (!img || img.src.endsWith(this.fallbackPoster)) {
      return;
    }

    img.src = this.fallbackPoster;
  }
}
