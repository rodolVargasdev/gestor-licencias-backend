export interface Puesto {
  id: number;
  nombre: string;
  descripcion?: string;
  departamentoId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePuestoDTO {
  nombre: string;
  descripcion?: string;
  departamentoId?: number;
}

export interface UpdatePuestoDTO {
  nombre?: string;
  descripcion?: string;
  departamentoId?: number;
} 