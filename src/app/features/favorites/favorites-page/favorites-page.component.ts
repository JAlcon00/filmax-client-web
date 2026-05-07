import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingsService, Rating } from '../../../core/services/ratings.service';

@Component({
  selector: 'app-favorites-page',
  imports: [CommonModule],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.scss'
})
export class FavoritesPageComponent implements OnInit {
  ratings: Rating[] = [];

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    this.ratingsService.getRatings().subscribe(ratings => {
      this.ratings = ratings;
    });
  }
}
