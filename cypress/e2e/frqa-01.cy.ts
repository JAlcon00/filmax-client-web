type MovieRecord = {
  id: string;
  contentId: string;
  externalId: string;
  title: string;
  description: string;
  genre: string[];
  year: number;
  poster: string;
  rating: number;
  type: 'movie' | 'series';
};

const baseMovieSet: MovieRecord[] = [
  {
    id: 'batman-begins-1',
    contentId: 'content-batman-begins',
    externalId: 'ext-batman-begins',
    title: 'Batman Begins',
    description: 'El origen del Caballero Oscuro en Gotham.',
    genre: ['Action', 'Drama'],
    year: 2005,
    poster: 'https://example.com/batman-begins.jpg',
    rating: 4.7,
    type: 'movie',
  },
  {
    id: 'dark-knight-1',
    contentId: 'content-dark-knight',
    externalId: 'ext-dark-knight',
    title: 'The Dark Knight',
    description: 'Batman enfrenta al Joker en Gotham City.',
    genre: ['Action', 'Crime'],
    year: 2008,
    poster: 'https://example.com/dark-knight.jpg',
    rating: 4.9,
    type: 'movie',
  },
  {
    id: 'matrix-1',
    contentId: 'content-matrix',
    externalId: 'ext-matrix',
    title: 'The Matrix',
    description: 'La realidad es una simulación.',
    genre: ['Sci-Fi', 'Action'],
    year: 1999,
    poster: 'https://example.com/matrix.jpg',
    rating: 4.8,
    type: 'movie',
  },
  {
    id: 'inception-1',
    contentId: 'content-inception',
    externalId: 'ext-inception',
    title: 'Inception',
    description: 'Sueños dentro de sueños.',
    genre: ['Sci-Fi', 'Thriller'],
    year: 2010,
    poster: 'https://example.com/inception.jpg',
    rating: 4.6,
    type: 'movie',
  },
  {
    id: 'harry-potter-1',
    contentId: 'content-harry-potter',
    externalId: 'ext-harry-potter',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    description: 'Un joven descubre que es un mago.',
    genre: ['Fantasy', 'Adventure'],
    year: 2001,
    poster: 'https://example.com/harry-potter.jpg',
    rating: 4.5,
    type: 'movie',
  },
];

function buildMovieResults(query: string): MovieRecord[] {
  const normalized = query.toLowerCase();

  if (normalized.includes('batman')) {
    return baseMovieSet.filter((movie) => movie.title.includes('Batman') || movie.description.includes('Batman'));
  }

  if (normalized.includes('matrix')) {
    return baseMovieSet.filter((movie) => movie.title.includes('Matrix'));
  }

  if (normalized.includes('inception')) {
    return baseMovieSet.filter((movie) => movie.title.includes('Inception'));
  }

  if (normalized.includes('harry')) {
    return baseMovieSet.filter((movie) => movie.title.includes('Harry Potter'));
  }

  if (normalized.includes('star')) {
    return [
      {
        id: 'star-wars-1',
        contentId: 'content-star-wars',
        externalId: 'ext-star-wars',
        title: 'Star Wars: A New Hope',
        description: 'La rebelión comienza.',
        genre: ['Sci-Fi', 'Adventure'],
        year: 1977,
        poster: 'https://example.com/star-wars.jpg',
        rating: 4.7,
        type: 'movie',
      },
    ];
  }

  return baseMovieSet;
}

function stubApi(): void {
  cy.intercept('GET', '**/ratings/my', { items: [] }).as('getMyRatings');

  cy.intercept('GET', '**/comments/content/*', {
    comments: [],
    total: 0,
  }).as('getComments');

  cy.intercept('POST', '**/auth/login', (req) => {
    const body = req.body as Record<string, unknown>;
    req.reply({
      statusCode: 201,
      body: {
        accessToken: 'cypress-token-123',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 'user-cypress',
          name: 'Cypress Tester',
          email: body.email ?? 'qa@filmax.dev',
        },
      },
    });
  }).as('loginRequest');

  cy.intercept('POST', '**/auth/register', (req) => {
    req.reply({
      statusCode: 201,
      body: {
        message: 'Registro exitoso. Ya puedes iniciar sesion.',
      },
    });
  }).as('registerRequest');

  cy.intercept('GET', '**/movies/search*', (req) => {
    const rawQuery = req.query.query ?? req.query.q ?? '';
    const query = Array.isArray(rawQuery) ? rawQuery.join(' ') : String(rawQuery);
    const movies = buildMovieResults(query);

    req.reply({
      statusCode: 200,
      body: { data: movies },
    });
  }).as('movieSearch');

  cy.intercept('POST', '**/ratings', (req) => {
    const body = req.body as Record<string, unknown>;
    const contentId = String(body.contentId ?? body.externalId ?? 'content-cypress');
    const title = String(body.title ?? 'Contenido calificado');
    const score = Number(body.score ?? 5);

    req.reply({
      statusCode: 201,
      body: {
        id: 'rating-cypress-1',
        score,
        userId: 'user-cypress',
        contentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: {
          id: contentId,
          externalId: String(body.externalId ?? contentId),
          title,
          type: String(body.type ?? 'movie') as 'movie' | 'series',
          posterUrl: String(body.posterUrl ?? ''),
        },
      },
    });
  }).as('saveRating');

  cy.intercept('POST', '**/comments', (req) => {
    const body = req.body as Record<string, unknown>;
    req.reply({
      statusCode: 201,
      body: {
        id: 'comment-cypress-1',
        text: String(body.text ?? 'Comentario de Cypress'),
        rating: Number(body.rating ?? 5),
        userId: 'user-cypress',
        contentId: String(body.contentId ?? body.externalId ?? 'content-cypress'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 'user-cypress',
          name: 'Cypress Tester',
          email: 'qa@filmax.dev',
        },
      },
    });
  }).as('createComment');
}

