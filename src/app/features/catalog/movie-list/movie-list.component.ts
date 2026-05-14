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
import { Subscription, debounceTime } from 'rxjs';

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
  private readonly trendingSuggestions = [
    'Dune',
    'Batman',
    'The Dark Knight',
    'The Matrix',
    'Inception',
    'Interstellar',
    'Star Wars',
    'Harry Potter',
    'The Lord of the Rings',
    'Spider-Man',
    'Avengers',
    'Titanic',
    'Avatar',
    'The Shawshank Redemption',
    'Pulp Fiction',
    'The Godfather',
    'Forrest Gump',
    'Gladiator',
    'The Avengers',
    'Iron Man',
    'Captain America',
  ];

  protected readonly LoadingState = LoadingState;
  protected readonly icons = APP_ICONS;
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected movies: MovieCardViewModel[] = [];
  protected readonly pageSize = 8;
  protected currentPage = 1;
  protected state: LoadingState = LoadingState.Idle;
  protected error: AppError | null = null;
  protected skeletonCount = 8;
  protected selectedMovie: MovieCardViewModel | null = null;
  protected isDetailModalOpen = false;
  protected searchSuggestions: string[] = [];
  protected isSuggestionsVisible = false;
  protected highlightedSuggestionIndex = -1;
  private suggestionPool: string[] = [...this.trendingSuggestions];
  private readonly suggestionLimit = 6;
  private searchControlSubscription?: Subscription;

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
    this.searchControlSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.updateSearchSuggestions(value);
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
        this.rebuildSuggestionPool(result.items);
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

  protected onSearchFocus(): void {
    this.isSuggestionsVisible = true;
    // Actualizar inmediatamente sin esperar debounce
    this.updateSearchSuggestions(this.searchControl.value);
  }

  protected onSearchBlur(): void {
    window.setTimeout(() => {
      this.isSuggestionsVisible = false;
      this.highlightedSuggestionIndex = -1;
    }, 150);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (!this.isSuggestionsVisible || this.searchSuggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedSuggestionIndex = (this.highlightedSuggestionIndex + 1) % this.searchSuggestions.length;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedSuggestionIndex = this.highlightedSuggestionIndex <= 0
        ? this.searchSuggestions.length - 1
        : this.highlightedSuggestionIndex - 1;
      return;
    }

    if (event.key === 'Escape') {
      this.isSuggestionsVisible = false;
      this.highlightedSuggestionIndex = -1;
      return;
    }

    if (event.key === 'Enter' && this.highlightedSuggestionIndex >= 0) {
      event.preventDefault();
      this.selectSuggestion(this.searchSuggestions[this.highlightedSuggestionIndex]);
    }
  }

  protected selectSuggestion(suggestion: string, event?: MouseEvent): void {
    event?.preventDefault();
    this.searchControl.setValue(suggestion);
    this.isSuggestionsVisible = false;
    this.highlightedSuggestionIndex = -1;
    this.loadMovies(suggestion);
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
    this.searchControlSubscription?.unsubscribe();
  }

  private loadRandomMovies(): void {
    this.state = LoadingState.Loading;
    this.error = null;

    this.moviesService.getPopularMovies().subscribe({
      next: (movies) => {
        this.movies = this.normalizeMoviesToCardView(movies);
        this.rebuildSuggestionPool(movies);
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

  private rebuildSuggestionPool(movies: MovieViewModel[]): void {
    const movieTitles = movies
      .map((movie) => movie.title)
      .filter((title) => title.trim().length > 0);

    this.suggestionPool = this.uniqueStrings([...this.trendingSuggestions, ...movieTitles]);
    this.updateSearchSuggestions(this.searchControl.value);
  }

  private updateSearchSuggestions(value: string): void {
    const term = this.normalizeSuggestionTerm(value);

    if (!term) {
      // Sin búsqueda: mostrar películas populares
      this.searchSuggestions = this.suggestionPool.slice(0, this.suggestionLimit);
      this.highlightedSuggestionIndex = this.searchSuggestions.length > 0 ? 0 : -1;
      return;
    }

    // Con búsqueda: filtrar agresivamente por coincidencias relevantes
    const scored = this.suggestionPool
      .map((item) => ({
        item,
        score: this.scoreSuggestion(term, item),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        // Ordenar primero por score (descendente), luego alfabéticamente
        if (Math.abs(b.score - a.score) > 0.01) {
          return b.score - a.score;
        }
        return this.titleCollator.compare(a.item, b.item);
      })
      .slice(0, this.suggestionLimit)
      .map(({ item }) => item);

    this.searchSuggestions = scored;
    this.highlightedSuggestionIndex = this.searchSuggestions.length > 0 ? 0 : -1;
  }

  private scoreSuggestion(query: string, candidate: string): number {
    const normalizedCandidate = this.normalizeSuggestionTerm(candidate);

    // Coincidencia exacta (normalizada)
    if (normalizedCandidate === query) {
      return 1.0;
    }

    // Empieza con la query (máxima prioridad después de exacta)
    if (normalizedCandidate.startsWith(query)) {
      return 0.99;
    }

    // Contiene la query como palabra completa al inicio
    const firstWord = normalizedCandidate.split(/\s+/)[0];
    if (firstWord && firstWord.startsWith(query)) {
      return 0.97;
    }

    // Contiene la query como substring y la palabra empieza con query
    const words = normalizedCandidate.split(/\s+/);
    const wordStartingWithQuery = words.find(w => w.startsWith(query));
    if (wordStartingWithQuery) {
      return 0.9;
    }

    // Contiene la query como substring consecutivo
    const queryIndex = normalizedCandidate.indexOf(query);
    if (queryIndex > 0 && normalizedCandidate[queryIndex - 1] === ' ') {
      // Empieza una palabra dentro del título
      return 0.85;
    }

    if (queryIndex > 0) {
      // Substring en medio de una palabra
      return 0.75;
    }

    // Búsqueda por palabras individuales
    const qWords = query.split(/\s+/).filter(Boolean);
    const candidateWords = normalizedCandidate.split(/\s+/).filter(Boolean);

    // Contar palabras que empiezan con alguna palabra de la query
    const matchedStartingWords = qWords.filter((qWord) =>
      candidateWords.some((cWord) => cWord.startsWith(qWord))
    );

    if (matchedStartingWords.length > 0) {
      const matchPercentage = matchedStartingWords.length / qWords.length;
      return 0.6 + matchPercentage * 0.25;
    }

    // Contar palabras que contienen la query
    const matchedContainingWords = qWords.filter((qWord) =>
      candidateWords.some((cWord) => cWord.includes(qWord))
    );

    if (matchedContainingWords.length > 0) {
      const matchPercentage = matchedContainingWords.length / qWords.length;
      return 0.4 + matchPercentage * 0.15;
    }

    return 0;
  }

  private normalizeSuggestionTerm(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private uniqueStrings(values: string[]): string[] {
    return Array.from(new Set(values));
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
