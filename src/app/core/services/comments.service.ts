import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
}

export interface CommentResponse {
  id: string;
  text: string;
  rating: number | null;
  userId: string;
  contentId: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

export interface CommentsListResponse {
  comments: CommentResponse[];
  total: number;
}

export interface CreateCommentRequest {
  text: string;
  rating?: number;
  contentId?: string;
  externalId?: string;
  title?: string;
  type?: 'movie' | 'series';
}

export interface UpdateCommentRequest {
  text?: string;
  rating?: number;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly commentsUrl = `${environment.apiBaseUrl}/comments`;

  getCommentsByContent(contentId: string, limit = 10, offset = 0): Observable<CommentsListResponse> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));

    return this.http.get<CommentsListResponse>(`${this.commentsUrl}/content/${encodeURIComponent(contentId)}`, { params });
  }

  createComment(payload: CreateCommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(this.commentsUrl, payload);
  }

  updateComment(commentId: string, payload: UpdateCommentRequest): Observable<CommentResponse> {
    return this.http.patch<CommentResponse>(`${this.commentsUrl}/${encodeURIComponent(commentId)}`, payload);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.commentsUrl}/${encodeURIComponent(commentId)}`);
  }
}
