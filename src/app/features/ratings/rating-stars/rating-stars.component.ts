import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2"
      role="radiogroup"
      aria-label="Calificacion del 1 al 5"
      (mouseleave)="clearPreview()"
      (keydown)="onKeydown($event)"
    >
      <button
        *ngFor="let star of stars"
        type="button"
        class="text-3xl leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        [class.text-amber-300]="isFilled(star)"
        [class.text-slate-500]="!isFilled(star)"
        [attr.aria-checked]="value === star"
        [attr.aria-label]="'Seleccionar ' + star + ' estrellas'"
        role="radio"
        [disabled]="disabled"
        (click)="setRating(star)"
        (mouseenter)="preview(star)"
      >
        ★
      </button>
      <span class="ml-2 text-sm font-medium text-slate-300">
        {{ effectiveRating }}/5
      </span>
    </div>
  `,
})
export class RatingStarsComponent {
  @Input() value = 0;
  @Input() disabled = false;
  @Output() readonly valueChange = new EventEmitter<number>();

  protected readonly stars = [1, 2, 3, 4, 5];
  protected hoveredValue = 0;

  protected get effectiveRating(): number {
    return this.hoveredValue || this.value;
  }

  protected setRating(star: number): void {
    if (this.disabled) {
      return;
    }

    this.value = star;
    this.valueChange.emit(star);
  }

  protected preview(star: number): void {
    if (this.disabled) {
      return;
    }

    this.hoveredValue = star;
  }

  protected clearPreview(): void {
    this.hoveredValue = 0;
  }

  protected isFilled(star: number): boolean {
    return star <= this.effectiveRating;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      this.setRating(Math.min(5, this.value + 1));
      event.preventDefault();
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      this.setRating(Math.max(1, this.value - 1));
      event.preventDefault();
    }

    if (event.key === 'Home') {
      this.setRating(1);
      event.preventDefault();
    }

    if (event.key === 'End') {
      this.setRating(5);
      event.preventDefault();
    }
  }
}