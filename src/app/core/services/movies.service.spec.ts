import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MoviesService, SearchResponse, Movie } from './movies.service';
import { environment } from '../../../environments/environment';

describe('MoviesService - [FR-02.1] Probar búsquedas con varios términos', () => {
  let service: MoviesService;
  let httpMock: HttpTestingController;
  const moviesUrl = `${environment.apiBaseUrl}/movies`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MoviesService]
    });
    service = TestBed.inject(MoviesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no haya solicitudes HTTP pendientes
    httpMock.verify();
  });

  describe('searchMovies - Búsquedas con varios términos', () => {
    it('debe realizar una búsqueda y retornar películas para el término "Inception"', () => {
      const searchTerm = 'Inception';
      const mockResponse: SearchResponse = {
        data: [
          {
            id: '1',
            title: 'Inception',
            year: 2010,
            genre: ['Sci-Fi', 'Action'],
            poster: 'https://example.com/inception.jpg',
            rating: 8.8
          }
        ]
      };

      service.searchMovies(searchTerm).subscribe((response) => {
        expect(response.data).toBeDefined();
        expect(response.data?.length).toBe(1);
        expect(response.data?.[0].title).toContain('Inception');
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm;
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debe realizar una búsqueda y retornar películas diferentes para el término "Interstellar"', () => {
      const searchTerm = 'Interstellar';
      const mockResponse: SearchResponse = {
        data: [
          {
            id: '2',
            title: 'Interstellar',
            year: 2014,
            genre: ['Sci-Fi', 'Drama'],
            poster: 'https://example.com/interstellar.jpg',
            rating: 8.6
          }
        ]
      };

      service.searchMovies(searchTerm).subscribe((response) => {
        expect(response.data).toBeDefined();
        expect(response.data?.length).toBe(1);
        expect(response.data?.[0].title).toBe('Interstellar');
        expect(response.data?.[0].id).toBe('2');
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm;
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debe cambiar los resultados cuando se busca con término diferente: "Matrix"', () => {
      const searchTerm = 'Matrix';
      const mockResponse: SearchResponse = {
        data: [
          {
            id: '3',
            title: 'The Matrix',
            year: 1999,
            genre: ['Sci-Fi', 'Action'],
            poster: 'https://example.com/matrix.jpg',
            rating: 8.7
          }
        ]
      };

      service.searchMovies(searchTerm).subscribe((response) => {
        expect(response.data).toBeDefined();
        expect(response.data?.[0].title).toBe('The Matrix');
        expect(response.data?.[0].year).toBe(1999);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm;
      });

      req.flush(mockResponse);
    });

    it('debe retornar múltiples resultados para búsquedas que coinciden con varios títulos', () => {
      const searchTerm = 'Avengers';
      const mockResponse: SearchResponse = {
        data: [
          {
            id: '4',
            title: 'Avengers: Endgame',
            year: 2019,
            genre: ['Action', 'Adventure'],
            poster: 'https://example.com/endgame.jpg',
            rating: 8.4
          },
          {
            id: '5',
            title: 'Avengers: Infinity War',
            year: 2018,
            genre: ['Action', 'Adventure'],
            poster: 'https://example.com/infinitywar.jpg',
            rating: 8.4
          },
          {
            id: '6',
            title: 'The Avengers',
            year: 2012,
            genre: ['Action', 'Adventure'],
            poster: 'https://example.com/avengers.jpg',
            rating: 8.0
          }
        ]
      };

      service.searchMovies(searchTerm).subscribe((response) => {
        expect(response.data).toBeDefined();
        expect(response.data?.length).toBe(3);
        expect(response.data?.every(movie => movie.title.includes('Avengers'))).toBe(true);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm;
      });

      req.flush(mockResponse);
    });

    // FR-02.3 & FR-02.4 tests
    describe('FR-02.3/FR-02.4 - calidad de campos y manejo vacío/error', () => {
      it('debe normalizar campos faltantes con fallbacks', () => {
        const term = 'partialFields';
        const mock: any = { data: [{ id: 'p1', title: 'Partial Movie' /* missing fields */ }] };

        service.searchMoviesSafe(term).subscribe((res) => {
          expect(res.status).toBe('ok');
          expect(res.items.length).toBe(1);
          const mv = res.items[0];
          expect(mv.title).toBe('Partial Movie');
          expect(mv.description).toBeDefined();
          expect(mv.genre.length).toBeGreaterThan(0);
          expect(mv.poster).toContain('placeholder');
          expect(typeof mv.rating).toBe('number');
        });

        const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
        req.flush(mock);
      });

      it('debe devolver status empty cuando no hay resultados', () => {
        const term = 'noResults';
        const mock: any = { data: [] };

        service.searchMoviesSafe(term).subscribe((res) => {
          expect(res.status).toBe('empty');
          expect(res.items.length).toBe(0);
        });

        const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
        req.flush(mock);
      });

      it('debe devolver status error cuando la API falla', () => {
        const term = 'serverError';

        service.searchMoviesSafe(term).subscribe((res) => {
          expect(res.status).toBe('error');
          expect(res.items.length).toBe(0);
          expect(res.errorMessage).toBeDefined();
        });

        const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
        req.error(new ErrorEvent('Server error'), { status: 500, statusText: 'Internal Server Error' });
      });
    });

    it('debe enviar el parámetro correcto en la URL para cada búsqueda', () => {
      const searchTerms = ['Batman', 'Superman', 'Wonder Woman'];

      searchTerms.forEach((term) => {
        const mockResponse: SearchResponse = { data: [] };

        service.searchMovies(term).subscribe();

        const req = httpMock.expectOne((request) => {
          return request.url === `${moviesUrl}/search` &&
                 request.params.get('query') === term;
        });

        expect(req.request.params.get('query')).toBe(term);
        req.flush(mockResponse);
      });
    });

    it('debe manejar búsquedas con caracteres especiales: "Back to the Future"', () => {
      const searchTerm = 'Back to the Future';
      const mockResponse: SearchResponse = {
        data: [
          {
            id: '7',
            title: 'Back to the Future',
            year: 1985,
            genre: ['Comedy', 'Sci-Fi'],
            poster: 'https://example.com/bttf.jpg',
            rating: 8.5
          }
        ]
      };

      service.searchMovies(searchTerm).subscribe((response) => {
        expect(response.data?.[0].title).toBe('Back to the Future');
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm;
      });

      expect(req.request.params.get('query')).toEqual(searchTerm);
      req.flush(mockResponse);
    });

    it('debe devolver un array vacío cuando no hay coincidencias', () => {
      const searchTerm = 'NoExisteEsta123456Película';
      const mockResponse: SearchResponse = {
        data: []
      };

      service.searchMovies(searchTerm).subscribe((response) => {
        expect(response.data).toBeDefined();
        expect(response.data?.length).toBe(0);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm;
      });

      req.flush(mockResponse);
    });

    it('debe verificar que respuestas diferentes se obtienen para búsquedas diferentes', () => {
      const searchTerm1 = 'Terminator';
      const searchTerm2 = 'Titanic';

      const mockResponse1: SearchResponse = {
        data: [
          {
            id: '8',
            title: 'The Terminator',
            year: 1984,
            genre: ['Action', 'Sci-Fi'],
            poster: 'https://example.com/terminator.jpg',
            rating: 8.1
          }
        ]
      };

      const mockResponse2: SearchResponse = {
        data: [
          {
            id: '9',
            title: 'Titanic',
            year: 1997,
            genre: ['Drama', 'Romance'],
            poster: 'https://example.com/titanic.jpg',
            rating: 7.8
          }
        ]
      };

      service.searchMovies(searchTerm1).subscribe((response) => {
        expect(response.data?.[0].title).toBe('The Terminator');
      });

      service.searchMovies(searchTerm2).subscribe((response) => {
        expect(response.data?.[0].title).toBe('Titanic');
      });

      const req1 = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm1;
      });

      const req2 = httpMock.expectOne((request) => {
        return request.url === `${moviesUrl}/search` &&
               request.params.get('query') === searchTerm2;
      });

      expect(req1.request.params.get('query')).not.toBe(req2.request.params.get('query'));

      req1.flush(mockResponse1);
      req2.flush(mockResponse2);
    });
  });

  describe('FR-02.5 - medir tiempos de respuesta', () => {
    it('debe retornar un campo durationMs numérico', (done) => {
      const term = 'timingBasic';
      const mock: any = { data: [{ id: 't1', title: 'Timing Movie' }] };

      service.searchMoviesTimed(term).subscribe((res) => {
        expect(res.items.length).toBe(1);
        expect(typeof res.durationMs).toBe('number');
        expect(res.durationMs).toBeGreaterThanOrEqual(0);
        expect(res.status).toBe('ok');
        done();
      });

      const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
      // respond immediately
      req.flush(mock);
    });

    it('debe medir retraso simulado en la red (flush retrasado)', (done) => {
      const term = 'timingDelayed';
      const mock: any = { data: [{ id: 't2', title: 'Delayed Movie' }] };

      service.searchMoviesTimed(term).subscribe((res) => {
        try {
          expect(res.items.length).toBe(1);
          expect(res.durationMs).toBeGreaterThanOrEqual(40); // expect at least ~50ms
          expect(res.status).toBe('ok');
          done();
        } catch (err) {
          done.fail(err as any);
        }
      });

      const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
      // simulate network latency
      setTimeout(() => req.flush(mock), 60);
    });

    it('debe retornar status error y duration en caso de fallo de API', (done) => {
      const term = 'timingError';

      service.searchMoviesTimed(term).subscribe((res) => {
        try {
          expect(res.items.length).toBe(0);
          expect(res.status).toBe('error');
          expect(typeof res.durationMs).toBe('number');
          done();
        } catch (err) {
          done.fail(err as any);
        }
      });

      const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
      setTimeout(() => req.error(new ErrorEvent('network'), { status: 500 }), 30);
    });
  });
});

