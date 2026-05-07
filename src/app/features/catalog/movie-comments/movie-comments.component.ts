import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService, User } from '../../../core/services/auth.service';
import {
  CommentResponse,
  CommentsService,
  CreateCommentRequest
} from '../../../core/services/comments.service';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { MovieCardViewModel } from '../movie-card/movie-card.component';

type CommentsState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-movie-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movie-comments.component.html',
  styleUrl: './movie-comments.component.css'
})
export class MovieCommentsComponent implements OnChanges {
  @Input({ required: false }) movie: MovieCardViewModel | null = null;

  private readonly formBuilder = inject(FormBuilder);
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);
  private readonly relativeFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  protected readonly icons = APP_ICONS;
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly commentForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(500)]],
  });
  protected readonly editForm = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(500)]],
  });

  protected comments: CommentResponse[] = [];
  protected currentUser: User | null = null;
  protected state: CommentsState = 'idle';
  protected total = 0;
  protected selectedRating = 0;
  protected editRating = 0;
  protected isSubmitting = false;
  protected isUpdating = false;
  protected isLoadingMore = false;
  protected editingCommentId = '';
  protected loadError = '';
  protected submitError = '';
  protected actionError = '';

  private readonly pageSize = 10;

  protected get remainingCharacters(): number {
    return 500 - this.commentForm.controls.text.value.length;
  }

  protected get editRemainingCharacters(): number {
    return 500 - this.editForm.controls.text.value.length;
  }

  protected get canSubmit(): boolean {
    return this.commentForm.valid && this.selectedRating > 0 && !this.isSubmitting;
  }

  protected get canLoadMore(): boolean {
    return this.comments.length < this.total;
  }

  protected get currentUserInitials(): string {
    return this.getInitials(this.currentUser?.name ?? this.currentUser?.email ?? 'Usuario');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('movie' in changes) {
      this.currentUser = this.authService.getCurrentUser();
      this.resetComposer();
      this.cancelEdit();
      this.loadComments();
    }
  }

  protected setDraftRating(rating: number): void {
    this.selectedRating = rating;
    this.submitError = '';
  }

  protected setEditRating(rating: number): void {
    this.editRating = rating;
    this.actionError = '';
  }

  protected submitComment(): void {
    this.commentForm.markAllAsTouched();
    this.submitError = '';

    if (!this.movie || !this.canSubmit) {
      return;
    }

    const payload = this.buildCreatePayload(this.commentForm.controls.text.value.trim(), this.selectedRating);

    this.isSubmitting = true;
    this.commentsService.createComment(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (comment) => {
          this.comments = [comment, ...this.comments.filter((item) => item.id !== comment.id)];
          this.total = Math.max(this.total + 1, this.comments.length);
          this.state = 'success';
          this.resetComposer();
        },
        error: (error: unknown) => {
          this.submitError = this.resolveErrorMessage(error, 'No se pudo publicar el comentario.');
        },
      });
  }

  protected startEdit(comment: CommentResponse): void {
    this.editingCommentId = comment.id;
    this.editRating = comment.rating ?? 0;
    this.editForm.setValue({ text: comment.text });
    this.actionError = '';
  }

  protected cancelEdit(): void {
    this.editingCommentId = '';
    this.editRating = 0;
    this.editForm.reset();
    this.actionError = '';
  }

  protected saveEdit(comment: CommentResponse): void {
    this.editForm.markAllAsTouched();

    if (this.editForm.invalid || this.editRating === 0 || this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    this.commentsService.updateComment(comment.id, {
      text: this.editForm.controls.text.value.trim(),
      rating: this.editRating,
    })
      .pipe(finalize(() => (this.isUpdating = false)))
      .subscribe({
        next: (updatedComment) => {
          this.comments = this.comments.map((item) => item.id === updatedComment.id ? updatedComment : item);
          this.cancelEdit();
        },
        error: (error: unknown) => {
          this.actionError = this.resolveErrorMessage(error, 'No se pudo actualizar el comentario.');
        },
      });
  }

  protected deleteComment(comment: CommentResponse): void {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    this.commentsService.deleteComment(comment.id)
      .pipe(finalize(() => (this.isUpdating = false)))
      .subscribe({
        next: () => {
          this.comments = this.comments.filter((item) => item.id !== comment.id);
          this.total = Math.max(0, this.total - 1);
          this.cancelEdit();
        },
        error: (error: unknown) => {
          this.actionError = this.resolveErrorMessage(error, 'No se pudo eliminar el comentario.');
        },
      });
  }

  protected loadMore(): void {
    this.loadComments(true);
  }

  protected canManage(comment: CommentResponse): boolean {
    const userId = this.currentUser?.id;
    return Boolean(userId && (comment.userId === userId || comment.author.id === userId));
  }

  protected isStarFilled(rating: number | null, star: number): boolean {
    return Boolean(rating && star <= rating);
  }

  protected getInitials(value: string): string {
    const words = value.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return 'FM';
    }

    return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('');
  }

  protected formatRelativeDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ];

    for (const [unit, secondsInUnit] of ranges) {
      if (Math.abs(diffSeconds) >= secondsInUnit) {
        return this.relativeFormatter.format(Math.round(diffSeconds / secondsInUnit), unit);
      }
    }

    return this.relativeFormatter.format(diffSeconds, 'second');
  }

  private loadComments(append = false): void {
    if (!this.movie) {
      this.comments = [];
      this.total = 0;
      this.state = 'idle';
      return;
    }

    const contentKey = this.getCommentsLookupId();

    if (!contentKey) {
      this.comments = [];
      this.total = 0;
      this.state = 'success';
      return;
    }

    this.loadError = '';
    this.actionError = '';

    if (append) {
      this.isLoadingMore = true;
    } else {
      this.state = 'loading';
    }

    this.commentsService.getCommentsByContent(contentKey, this.pageSize, append ? this.comments.length : 0)
      .pipe(finalize(() => {
        this.isLoadingMore = false;
      }))
      .subscribe({
        next: (response) => {
          this.comments = append ? [...this.comments, ...response.comments] : response.comments;
          this.total = response.total;
          this.state = 'success';
        },
        error: (error: unknown) => {
          if (!append) {
            this.comments = [];
            this.total = 0;
            this.state = 'error';
          }

          this.loadError = this.resolveErrorMessage(error, 'No se pudieron cargar los comentarios.');
        },
      });
  }

  private buildCreatePayload(text: string, rating: number): CreateCommentRequest {
    if (this.movie?.contentId) {
      return { text, rating, contentId: this.movie.contentId };
    }

    return {
      text,
      rating,
      externalId: this.movie?.externalId ?? this.movie?.title,
      title: this.movie?.title,
      type: this.movie?.type ?? 'movie',
    };
  }

  private getCommentsLookupId(): string {
    return this.movie?.contentId || this.movie?.externalId || this.movie?.title || '';
  }

  private resetComposer(): void {
    this.commentForm.reset();
    this.selectedRating = 0;
    this.submitError = '';
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    const backendMessage = this.extractBackendMessage(error.error);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.status === 0) {
      return 'No hay conexión con el servidor.';
    }

    if (error.status === 401) {
      return 'Tu sesión expiró. Inicia sesión de nuevo.';
    }

    if (error.status === 403) {
      return 'Solo el autor puede modificar este comentario.';
    }

    return fallback;
  }

  private extractBackendMessage(errorPayload: unknown): string | null {
    if (!errorPayload || typeof errorPayload !== 'object') {
      return null;
    }

    if ('message' in errorPayload && typeof errorPayload.message === 'string') {
      return errorPayload.message;
    }

    return null;
  }
}
