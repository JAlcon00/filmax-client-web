import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Rating {
  id?: string;
  contentId: string;
  externalId?: string;
  title?: string;
  type?: 'movie' | 'series';
  posterUrl?: string | null;
  movieId: string;
  rating: number;
  timestamp: Date;
}

export interface CreateRatingRequest {
  contentId?: string;
  externalId?: string;
  title?: string;
  type?: 'movie' | 'series';
  posterUrl?: string | null;
  score: number;
  comment?: string;
}

export interface RatingResponse {
  id: string;
  score: number;
  comment?: string | null;
  userId: string;
  contentId: string;
  posterUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  content?: {
    id: string;
    externalId: string;
    title: string;
    type: 'movie' | 'series';
    poster?: string | null;
    posterUrl?: string | null;
    imageUrl?: string | null;
  };
}

export interface AverageRatingResponse {
  contentId: string;
  averageScore: number;
  totalRatings: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
  private readonly http = inject(HttpClient);
  private readonly ratingsUrl = `${environment.apiBaseUrl}/ratings`;
  private ratings$ = new BehaviorSubject<Rating[]>([]);

  constructor() {
    this.loadRatingsFromApi();
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
  getRatingByContentId(contentId: string): Rating | undefined {
    return this.ratings$.value.find(r => r.contentId === contentId);
  }

  getRatingByExternalId(externalId: string): Rating | undefined {
    return this.ratings$.value.find(r => r.externalId === externalId);
  }

  /**
   * Guarda o actualiza la calificación de una película
   */
  saveRating(payload: CreateRatingRequest): Observable<RatingResponse> {
    if (payload.score < 1 || payload.score > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return this.http.post<RatingResponse>(this.ratingsUrl, payload).pipe(
      tap((savedRating) => {
        const currentRatings = this.ratings$.value;
        const contentId = savedRating.contentId;
        const updatedRating: Rating = {
          id: savedRating.id,
          contentId,
          externalId: savedRating.content?.externalId,
          title: savedRating.content?.title,
          type: savedRating.content?.type,
          posterUrl: this.resolvePosterUrl(savedRating),
          movieId: contentId,
          rating: savedRating.score,
          timestamp: new Date(savedRating.updatedAt),
        };

        const existingIndex = currentRatings.findIndex(r => r.contentId === contentId);

        if (existingIndex >= 0) {
          currentRatings[existingIndex] = updatedRating;
        } else {
          currentRatings.push(updatedRating);
        }

        this.ratings$.next([...currentRatings]);
      })
    );
  }

  /**
   * Elimina la calificación de una película
   */
  deleteRating(ratingId: string): Observable<void> {
    return this.http.delete<void>(`${this.ratingsUrl}/${ratingId}`).pipe(
      tap(() => {
        const filtered = this.ratings$.value.filter(r => r.id !== ratingId);
        this.ratings$.next(filtered);
      })
    );
  }

  /**
   * Obtiene el promedio de calificaciones de un contenido
   */
  getAverageRating(contentId: string): Observable<AverageRatingResponse> {
    return this.http.get<AverageRatingResponse>(`${this.ratingsUrl}/average/${contentId}`);
  }

  /**
   * Carga las calificaciones del usuario autenticado
   */
  private loadRatingsFromApi(): void {
    this.http.get<{ items?: RatingResponse[]; data?: RatingResponse[] }>(`${this.ratingsUrl}/my`).subscribe({
      next: (response) => {
        const items = response.items ?? response.data ?? [];
        const ratings = items.map((rating) => ({
          id: rating.id,
          contentId: rating.contentId,
          externalId: rating.content?.externalId,
          title: rating.content?.title,
          type: rating.content?.type,
          posterUrl: this.resolvePosterUrl(rating),
          movieId: rating.contentId,
          rating: rating.score,
          timestamp: new Date(rating.updatedAt),
        }));

        this.ratings$.next(ratings);
      },
      error: () => {
        this.ratings$.next([]);
      }
    });
  }

  private resolvePosterUrl(rating: RatingResponse): string | null {
    const poster = rating.content?.posterUrl
      ?? rating.content?.poster
      ?? rating.content?.imageUrl
      ?? rating.posterUrl
      ?? null;

    if (!poster) {
      return null;
    }

    const trimmed = poster.trim();

    if (!trimmed || ['n/a', 'null', 'undefined'].includes(trimmed.toLowerCase())) {
      return null;
    }

    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }

    if (trimmed.startsWith('http://')) {
      return `https://${trimmed.slice('http://'.length)}`;
    }

    if (trimmed.startsWith('/')) {
      return new URL(trimmed, environment.apiBaseUrl).toString();
    }

    if (!/^[a-z][a-z\d+\-.]*:/i.test(trimmed) && !trimmed.startsWith('assets/')) {
      return new URL(trimmed, `${environment.apiBaseUrl}/`).toString();
    }

    return trimmed;
  }
}
