/**
 * Utilidades para manejar fechas en la zona horaria de El Salvador (UTC-6)
 */

// Zona horaria de El Salvador: UTC-6
const EL_SALVADOR_TIMEZONE_OFFSET = -6 * 60; // en minutos

/**
 * Convierte una fecha local a la zona horaria de El Salvador
 * @param date - Fecha en formato string (YYYY-MM-DD) o Date
 * @returns Fecha en formato YYYY-MM-DD en zona horaria de El Salvador
 */
export const toElSalvadorDate = (date: string | Date): string => {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Si es string, asumimos que está en formato YYYY-MM-DD
    dateObj = new Date(date + 'T00:00:00');
  } else {
    dateObj = new Date(date);
  }
  
  // Ajustar a la zona horaria de El Salvador
  const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
  const elSalvadorTime = new Date(utc + (EL_SALVADOR_TIMEZONE_OFFSET * 60000));
  
  return elSalvadorTime.toISOString().split('T')[0];
};

/**
 * Convierte una fecha de El Salvador a fecha local para mostrar en la UI
 * @param date - Fecha en formato string (YYYY-MM-DD) desde el backend
 * @returns Fecha en formato YYYY-MM-DD para mostrar en la UI
 */
export const fromElSalvadorDate = (date: string): string => {
  if (!date) return '';
  
  // Crear fecha en zona horaria de El Salvador
  const elSalvadorDate = new Date(date + 'T00:00:00-06:00');
  
  // Convertir a fecha local para mostrar
  const localDate = new Date(elSalvadorDate.getTime() + (elSalvadorDate.getTimezoneOffset() * 60000));
  
  return localDate.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha actual en la zona horaria de El Salvador
 * @returns Fecha actual en formato YYYY-MM-DD en zona horaria de El Salvador
 */
export const getCurrentElSalvadorDate = (): string => {
  const now = new Date();
  return toElSalvadorDate(now);
};

/**
 * Combina fecha y hora en la zona horaria de El Salvador
 * @param date - Fecha en formato YYYY-MM-DD
 * @param time - Hora en formato HH:MM
 * @returns Fecha y hora combinada en formato ISO string
 */
export const combineDateAndTime = (date: string, time: string): string => {
  if (!date || !time) return '';
  
  // 1. Normalizar la fecha a la zona horaria de El Salvador para evitar el desfase de un día.
  // Esto asegura que `date` represente el día correcto en El Salvador.
  const normalizedDate = toElSalvadorDate(date);
  
  // 2. Construir el string de fecha y hora con el offset de El Salvador (-06:00).
  const dateTimeString = `${normalizedDate}T${time}:00-06:00`;
  const dateTime = new Date(dateTimeString);
  
  // 3. Devolver la fecha en formato ISO, que será almacenada en UTC en la DB.
  // Por ejemplo, '2025-06-24T14:30:00-06:00' se convierte en '2025-06-24T20:30:00.000Z'
  return dateTime.toISOString();
};

/**
 * Formatea una fecha para mostrar en la UI
 * @param date - Fecha en formato string o Date
 * @returns Fecha formateada para mostrar
 */
export const formatDateForDisplay = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-SV', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}; 