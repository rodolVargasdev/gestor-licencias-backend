import type { Trabajador } from './trabajador';
import type { TipoLicencia } from './tipoLicencia';

export interface DisponibilidadTrabajador {
  id: number;
  trabajador: Trabajador;
  tipo_licencia: TipoLicencia;
  dias_disponibles: number;
  dias_usados: number;
  dias_restantes: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
} 