import { api } from '../config/axios';
import { API_ROUTES } from '../constants/api';
import type { Trabajador, CreateTrabajadorDTO, UpdateTrabajadorDTO } from '../types/trabajador';

export const trabajadoresService = {
  getAll: async (): Promise<Trabajador[]> => {
    const response = await api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BASE, {
      params: {
        // Cache-busting parameter
        t: new Date().getTime(),
      }
    });
    return response.data;
  },
  
  getById: async (id: number): Promise<Trabajador> => {
    const response = await api.get<Trabajador>(API_ROUTES.TRABAJADORES.BY_ID(id));
    return response.data;
  },
  
  create: async (data: CreateTrabajadorDTO): Promise<Trabajador> => {
    const response = await api.post<Trabajador>(API_ROUTES.TRABAJADORES.BASE, data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateTrabajadorDTO): Promise<Trabajador> => {
    const response = await api.put<Trabajador>(API_ROUTES.TRABAJADORES.BY_ID(id), data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(API_ROUTES.TRABAJADORES.BY_ID(id));
  },
  
  getByTipoPersonal: async (tipoPersonal: 'OPERATIVO' | 'ADMINISTRATIVO'): Promise<Trabajador[]> => {
    const response = await api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BY_TIPO(tipoPersonal));
    return response.data;
  },
  
  getByDepartamento: async (departamentoId: number): Promise<Trabajador[]> => {
    const response = await api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BY_DEPARTAMENTO(departamentoId));
    return response.data;
  },
  
  findByCodigo: async (codigo: string): Promise<Trabajador[]> => {
    const response = await api.get<Trabajador[]>(`${API_ROUTES.TRABAJADORES.BASE}?codigo=${codigo}`);
    return response.data;
  },
  
  getLicenciasActivas: async (trabajadorId: number) => {
    const response = await api.get(API_ROUTES.TRABAJADORES.LICENCIAS_ACTIVAS(trabajadorId));
    return response.data;
  },
  
  getLicenciasPorPeriodo: async (trabajadorId: number, fechaInicio: string, fechaFin: string) => {
    const response = await api.get(API_ROUTES.TRABAJADORES.LICENCIAS_PERIODO(trabajadorId), {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  importFromExcel: async (file: File) => {
    try {
      console.log('📁 Iniciando importación desde frontend...');
      console.log('Archivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Enviando a la API...');
      const response = await api.post(API_ROUTES.TRABAJADORES.IMPORT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos
      });
      
      console.log('✅ Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error en importación:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        console.error('Error de respuesta:', axiosError.response?.data);
        throw new Error(axiosError.response?.data?.error || 'Error en la importación');
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error('No se recibió respuesta del servidor');
        throw new Error('No se pudo conectar con el servidor');
      } else {
        console.error('Error de configuración:', error);
        throw new Error('Error al procesar el archivo');
      }
    }
  }
}; 