function clearSession(): void {
  cy.visit('/auth', {
    onBeforeLoad(win) {
      win.sessionStorage.clear();
    },
  });
}

function loginThroughUi(): void {
  cy.get('[data-cy="login-email"]').type('qa@filmax.dev');
  cy.get('[data-cy="login-password"]').type('Password123');
  cy.get('[data-cy="login-submit"]').click();
  cy.wait('@loginRequest');
  cy.location('pathname').should('eq', '/catalog');
}

describe('FRQA-01 - Cypress E2E de toda la aplicación', () => {
  beforeEach(() => {
    stubApi();
    clearSession();
  });

  it('redirige al login cuando se abre una ruta protegida sin sesión', () => {
    cy.visit('/catalog');
    cy.location('pathname').should('eq', '/auth');
    cy.contains('Bienvenido de vuelta').should('be.visible');
    cy.get('[data-cy="nav-auth"]').should('not.exist');
    cy.get('[data-cy="nav-catalog"]').should('not.exist');
  });

  it('permite alternar entre iniciar sesión y registrarse', () => {
    cy.get('[data-cy="auth-register-tab"]').click();
    cy.contains('Crea tu cuenta en Filmax').should('be.visible');
    cy.get('[data-cy="register-name"]').should('be.visible');

    cy.get('[data-cy="auth-login-tab"]').click();
    cy.contains('Bienvenido de vuelta').should('be.visible');
    cy.get('[data-cy="login-email"]').should('be.visible');
  });

  it('permite registrar un usuario nuevo desde la pantalla de registro', () => {
    cy.get('[data-cy="auth-register-tab"]').click();
    cy.get('[data-cy="register-name"]').type('Usuario Cypress');
    cy.get('[data-cy="register-email"]').type('usuario.cypress@filmax.dev');
    cy.get('[data-cy="register-password"]').type('Password123');
    cy.get('[data-cy="register-submit"]').click();

    cy.wait('@registerRequest');
    cy.contains('Registro exitoso. Ya puedes iniciar sesion.').should('be.visible');
  });

  it('recorre auth, catálogo, búsqueda, detalle, comentarios, calificación y favoritos', () => {
    loginThroughUi();

    cy.wait('@movieSearch');

    cy.get('[data-cy="nav-catalog"]').should('be.visible');
    cy.get('[data-cy="nav-favorites"]').should('be.visible');
    cy.get('[data-cy="nav-logout"]').should('be.visible');

    cy.get('[data-cy="catalog-search-input"]').clear().type('Batman').should('have.value', 'Batman');
    cy.get('[data-cy="catalog-suggestions"]').should('be.visible');
    cy.contains('[data-cy="catalog-suggestions"] [data-cy^="catalog-suggestion-"]', 'Batman')
      .should('be.visible')
      .click();

    cy.wait('@movieSearch')
      .its('request.url')
      .should('match', /Batman/i);

    cy.get('[data-cy="movie-card"]').should('have.length.at.least', 1);
    cy.contains('[data-cy="movie-card"]', 'Batman', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.get('[data-cy="movie-detail-modal"]').should('be.visible');
    cy.get('[data-cy="comment-textarea"]').should('be.visible').type('Excelente película para Cypress');
    cy.get('[data-cy="comment-rating-5"]').click();
    cy.get('[data-cy="comment-submit"]').click();
    cy.wait('@createComment');

    cy.get('[data-cy="rating-star-5"]').click();
    cy.get('[data-cy="movie-detail-save"]').click();
    cy.wait('@saveRating');

    cy.get('[data-cy="movie-detail-modal"]').should('not.have.class', 'show');
    cy.get('[data-cy="movie-detail-modal"]').should('have.attr', 'aria-hidden', 'true');

    cy.get('[data-cy="nav-favorites"]').click();
    cy.location('pathname').should('eq', '/favorites');
    cy.get('[data-cy="favorites-page"]').should('be.visible');
    cy.contains('Batman Begins').should('be.visible');
    cy.contains('5/5').should('be.visible');
  });
});
