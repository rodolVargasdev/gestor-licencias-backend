export interface Departamento {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartamentoDTO {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateDepartamentoDTO {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
} 