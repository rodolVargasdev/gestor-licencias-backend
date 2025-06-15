import { api } from '../config/axios';
import { API_ROUTES } from '../constants/api';
import type { Solicitud } from '../types/solicitud';

export const solicitudesService = {
  create: (data: Partial<Solicitud>) => 
    api.post<Solicitud>(API_ROUTES.SOLICITUDES.BASE, data),
  
  getAll: () => 
    api.get<Solicitud[]>(API_ROUTES.SOLICITUDES.BASE),
  
  getById: (id: number) => 
    api.get<Solicitud>(API_ROUTES.SOLICITUDES.BY_ID(id)),
  
  update: (id: number, data: Partial<Solicitud>) => 
    api.put<Solicitud>(API_ROUTES.SOLICITUDES.BY_ID(id), data),
  
  delete: (id: number) => 
    api.delete(API_ROUTES.SOLICITUDES.BY_ID(id))
}; 