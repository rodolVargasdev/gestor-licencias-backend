export interface Solicitud {
  id?: number;
  trabajador_id: number;
  tipo_licencia_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  justificacion?: string;
  documento?: File;
  dias_totales?: number;
  dias_habiles?: number;
  dias_calendario?: number;
  observaciones?: string;
}

export type CreateSolicitudDTO = Omit<Solicitud, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSolicitudDTO = Partial<CreateSolicitudDTO>; 