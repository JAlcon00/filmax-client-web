import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RatingStarsComponent } from '../../ratings/rating-stars/rating-stars.component';
import { RatingsService } from '../../../core/services/ratings.service';
import type { MovieCardViewModel } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-detail-modal',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  templateUrl: './movie-detail-modal.component.html',
  styleUrls: ['./movie-detail-modal.component.css']
})
export class MovieDetailModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() movie: MovieCardViewModel | null = null;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('modalElement') modalElement?: ElementRef<HTMLDivElement>;

  protected selectedRating: number = 0;
  protected isSubmitting = false;
  private readonly fallbackPoster = 'assets/poster-placeholder.svg';

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    if (this.movie) {
      const existing = this.ratingsService.getRatingByContentId(this.getContentId());
      this.selectedRating = existing?.rating || 0;
    }
  }

  ngOnChanges(): void {
    if (this.movie) {
      const existing = this.ratingsService.getRatingByContentId(this.getContentId());
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
      await firstValueFrom(this.ratingsService.saveRating({
        externalId: this.getContentId(),
        title: this.movie.title,
        type: this.movie.type ?? 'movie',
        posterUrl: this.movie.imageUrl,
        score: this.selectedRating,
      }));

      this.closeModal();
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
    this.closed.emit();
  }

  private getContentId(): string {
    return this.movie?.externalId ?? this.movie?.title ?? 'unknown-content';
  }

  /**
   * Maneja click en el backdrop
   */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  protected onPosterError(event: Event): void {
    const img = event.target as HTMLImageElement | null;

    if (!img || img.src.endsWith(this.fallbackPoster)) {
      return;
    }

    img.src = this.fallbackPoster;
  }
}
