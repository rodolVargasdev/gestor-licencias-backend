import { api } from '../config/axios';
import { API_ROUTES } from '../constants/api';
import type { Licencia, CreateLicenciaDTO, UpdateLicenciaDTO } from '../types/licencia';

export const licenciasService = {
  getAll: () => api.get<Licencia[]>(API_ROUTES.LICENCIAS.BASE),
  
  getById: (id: number) => api.get<Licencia>(API_ROUTES.LICENCIAS.BY_ID(id)),
  
  create: (data: CreateLicenciaDTO) => 
    api.post<Licencia>(API_ROUTES.LICENCIAS.BASE, data),
  
  update: (id: number, data: UpdateLicenciaDTO) => 
    api.put<Licencia>(API_ROUTES.LICENCIAS.BY_ID(id), data),
  
  delete: (id: number) => 
    api.delete(API_ROUTES.LICENCIAS.BY_ID(id)),
  
  findByTrabajador: (trabajadorId: number) => 
    api.get<Licencia[]>(`${API_ROUTES.LICENCIAS.BASE}/trabajador/${trabajadorId}`),
  
  findByTipoLicencia: (tipoLicenciaId: number) => 
    api.get<Licencia[]>(`${API_ROUTES.LICENCIAS.BASE}/tipo-licencia/${tipoLicenciaId}`),
  
  findByEstado: (estado: string) => 
    api.get<Licencia[]>(`${API_ROUTES.LICENCIAS.BASE}/estado/${estado}`),
  
  findBySolicitud: (solicitudId: number) => 
    api.get<Licencia>(`${API_ROUTES.LICENCIAS.BASE}/solicitud/${solicitudId}`),
  
  findByFecha: (fechaInicio: string, fechaFin: string) => 
    api.get<Licencia[]>(`${API_ROUTES.LICENCIAS.BASE}/fecha`, {
      params: { fechaInicio, fechaFin }
    })
}; 