import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { APP_ICONS } from '../../../shared/icons/app-icons';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.css'
})
export class RatingStarsComponent {
  @Input({ required: false }) initialRating: number = 0;
  @Output() ratingChange = new EventEmitter<number>();

  protected readonly icons = APP_ICONS;
  protected hoverRating: number = 0;
  protected selectedRating: number = 0;

  ngOnInit(): void {
    this.selectedRating = this.initialRating;
  }

  /**
   * Maneja el hover sobre una estrella
   */
  protected onStarHover(rating: number): void {
    this.hoverRating = rating;
  }

  /**
   * Limpia el hover
   */
  protected onStarLeave(): void {
    this.hoverRating = 0;
  }

  /**
   * Maneja el click en una estrella
   */
  protected onStarClick(rating: number): void {
    this.selectedRating = rating;
    this.ratingChange.emit(rating);
  }

  /**
   * Devuelve el rating actual a mostrar (hover o selected)
   */
  protected getCurrentRating(): number {
    return this.hoverRating || this.selectedRating;
  }

  /**
   * Devuelve si la estrella con index debe estar llena o vacía
   */
  protected isStarFilled(index: number): boolean {
    return index < this.getCurrentRating();
  }
}
