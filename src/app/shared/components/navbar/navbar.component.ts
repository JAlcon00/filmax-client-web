import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_ICONS } from '../../icons/app-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  protected readonly icons = APP_ICONS;
}
