import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.css']
})
export class RatingStarsComponent {
  @Input() initialRating = 0;
  @Output() ratingChange = new EventEmitter<number>();

  protected readonly stars = [1, 2, 3, 4, 5];
  protected hoveredRating = 0;

  protected get activeRating(): number {
    return this.hoveredRating || this.initialRating;
  }

  protected setRating(rating: number): void {
    this.ratingChange.emit(rating);
  }
}
