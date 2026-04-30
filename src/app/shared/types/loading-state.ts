/**
 * Enum para los estados de carga y consultas
 */
export enum LoadingState {
  Idle = 'idle',           // Estado inicial, sin cargar
  Loading = 'loading',     // Cargando datos
  Success = 'success',     // Datos cargados exitosamente
  Error = 'error',         // Error en la consulta
  Empty = 'empty',         // Sin resultados
}

/**
 * Enum para diferenciar tipos de errores
 */
export enum ErrorType {
  Network = 'network',           // Error de conexión/red
  Unauthorized = 'unauthorized', // Sesión inválida o sin permisos
  NotFound = 'notfound',         // Recurso no encontrado
  ServerError = 'servererror',   // Error del servidor (5xx)
  BadRequest = 'badrequest',     // Solicitud inválida (4xx)
  Unknown = 'unknown',           // Error desconocido
}

/**
 * Interfaz para manejar errores estructurados
 */
export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: unknown;
}
