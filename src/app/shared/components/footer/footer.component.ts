import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_ICONS } from '../../icons/app-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  protected readonly icons = APP_ICONS;
  protected readonly year = new Date().getFullYear();
}
