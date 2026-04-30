import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-card.component.html',
  styleUrls: ['./skeleton-card.component.css']
})
export class SkeletonCardComponent {
  @Input() count = 8;

  protected get skeletons(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }
}
