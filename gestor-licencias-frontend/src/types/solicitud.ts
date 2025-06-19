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
  tipo_olvido_marcacion?: 'ENTRADA' | 'SALIDA';
  fecha_no_asiste?: string;
  fecha_si_asiste?: string;
  trabajador_cambio_id?: string;
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
}

export type CreateSolicitudDTO = Omit<Solicitud, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSolicitudDTO = Partial<CreateSolicitudDTO>; 