import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { CatalogListComponent } from './features/catalog/catalog-list/catalog-list.component';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  { path: 'auth', component: AuthPageComponent },
  { path: 'catalog', component: CatalogListComponent }, // Guard removido temporalmente para testing sin backend
  { path: '**', redirectTo: 'catalog' },
];