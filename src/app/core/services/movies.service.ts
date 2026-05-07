import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Movie {
  id?: string;
  contentId?: string;
  externalId?: string;
  title: string;
  description?: string;
  genre?: string[];
  year?: number;
  poster?: string;
  posterUrl?: string | null;
  rating?: number;
  type?: 'movie' | 'series';
}

export interface SearchResponse {
  count?: number;
  data?: Movie[];
  results?: Movie[];
  movies?: Movie[];
  items?: Movie[];
  Search?: Movie[];
  // fallback: allow root array response
  __root__?: Movie[];
}

export interface MovieViewModel {
  id: string;
  contentId?: string;
  externalId?: string;
  title: string;
  description: string;
  genre: string[];
  year: number | null;
  poster: string;
  rating: number;
  type?: 'movie' | 'series';
}

export interface SearchResult {
  items: MovieViewModel[];
  status: 'ok' | 'empty' | 'error';
  errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly moviesUrl = `${environment.apiBaseUrl}/movies`;
  private readonly fallbackPoster = 'assets/poster-placeholder.svg';

  /**
   * Busca películas por término
   * @param searchTerm - Término de búsqueda
   * @returns Observable con los resultados de búsqueda
   */
  searchMovies(searchTerm: string): Observable<SearchResponse> {
    const params = new HttpParams().set('q', searchTerm).set('query', searchTerm).set('limit', '20');
    return this.http.get<SearchResponse>(`${this.moviesUrl}/search`, { params });
  }

  /**
   * Busca películas y normaliza la respuesta a un array de Movie
   * Detecta estructuras: array directo, data, results, movies, items, Search
   */
  searchMoviesNormalized(searchTerm: string): Observable<Movie[]> {
    return this.searchMovies(searchTerm).pipe(
      map((resp: unknown) => {
        if (!resp) return [];

        if (Array.isArray(resp)) return resp as Movie[];

        const response = resp as Record<string, unknown>;

        const keys = ['data', 'results', 'movies', 'items', 'Search'];
        for (const k of keys) {
          const candidate = response[k];

          if (Array.isArray(candidate)) return candidate as Movie[];
        }

        const rootArray = response['__root__'];

        if (Array.isArray(rootArray)) return rootArray as Movie[];

        return [] as Movie[];
      })
    );
  }

  /**
   * Normaliza campos de una película con fallbacks seguros
   */
  private normalizeMovie(m: Partial<Movie>): MovieViewModel {
    const externalId = m.externalId ?? m.id ?? 'unknown-id';

    return {
      id: m.id ?? externalId,
      contentId: m.contentId,
      externalId,
      title: m.title ?? 'Untitled',
      description: m.description ?? 'Sin descripción disponible',
      genre: (m.genre && m.genre.length > 0) ? m.genre : ['Sin especificar'],
      year: m.year ?? null,
      poster: m.poster ?? m.posterUrl ?? this.fallbackPoster,
      rating: typeof m.rating === 'number' ? m.rating : 0,
      type: (m.type === 'series') ? 'series' : 'movie',
    };
  }

  /**
   * Busca películas y devuelve un objeto con estado para distinguir vacío/error
   */
  searchMoviesSafe(searchTerm: string): Observable<SearchResult> {
    return this.searchMoviesNormalized(searchTerm).pipe(
      map((movies) => {
        const items = movies.map((m) => this.normalizeMovie(m));
        if (items.length === 0) {
          return { items: [], status: 'empty' } as SearchResult;
        }
        return { items, status: 'ok' } as SearchResult;
      }),
      catchError((err) => {
        const message = err?.message ?? 'Error desconocido';
        return of({ items: [], status: 'error', errorMessage: message } as SearchResult);
      })
    );
  }

  /**
   * Mide el tiempo de la consulta y devuelve items + duración
   */
  searchMoviesTimed(searchTerm: string): Observable<{ items: MovieViewModel[]; durationMs: number; status: SearchResult['status']; }>{
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return this.searchMoviesSafe(searchTerm).pipe(
      map((res) => {
        const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const duration = Math.max(0, Math.round(end - start));
        return { items: res.items, durationMs: duration, status: res.status };
      }),
      catchError(() => {
        const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const duration = Math.max(0, Math.round(end - start));
        return of({ items: [], durationMs: duration, status: 'error' as const });
      })
    );
  }

  /**
   * Obtiene el catálogo completo de películas
   * @returns Observable con el catálogo
   */
  getMovies(): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(`${this.moviesUrl}`);
  }

  /**
   * Obtiene películas populares normalizadas
   * @returns Observable con array de MovieViewModel
   */
  getPopularMovies(): Observable<MovieViewModel[]> {
    const seedTerms = ['avengers', 'batman', 'spider man', 'harry potter', 'star wars', 'matrix'];
    const randomTerm = seedTerms[Math.floor(Math.random() * seedTerms.length)];

    return this.searchMoviesNormalized(randomTerm).pipe(
      map((movies) => movies.map((m) => this.normalizeMovie(m)))
    );
  }
}
