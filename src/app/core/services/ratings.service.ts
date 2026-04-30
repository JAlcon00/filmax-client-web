import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Rating {
  movieId: string;
  rating: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
  private ratings$ = new BehaviorSubject<Rating[]>([]);

  constructor() {
    this.loadRatings();
  }

  /**
   * Obtiene todas las calificaciones
   */
  getRatings(): Observable<Rating[]> {
    return this.ratings$.asObservable();
  }

  /**
   * Obtiene la calificación de una película específica
   */
  getRatingByMovieId(movieId: string): Rating | undefined {
    return this.ratings$.value.find(r => r.movieId === movieId);
  }

  /**
   * Guarda o actualiza la calificación de una película
   */
  saveRating(movieId: string, rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const currentRatings = this.ratings$.value;
    const existingIndex = currentRatings.findIndex(r => r.movieId === movieId);

    if (existingIndex >= 0) {
      currentRatings[existingIndex] = {
        movieId,
        rating,
        timestamp: new Date()
      };
    } else {
      currentRatings.push({
        movieId,
        rating,
        timestamp: new Date()
      });
    }

    this.ratings$.next([...currentRatings]);
    this.persistRatings(currentRatings);
  }

  /**
   * Elimina la calificación de una película
   */
  deleteRating(movieId: string): void {
    const filtered = this.ratings$.value.filter(r => r.movieId !== movieId);
    this.ratings$.next(filtered);
    this.persistRatings(filtered);
  }

  /**
   * Carga las calificaciones desde localStorage
   */
  private loadRatings(): void {
    try {
      const stored = localStorage.getItem('film-ratings');
      if (stored) {
        const ratings = JSON.parse(stored) as Rating[];
        this.ratings$.next(ratings);
      }
    } catch (error) {
      console.error('Error loading ratings from localStorage:', error);
      this.ratings$.next([]);
    }
  }

  /**
   * Persiste las calificaciones en localStorage
   */
  private persistRatings(ratings: Rating[]): void {
    try {
      localStorage.setItem('film-ratings', JSON.stringify(ratings));
    } catch (error) {
      console.error('Error persisting ratings to localStorage:', error);
    }
  }
}
