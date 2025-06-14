import api from './api';
import type { DisponibilidadTrabajador } from '../types/disponibilidad';

export const disponibilidadService = {
  getByTrabajador: (trabajadorId: number) => 
    api.get<DisponibilidadTrabajador[]>(`/disponibilidad/trabajador/${trabajadorId}`),
  
  getByDepartamento: (departamentoId: number) => 
    api.get<DisponibilidadTrabajador[]>(`/disponibilidad/departamento/${departamentoId}`),
  
  getByAnio: (anio: number) => 
    api.get<DisponibilidadTrabajador[]>(`/disponibilidad/anio/${anio}`)
}; 