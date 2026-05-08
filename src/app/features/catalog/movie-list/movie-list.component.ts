import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovieCardComponent, MovieCardViewModel } from '../movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../movie-detail-modal/movie-detail-modal.component';
import { MoviesService, MovieViewModel } from '../../../core/services/movies.service';
import { SkeletonCardComponent } from '../../../shared/components/skeleton-card/skeleton-card.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingState, ErrorType, AppError } from '../../../shared/types/loading-state';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieCardComponent,
    MovieDetailModalComponent,
    SkeletonCardComponent,
    ErrorAlertComponent
  ],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit, OnDestroy {
  private readonly moviesService = inject(MoviesService);
  private readonly titleCollator = new Intl.Collator('es', {
    numeric: true,
    sensitivity: 'base',
  });

  protected readonly LoadingState = LoadingState;
  protected readonly icons = APP_ICONS;
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchSubject = new Subject<string>();

  protected movies: MovieCardViewModel[] = [];
  protected readonly pageSize = 8;
  protected currentPage = 1;
  protected state: LoadingState = LoadingState.Idle;
  protected error: AppError | null = null;
  protected skeletonCount = 8;
  protected selectedMovie: MovieCardViewModel | null = null;
  protected isDetailModalOpen = false;

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.movies.length / this.pageSize));
  }

  protected get paginatedMovies(): MovieCardViewModel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.movies.slice(start, start + this.pageSize);
  }

  protected get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((searchTerm) => {
        this.loadMovies(searchTerm);
      });

    // Listen to search control changes
    this.searchControl.valueChanges.subscribe((value) => {
      this.searchSubject.next(value);
    });

    this.loadRandomMovies();
  }

  /**
   * Carga las películas desde el servicio
   */
  protected loadMovies(searchTerm?: string): void {
    const term = (searchTerm ?? this.searchControl.value).trim();

    if (!term) {
      this.loadRandomMovies();
      return;
    }

    this.state = LoadingState.Loading;
    this.error = null;

    this.moviesService.searchMoviesFuzzy(term).subscribe({
      next: (result) => {
        this.movies = this.normalizeMoviesToCardView(result.items);
        this.currentPage = 1;

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
      },
      error: (error: unknown) => {
        this.error = this.mapErrorResponse(error);
        this.state = LoadingState.Error;
      },
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

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  protected openMovieDetail(movie: MovieCardViewModel): void {
    this.selectedMovie = movie;
    this.isDetailModalOpen = true;
  }

  protected closeMovieDetail(): void {
    this.isDetailModalOpen = false;
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private loadRandomMovies(): void {
    this.state = LoadingState.Loading;
    this.error = null;

    this.moviesService.getPopularMovies().subscribe({
      next: (movies) => {
        this.movies = this.normalizeMoviesToCardView(movies);
        this.currentPage = 1;
        this.state = this.movies.length > 0 ? LoadingState.Success : LoadingState.Empty;
      },
      error: (error: unknown) => {
        this.movies = [];
        this.error = this.mapErrorResponse(error);
        this.state = LoadingState.Error;
      },
    });
  }

  /**
   * Normaliza MovieViewModel a MovieCardViewModel
   */
  private normalizeMoviesToCardView(movies: MovieViewModel[]): MovieCardViewModel[] {
    return movies
      .map(m => ({
        externalId: m.externalId ?? m.id,
        contentId: m.contentId,
        type: m.type,
        title: m.title,
        year: m.year || new Date().getFullYear(),
        rating: m.rating || 0,
        ratingLabel: `${(m.rating || 0).toFixed(1)} IMDb`,
        imageUrl: m.poster
      }))
      .sort((a, b) => this.titleCollator.compare(a.title, b.title));
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
