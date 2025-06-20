import axios from 'axios';

// La URL base del backend se obtiene de las variables de entorno de Vite.
// En Render, debes tener una variable llamada VITE_API_URL 
// con el valor: https://gestor-licencias-backend.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  // Construimos la URL completa, asegurando que el prefijo /api siempre esté presente.
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí puedes manejar los errores globalmente
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de petición:', error.request);
    } else {
      // Algo sucedió al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 