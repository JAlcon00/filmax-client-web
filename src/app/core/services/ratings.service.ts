import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface RatingRecord {
  externalId: string;
  title: string;
  type: 'movie' | 'series';
  posterUrl: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class RatingsService {
  private readonly storageKey = 'filmax_ratings';

  getRatingByContentId(contentId: string): { rating: number } | null {
    const rating = this.getRatings().find((item) => item.externalId === contentId);
    return rating ? { rating: rating.score } : null;
  }

  saveRating(rating: RatingRecord): Observable<RatingRecord> {
    const ratings = this.getRatings().filter((item) => item.externalId !== rating.externalId);
    ratings.push(rating);
    localStorage.setItem(this.storageKey, JSON.stringify(ratings));
    return of(rating);
  }

  private getRatings(): RatingRecord[] {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed as RatingRecord[] : [];
    } catch {
      return [];
    }
  }
}
