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
}

export interface CreateValidacionDTO {
  solicitud_id: number;
  validado_por: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  observaciones?: string;
}

export interface UpdateValidacionDTO {
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  observaciones?: string;
  fecha_aprobacion?: string;
}

export type EstadoValidacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'; 