describe('MoviesService - [FR-02.2] Verificar estructura real de respuesta y normalización', () => {
  let service: MoviesService;
  let httpMock: HttpTestingController;
  const moviesUrl = `${environment.apiBaseUrl}/movies`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MoviesService]
    });
    service = TestBed.inject(MoviesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe manejar respuesta como array directo', () => {
    const term = 'arrayRoot';
    const mock: Movie[] = [{ id: 'a1', title: 'Root Movie' }];

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(Array.isArray(res)).toBeTrue();
      expect(res.length).toBe(1);
      expect(res[0].title).toBe('Root Movie');
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock as any);
  });

  it('debe manejar respuesta en `data`', () => {
    const term = 'dataKey';
    const mock: SearchResponse = { data: [{ id: 'd1', title: 'Data Movie' }] };

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].title).toBe('Data Movie');
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock as any);
  });

  it('debe manejar respuesta en `results`', () => {
    const term = 'resultsKey';
    const mock: any = { results: [{ id: 'r1', title: 'Results Movie' }] };

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].title).toBe('Results Movie');
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock);
  });

  it('debe manejar respuesta en `movies`', () => {
    const term = 'moviesKey';
    const mock: any = { movies: [{ id: 'm1', title: 'Movies Movie' }] };

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].title).toBe('Movies Movie');
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock);
  });

  it('debe manejar respuesta en `items`', () => {
    const term = 'itemsKey';
    const mock: any = { items: [{ id: 'i1', title: 'Items Movie' }] };

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].title).toBe('Items Movie');
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock);
  });

  it('debe manejar respuesta en `Search`', () => {
    const term = 'SearchKey';
    const mock: any = { Search: [{ id: 's1', title: 'Search Movie' }] };

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].title).toBe('Search Movie');
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock);
  });

  it('debe retornar vacío si la estructura no contiene arrays reconocibles', () => {
    const term = 'unknown';
    const mock: any = { message: 'no data', meta: {} };

    service.searchMoviesNormalized(term).subscribe((res) => {
      expect(Array.isArray(res)).toBeTrue();
      expect(res.length).toBe(0);
    });

    const req = httpMock.expectOne((r) => r.url === `${moviesUrl}/search` && r.params.get('query') === term);
    req.flush(mock);
  });
});
