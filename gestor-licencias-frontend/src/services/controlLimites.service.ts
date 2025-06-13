import api from './api';
import type { ControlLimite, CreateControlLimiteDTO, UpdateControlLimiteDTO } from '../types/controlLimite';

export const controlLimitesService = {
  getAll: () => api.get<ControlLimite[]>('/control-limites'),
  
  getById: (id: number) => api.get<ControlLimite>(`/control-limites/${id}`),
  
  create: (data: CreateControlLimiteDTO) => 
    api.post<ControlLimite>('/control-limites', data),
  
  update: (id: number, data: UpdateControlLimiteDTO) => 
    api.put<ControlLimite>(`/control-limites/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/control-limites/${id}`),
  
  getByTrabajador: (trabajadorId: number) => 
    api.get<ControlLimite[]>(`/control-limites/trabajador/${trabajadorId}`),
  
  getByTipoLicencia: (tipoLicenciaId: number) => 
    api.get<ControlLimite[]>(`/control-limites/tipo-licencia/${tipoLicenciaId}`),
  
  getByAnio: (anio: number) => 
    api.get<ControlLimite[]>(`/control-limites/anio/${anio}`)
}; 