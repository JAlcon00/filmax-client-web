export enum LoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Empty = 'empty',
  Error = 'error',
}

export enum ErrorType {
  BadRequest = 'bad-request',
  Network = 'network',
  NotFound = 'not-found',
  ServerError = 'server-error',
  Unauthorized = 'unauthorized',
  Unknown = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
}
