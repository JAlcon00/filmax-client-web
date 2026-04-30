import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-card.component.html',
  styleUrl: './skeleton-card.component.css'
})
export class SkeletonCardComponent implements OnInit, OnChanges {
  @Input() count: number = 1;

  protected skeletons = Array.from({ length: this.count }, (_, i) => i);

  ngOnInit(): void {
    this.skeletons = Array.from({ length: this.count }, (_, i) => i);
  }

  ngOnChanges(): void {
    this.skeletons = Array.from({ length: this.count }, (_, i) => i);
  }
}
