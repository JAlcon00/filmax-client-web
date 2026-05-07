import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentsService } from './comments.service';
import { environment } from '../../../environments/environment';

describe('CommentsService - comentarios de contenido', () => {
  let service: CommentsService;
  let httpMock: HttpTestingController;
  const commentsUrl = `${environment.apiBaseUrl}/comments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentsService],
    });

    service = TestBed.inject(CommentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('consulta comentarios paginados por externalId o contentId', () => {
    service.getCommentsByContent('tt0133093', 5, 10).subscribe((response) => {
      expect(response.total).toBe(1);
      expect(response.comments[0].text).toBe('Gran película');
    });

    const req = httpMock.expectOne((request) => request.url === `${commentsUrl}/content/tt0133093`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.params.get('offset')).toBe('10');
    req.flush({
      comments: [
        {
          id: 'comment-1',
          text: 'Gran película',
          rating: 5,
          userId: 'user-1',
          contentId: 'content-1',
          createdAt: '2026-05-06T20:30:00.000Z',
          updatedAt: '2026-05-06T20:30:00.000Z',
          author: { id: 'user-1', name: 'Ana', email: 'ana@mail.com' },
        },
      ],
      total: 1,
    });
  });

  it('crea comentario con externalId para que el backend resuelva el contenido', () => {
    service.createComment({
      text: 'Me gustó mucho',
      rating: 4,
      externalId: 'tt0133093',
      title: 'The Matrix',
      type: 'movie',
    }).subscribe((comment) => {
      expect(comment.contentId).toBe('content-123');
    });

    const req = httpMock.expectOne(commentsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.externalId).toBe('tt0133093');
    req.flush({
      id: 'comment-2',
      text: 'Me gustó mucho',
      rating: 4,
      userId: 'user-2',
      contentId: 'content-123',
      createdAt: '2026-05-06T20:30:00.000Z',
      updatedAt: '2026-05-06T20:30:00.000Z',
      author: { id: 'user-2', name: 'Luis', email: 'luis@mail.com' },
    });
  });

  it('actualiza y elimina comentarios por id', () => {
    service.updateComment('comment-1', { text: 'Editado', rating: 3 }).subscribe((comment) => {
      expect(comment.text).toBe('Editado');
      expect(comment.rating).toBe(3);
    });

    const patchReq = httpMock.expectOne(`${commentsUrl}/comment-1`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({
      id: 'comment-1',
      text: 'Editado',
      rating: 3,
      userId: 'user-1',
      contentId: 'content-1',
      createdAt: '2026-05-06T20:30:00.000Z',
      updatedAt: '2026-05-06T20:35:00.000Z',
      author: { id: 'user-1', name: 'Ana', email: 'ana@mail.com' },
    });

    service.deleteComment('comment-1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const deleteReq = httpMock.expectOne(`${commentsUrl}/comment-1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
  });
});
