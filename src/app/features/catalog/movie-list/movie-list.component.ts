import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovieCardComponent, MovieCardViewModel } from '../movie-card/movie-card.component';
import { MoviesService, MovieViewModel } from '../../../core/services/movies.service';
import { SkeletonCardComponent } from '../../../shared/components/skeleton-card/skeleton-card.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingState, ErrorType, AppError } from '../../../shared/types/loading-state';
import { APP_ICONS } from '../../../shared/icons/app-icons';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieCardComponent,
    SkeletonCardComponent,
    ErrorAlertComponent
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent implements OnInit {
  private readonly moviesService = inject(MoviesService);

  protected readonly LoadingState = LoadingState;
  protected readonly icons = APP_ICONS;
  protected readonly searchControl = new FormControl('The Matrix', { nonNullable: true });

  protected movies: MovieCardViewModel[] = [];
  protected state: LoadingState = LoadingState.Idle;
  protected error: AppError | null = null;
  protected skeletonCount = 8;

  ngOnInit(): void {
    this.loadMovies();
  }

  /**
   * Carga las películas desde el servicio
   */
  protected loadMovies(): void {
    const searchTerm = this.searchControl.value.trim();

    if (!searchTerm) {
      this.movies = [];
      this.error = {
        type: ErrorType.BadRequest,
        message: 'Escribe un término de búsqueda para consultar el catálogo.',
      };
      this.state = LoadingState.Empty;
      return;
    }

    this.state = LoadingState.Loading;
    this.error = null;

    this.moviesService.searchMoviesSafe(searchTerm).subscribe((result) => {
      this.movies = this.normalizeMoviesToCardView(result.items);

      if (result.status === 'error') {
        this.error = {
          type: ErrorType.Network,
          message: result.errorMessage ?? 'No se pudo consultar el catálogo.',
        };
        this.state = LoadingState.Error;
        return;
      }

      if (result.status === 'empty') {
        this.state = LoadingState.Empty;
        return;
      }

      this.state = LoadingState.Success;
    });
  }

  /**
   * Busca películas con el término escrito
   */
  protected onSearch(): void {
    this.loadMovies();
  }

  /**
   * Reintentar cargar las películas
   */
  protected onRetry(): void {
    this.loadMovies();
  }

  /**
   * Normaliza MovieViewModel a MovieCardViewModel
   */
  private normalizeMoviesToCardView(movies: MovieViewModel[]): MovieCardViewModel[] {
    return movies.map(m => ({
      externalId: m.id,
      type: m.type,
      title: m.title,
      year: m.year || new Date().getFullYear(),
      rating: m.rating || 0,
      ratingLabel: `${(m.rating || 0).toFixed(1)} IMDb`,
      imageUrl: m.poster
    }));
  }

  /**
   * Mapea errores HTTP a AppError
   */
  private mapErrorResponse(error: unknown): AppError {
    const statusCode = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status?: number }).status) : 0;

    if (!statusCode || statusCode === 0) {
      return {
        type: ErrorType.Network,
        message: 'Error de conexión',
        statusCode: 0
      };
    }

    if (statusCode === 401 || statusCode === 403) {
      return {
        type: ErrorType.Unauthorized,
        message: 'No autorizado',
        statusCode
      };
    }

    if (statusCode === 404) {
      return {
        type: ErrorType.NotFound,
        message: 'Recurso no encontrado',
        statusCode
      };
    }

    if (statusCode >= 500) {
      return {
        type: ErrorType.ServerError,
        message: 'Error del servidor',
        statusCode
      };
    }

    if (statusCode >= 400) {
      return {
        type: ErrorType.BadRequest,
        message: 'Solicitud inválida',
        statusCode
      };
    }

    return {
      type: ErrorType.Unknown,
      message: typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: string }).message === 'string'
        ? (error as { message: string }).message
        : 'Error desconocido',
      statusCode
    };
  }
}
