import { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    if (response) {
      // Error con respuesta del servidor
      const { status, data } = response;
      
      if (data.errors) {
        // Error de validación
        return new ApiError(status, 'Error de validación', data.errors);
      }
      
      if (data.message) {
        // Error con mensaje personalizado
        return new ApiError(status, data.message);
      }
      
      // Error genérico con código de estado
      return new ApiError(status, `Error del servidor: ${status}`);
    }
    
    if (error.request) {
      // Error sin respuesta del servidor
      return new ApiError(0, 'No se pudo conectar con el servidor');
    }
  }
  
  // Error desconocido
  return new ApiError(0, 'Error desconocido');
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.errors) {
      // Si hay errores de validación, mostrar el primero
      const firstError = Object.values(error.errors)[0];
      return firstError[0];
    }
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Error desconocido';
}; 