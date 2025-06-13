import { api } from '../config/axios';
import { API_ROUTES } from '../constants/api';
import type { Trabajador, CreateTrabajadorDTO, UpdateTrabajadorDTO } from '../types/trabajador';

export const trabajadoresService = {
  getAll: () => api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BASE),
  
  getById: (id: number) => api.get<Trabajador>(API_ROUTES.TRABAJADORES.BY_ID(id)),
  
  create: (data: CreateTrabajadorDTO) => 
    api.post<Trabajador>(API_ROUTES.TRABAJADORES.BASE, data),
  
  update: (id: number, data: UpdateTrabajadorDTO) => 
    api.put<Trabajador>(API_ROUTES.TRABAJADORES.BY_ID(id), data),
  
  delete: (id: number) => 
    api.delete(API_ROUTES.TRABAJADORES.BY_ID(id)),
  
  getByTipoPersonal: (tipoPersonal: 'OPERATIVO' | 'ADMINISTRATIVO') => 
    api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BY_TIPO(tipoPersonal)),
  
  getByDepartamento: (departamentoId: number) => 
    api.get<Trabajador[]>(API_ROUTES.TRABAJADORES.BY_DEPARTAMENTO(departamentoId)),
  
  getLicenciasActivas: (trabajadorId: number) => 
    api.get(API_ROUTES.TRABAJADORES.LICENCIAS_ACTIVAS(trabajadorId)),
  
  getLicenciasPorPeriodo: (trabajadorId: number, fechaInicio: string, fechaFin: string) => 
    api.get(API_ROUTES.TRABAJADORES.LICENCIAS_PERIODO(trabajadorId), {
      params: { fechaInicio, fechaFin }
    })
}; 