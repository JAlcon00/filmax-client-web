import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RatingStarsComponent } from '../../ratings/rating-stars/rating-stars.component';
import { RatingsService } from '../../../core/services/ratings.service';
import { MovieCardViewModel } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-detail-modal',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  templateUrl: './movie-detail-modal.component.html',
  styleUrl: './movie-detail-modal.component.css'
})
export class MovieDetailModalComponent {
  @Input({ required: false }) isOpen = false;
  @Input({ required: false }) movie: MovieCardViewModel | null = null;
  @Output() close = new EventEmitter<void>();
  @ViewChild('modalElement') modalElement?: ElementRef<HTMLDivElement>;

  protected selectedRating: number = 0;
  protected isSubmitting = false;

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    if (this.movie) {
      const existing = this.ratingsService.getRatingByMovieId(this.movie.title);
      this.selectedRating = existing?.rating || 0;
    }
  }

  ngOnChanges(): void {
    if (this.movie) {
      const existing = this.ratingsService.getRatingByMovieId(this.movie.title);
      this.selectedRating = existing?.rating || 0;
    }
  }

  /**
   * Maneja cambios en la calificación
   */
  protected onRatingChange(rating: number): void {
    this.selectedRating = rating;
  }

  /**
   * Guarda la calificación
   */
  protected async saveRating(): Promise<void> {
    if (!this.movie || this.selectedRating === 0) {
      return;
    }

    this.isSubmitting = true;
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.ratingsService.saveRating(this.movie.title, this.selectedRating);
      
      // Mostrar feedback visual
      // En producción, mostrar un toast/notification
      console.log(`Película calificada: ${this.movie.title} - ${this.selectedRating} estrellas`);
      
      // Cerrar modal después de guardar
      setTimeout(() => {
        this.closeModal();
      }, 300);
    } catch (error) {
      console.error('Error guardando calificación:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Cierra el modal
   */
  protected closeModal(): void {
    this.close.emit();
  }

  /**
   * Maneja click en el backdrop
   */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
