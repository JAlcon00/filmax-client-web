import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Movie {
  id: string;
  title: string;
  description?: string;
  genre?: string[];
  year?: number;
  poster?: string;
  rating?: number;
}

export interface SearchResponse {
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
  title: string;
  description: string;
  genre: string[];
  year: number | null;
  poster: string;
  rating: number;
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

  /**
   * Busca películas por término
   * @param searchTerm - Término de búsqueda
   * @returns Observable con los resultados de búsqueda
   */
  searchMovies(searchTerm: string): Observable<SearchResponse> {
    const params = new HttpParams().set('query', searchTerm);
    return this.http.get<SearchResponse>(`${this.moviesUrl}/search`, { params });
  }

  /**
   * Busca películas y normaliza la respuesta a un array de Movie
   * Detecta estructuras: array directo, data, results, movies, items, Search
   */
  searchMoviesNormalized(searchTerm: string): Observable<Movie[]> {
    return this.searchMovies(searchTerm).pipe(
      map((resp: any) => {
        if (!resp) return [];

        // If the response is an array
        if (Array.isArray(resp)) return resp as Movie[];

        // Common keys
        const keys = ['data', 'results', 'movies', 'items', 'Search'];
        for (const k of keys) {
          if (resp[k] && Array.isArray(resp[k])) return resp[k];
        }

        // Some APIs return array at root under different name
        if (resp.__root__ && Array.isArray(resp.__root__)) return resp.__root__;

        // No recognized array, return empty
        return [] as Movie[];
      })
    );
  }

  /**
   * Normaliza campos de una película con fallbacks seguros
   */
  private normalizeMovie(m: Partial<Movie>): MovieViewModel {
    return {
      id: m.id ?? 'unknown-id',
      title: m.title ?? 'Untitled',
      description: m.description ?? 'Sin descripción disponible',
      genre: (m.genre && m.genre.length > 0) ? m.genre : ['Sin especificar'],
      year: m.year ?? null,
      poster: m.poster ?? 'https://via.placeholder.com/300x450?text=No+Image',
      rating: typeof m.rating === 'number' ? m.rating : 0,
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
      catchError((err) => {
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
    return this.getMovies().pipe(
      map((resp: any) => {
        // Normalizar la respuesta a un array de Movie
        let movies: Movie[] = [];
        
        if (Array.isArray(resp)) {
          movies = resp as Movie[];
        } else {
          const keys = ['data', 'results', 'movies', 'items', 'Search', 'popular'];
          for (const k of keys) {
            if (resp[k] && Array.isArray(resp[k])) {
              movies = resp[k];
              break;
            }
          }
        }

        // Convertir a MovieViewModel
        return movies.map(m => this.normalizeMovie(m));
      }),
      catchError((error) => {
        console.error('Error fetching popular movies:', error);
        throw error;
      })
    );
  }
}
