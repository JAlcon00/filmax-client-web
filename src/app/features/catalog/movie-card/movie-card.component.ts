import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { MovieDetailModalComponent } from '../movie-detail-modal/movie-detail-modal.component';

export interface MovieCardViewModel {
  title: string;
  year: number;
  rating: number;
  ratingLabel: string;
  imageUrl: string;
}

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, MovieDetailModalComponent],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.css'
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: MovieCardViewModel;

  protected readonly icons = APP_ICONS;
  protected isModalOpen = false;

  protected get starCount(): number {
    return Math.max(0, Math.min(5, Math.round(this.movie.rating)));
  }

  /**
   * Abre el modal de detalle de película
   */
  protected openModal(): void {
    this.isModalOpen = true;
  }

  /**
   * Cierra el modal de detalle de película
   */
  protected closeModal(): void {
    this.isModalOpen = false;
  }
}
