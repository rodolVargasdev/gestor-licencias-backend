import { api } from '../config/axios';
import { API_ROUTES } from '../constants/api';
import type { Trabajador, CreateTrabajadorDTO, UpdateTrabajadorDTO } from '../types/trabajador';

export const trabajadoresService = {
  getAll: async (): Promise<Trabajador[]> => {
    const response = await api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BASE);
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
  }
}; 