/**
 * Utilidades para manejar fechas en la zona horaria de El Salvador (UTC-6)
 */

// Zona horaria de El Salvador: UTC-6
const EL_SALVADOR_TIMEZONE_OFFSET = -6 * 60; // en minutos

/**
 * Convierte una fecha a la zona horaria de El Salvador
 * @param {string|Date} date - Fecha en formato string (YYYY-MM-DD) o Date
 * @returns {string} Fecha en formato YYYY-MM-DD en zona horaria de El Salvador
 */
const toElSalvadorDate = (date) => {
  let dateObj;
  
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
 * Convierte una fecha de El Salvador a fecha local
 * @param {string} date - Fecha en formato string (YYYY-MM-DD) desde el frontend
 * @returns {string} Fecha en formato YYYY-MM-DD para procesar
 */
const fromElSalvadorDate = (date) => {
  if (!date) return '';
  
  // Crear fecha en zona horaria de El Salvador
  const elSalvadorDate = new Date(date + 'T00:00:00-06:00');
  
  // Convertir a fecha local para procesar
  const localDate = new Date(elSalvadorDate.getTime() + (elSalvadorDate.getTimezoneOffset() * 60000));
  
  return localDate.toISOString().split('T')[0];
};

/**
 * Combina fecha y hora en la zona horaria de El Salvador
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} time - Hora en formato HH:MM
 * @returns {string} Fecha y hora combinada en formato ISO string
 */
const combineDateAndTime = (date, time) => {
  if (!date || !time) return '';
  
  try {
    // Crear fecha en zona horaria de El Salvador
    const dateTimeString = `${date}T${time}:00-06:00`;
    const dateTime = new Date(dateTimeString);
    
    // Verificar que la fecha es válida
    if (isNaN(dateTime.getTime())) {
      throw new Error('Fecha inválida');
    }
    
    return dateTime.toISOString();
  } catch (error) {
    console.error('Error combinando fecha y hora:', error);
    // Fallback: crear fecha local y convertir
    const localDateTime = new Date(`${date}T${time}:00`);
    return localDateTime.toISOString();
  }
};

/**
 * Obtiene la fecha actual en la zona horaria de El Salvador
 * @returns {string} Fecha actual en formato YYYY-MM-DD en zona horaria de El Salvador
 */
const getCurrentElSalvadorDate = () => {
  const now = new Date();
  return toElSalvadorDate(now);
};

/**
 * Normaliza las fechas en un objeto de datos para asegurar que estén en la zona horaria correcta
 * @param {Object} data - Objeto con fechas
 * @returns {Object} Objeto con fechas normalizadas
 */
const normalizeDates = (data) => {
  const normalized = { ...data };
  
  // Lista de campos de fecha que deben ser normalizados
  const dateFields = [
    'fecha_inicio', 'fecha_fin', 'fecha_solicitud', 
    'fecha_no_asiste', 'fecha_si_asiste', 'fecha'
  ];
  
  dateFields.forEach(field => {
    if (normalized[field]) {
      // Solo normalizar si es una fecha simple (YYYY-MM-DD) y no una fecha ISO con hora
      if (typeof normalized[field] === 'string' && normalized[field].match(/^\d{4}-\d{2}-\d{2}$/)) {
        normalized[field] = toElSalvadorDate(normalized[field]);
      }
      // Si ya tiene formato ISO con hora, no normalizar
    }
  });
  
  return normalized;
};

module.exports = {
  toElSalvadorDate,
  fromElSalvadorDate,
  combineDateAndTime,
  getCurrentElSalvadorDate,
  normalizeDates
}; 