export interface Puesto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreatePuestoDTO {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdatePuestoDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
} 