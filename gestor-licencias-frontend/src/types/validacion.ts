import type { TipoLicencia } from './tipoLicencia';
import type { Trabajador } from './trabajador';

export interface Validacion {
  id: number;
  tipoLicenciaId: number;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  tipoLicencia?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  trabajador?: {
    id: number;
    nombre: string;
    apellido: string;
    documento: string;
  };
}

export interface CreateValidacionDTO {
  tipoLicenciaId: number;
  trabajadorId: number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  observaciones?: string;
}

export interface UpdateValidacionDTO {
  tipoLicenciaId?: number;
  trabajadorId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  observaciones?: string;
}

export type EstadoValidacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'; 