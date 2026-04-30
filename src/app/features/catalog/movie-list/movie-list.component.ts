import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
    this.state = LoadingState.Loading;
    this.error = null;

    // Simular delay de carga
    setTimeout(() => {
      this.movies = this.getDefaultMovies();
      
      // Si no hay películas, mostrar estado Empty
      if (this.movies.length === 0) {
        this.state = LoadingState.Empty;
      } else {
        this.state = LoadingState.Success;
      }
    }, 1000);
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
      title: m.title,
      year: m.year || new Date().getFullYear(),
      rating: m.rating || 0,
      ratingLabel: `${(m.rating || 0).toFixed(1)} IMDb`,
      imageUrl: m.poster
    }));
  }

  /**
   * Retorna películas por defecto (hardcodeadas para testing sin backend)
   */
  private getDefaultMovies(): MovieCardViewModel[] {
    return [
      // {
      //   title: 'Inception',
      //   year: 2010,
      //   rating: 8.8,
      //   ratingLabel: '8.8 IMDb',
      //   imageUrl: 'https://i.pinimg.com/736x/0b/e1/da/0be1dafba6a85a2b21dbb27102fd4d3b.jpg'
      // },
      // {
      //   title: 'Interstellar',
      //   year: 2014,
      //   rating: 8.6,
      //   ratingLabel: '8.6 IMDb',
      //   imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg'
      // },
      // {
      //   title: 'Parasite',
      //   year: 2019,
      //   rating: 8.6,
      //   ratingLabel: '8.6 IMDb',
      //   imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Parasite_%282019_film%29.png'
      // },
      // {
      //   title: 'Pulp Fiction',
      //   year: 1994,
      //   rating: 8.9,
      //   ratingLabel: '8.9 IMDb',
      //   imageUrl: 'https://i.pinimg.com/1200x/f0/01/3c/f0013ca4a05245afde43e0eaa7d1a2ce.jpg'
      // },
      // {
      //   title: 'The Godfather',
      //   year: 1972,
      //   rating: 9.2,
      //   ratingLabel: '9.2 IMDb',
      //   imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg'
      // },
      // {
      //   title: 'Amores Perros',
      //   year: 2000,
      //   rating: 8.1,
      //   ratingLabel: '8.1 IMDb',
      //   imageUrl: 'https://i.pinimg.com/736x/7c/6c/b6/7c6cb6cf241d6487725d877b85571856.jpg'
      // },
      // {
      //   title: 'Amelie',
      //   year: 2001,
      //   rating: 8.3,
      //   ratingLabel: '8.3 IMDb',
      //   imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Amelie_poster.jpg'
      // },
      // {
      //   title: 'V de Vendetta',
      //   year: 2005,
      //   rating: 8.2,
      //   ratingLabel: '8.2 IMDb',
      //   imageUrl: 'https://i.pinimg.com/736x/9b/22/24/9b22243e735e2ad0f018ac2bf9a0460f.jpg'
      // }
    ];
  }

  /**
   * Mapea errores HTTP a AppError
   */
  private mapErrorResponse(error: any): AppError {
    const statusCode = error.status;

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
      message: error.message || 'Error desconocido',
      statusCode
    };
  }
}
