import type { DisponibilidadTrabajador } from './disponibilidad';
import type { Solicitud } from './solicitud';

export interface Validacion {
  id: number;
  solicitud_id: number;
  validado_por: number;
  fecha_validacion: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  observaciones?: string;
  disponibilidad?: DisponibilidadTrabajador;
  solicitud?: Solicitud & {
    trabajador?: {
      id: number;
      nombre_completo: string;
    };
    tipo_licencia?: {
      id: number;
      nombre: string;
    };
  };
  // Propiedades adicionales para compatibilidad
  tipoLicenciaId?: number;
  trabajadorId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  tipoLicencia?: {
    id: number;
    nombre: string;
  };
  trabajador?: {
    id: number;
    nombre_completo: string;
  };
}

export interface CreateValidacionDTO {
  solicitud_id: number;
  validado_por: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  observaciones?: string;
  // Propiedades adicionales para compatibilidad
  tipo_licencia_id?: number;
  trabajador_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface UpdateValidacionDTO {
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  observaciones?: string;
  fecha_aprobacion?: string;
}

export type EstadoValidacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'; 