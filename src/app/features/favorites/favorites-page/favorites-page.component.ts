import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingsService, Rating } from '../../../core/services/ratings.service';
import { APP_ICONS } from '../../../shared/icons/app-icons';

@Component({
  selector: 'app-favorites-page',
  imports: [CommonModule],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss'
})
export class FavoritesPageComponent implements OnInit {
  protected readonly icons = APP_ICONS;
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly fallbackPoster = 'assets/poster-placeholder.svg';

  ratings: Rating[] = [];

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    this.ratingsService.getRatings().subscribe(ratings => {
      this.ratings = ratings;
    });
  }

  protected onPosterError(event: Event): void {
    const img = event.target as HTMLImageElement | null;

    if (!img || img.src.endsWith(this.fallbackPoster)) {
      return;
    }

    img.src = this.fallbackPoster;
  }
}
