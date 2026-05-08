import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { APP_ICONS } from '../../icons/app-icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected readonly icons = APP_ICONS;
  protected isAuthenticated = false;
  private sub?: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.isAuthenticated = this.auth.isAuthenticated();
    this.sub = this.auth.authState$.subscribe((s) => (this.isAuthenticated = s));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
