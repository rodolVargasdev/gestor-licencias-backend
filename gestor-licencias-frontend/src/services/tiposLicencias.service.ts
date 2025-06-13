import api from './api';
import type { TipoLicencia } from '../store/slices/tiposLicenciasSlice';

export const tiposLicenciasService = {
  getAll: () => api.get<TipoLicencia[]>('/tipos-licencias'),
  
  getById: (id: number) => api.get<TipoLicencia>(`/tipos-licencias/${id}`),
  
  create: (tipoLicencia: Omit<TipoLicencia, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<TipoLicencia>('/tipos-licencias', tipoLicencia),
  
  update: (id: number, tipoLicencia: Partial<TipoLicencia>) => 
    api.put<TipoLicencia>(`/tipos-licencias/${id}`, tipoLicencia),
  
  delete: (id: number) => 
    api.delete(`/tipos-licencias/${id}`),
  
  getByDepartamento: (departamentoId: number) => 
    api.get<TipoLicencia[]>(`/tipos-licencias/departamento/${departamentoId}`),
  
  getByCargo: (cargoId: number) => 
    api.get<TipoLicencia[]>(`/tipos-licencias/cargo/${cargoId}`),
  
  getByTipoPersonal: (tipoPersonalId: number) => 
    api.get<TipoLicencia[]>(`/tipos-licencias/tipo-personal/${tipoPersonalId}`)
}; 