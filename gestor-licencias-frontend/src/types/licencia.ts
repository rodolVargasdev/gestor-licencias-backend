import type { Trabajador } from './trabajador';
import type { TipoLicencia } from './tipoLicencia';
import type { Solicitud } from './solicitud';

export interface Licencia {
  id: number;
  solicitud_id: number;
  trabajador_id: number;
  tipo_licencia_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias_totales: number;
  dias_habiles: number;
  dias_calendario: number;
  estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'APROBADA';
  motivo: string;
  observaciones?: string;
  motivo_cancelacion?: string;
  fecha_cancelacion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  fecha_solicitud: string;
  fecha_aprobacion?: string;
  justificacion?: string;
  documento?: File;
  
  // Relaciones
  solicitud?: Solicitud;
  trabajador?: Trabajador;
  tipo_licencia?: TipoLicencia;
}

export type CreateLicenciaDTO = Omit<Licencia, 'id' | 'created_at' | 'updated_at' | 'trabajador' | 'tipo_licencia'>;
export type UpdateLicenciaDTO = Partial<CreateLicenciaDTO>; 