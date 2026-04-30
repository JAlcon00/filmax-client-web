import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorType, AppError } from '../../types/loading-state';
import { APP_ICONS } from '../../icons/app-icons';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.css'
})
export class ErrorAlertComponent {
  @Input({ required: true }) error!: AppError | string;
  @Output() retry = new EventEmitter<void>();

  protected readonly icons = APP_ICONS;

  /**
   * Obtiene el mensaje de error legible para el usuario
   */
  protected getErrorMessage(): string {
    if (typeof this.error === 'string') {
      return this.error;
    }

    const errorMessages: Record<ErrorType, string> = {
      [ErrorType.Network]: 'No se pudo conectar. Verifica tu conexión a internet.',
      [ErrorType.Unauthorized]: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      [ErrorType.NotFound]: 'Los datos solicitados no fueron encontrados.',
      [ErrorType.ServerError]: 'El servidor está experimentando problemas. Intenta más tarde.',
      [ErrorType.BadRequest]: 'Hubo un problema con tu solicitud. Verifica los datos.',
      [ErrorType.Unknown]: this.error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.',
    };

    return errorMessages[this.error.type] || 'Ocurrió un error. Por favor intenta de nuevo.';
  }

  /**
   * Obtiene el icono según el tipo de error
   */
  protected getErrorIcon(): string {
    const iconMap: Record<ErrorType, string> = {
      [ErrorType.Network]: this.icons.wifiOff,
      [ErrorType.Unauthorized]: this.icons.lockFill,
      [ErrorType.NotFound]: this.icons.search,
      [ErrorType.ServerError]: this.icons.exclamationTriangle,
      [ErrorType.BadRequest]: this.icons.exclamationTriangle,
      [ErrorType.Unknown]: this.icons.exclamationCircle,
    };

    return iconMap[(this.error as AppError)?.type] || this.icons.exclamationCircle;
  }

  /**
   * Emite el evento de reintentar
   */
  protected onRetry(): void {
    this.retry.emit();
  }
}
