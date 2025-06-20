export interface Trabajador {
  id: number;
  codigo: string;
  nombre_completo: string;
  nombre?: string;
  apellido?: string;
  email: string;
  telefono: string | null;
  departamento_id: number | null;
  puesto_id: number | null;
  tipo_personal: 'OPERATIVO' | 'ADMINISTRATIVO';
  fecha_ingreso: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  departamento?: {
    id: number;
    nombre: string;
  };
  puesto?: {
    id: number;
    nombre: string;
  };
}

export interface CreateTrabajadorDTO {
  codigo: string;
  nombre_completo: string;
  nombre?: string;
  apellido?: string;
  email: string;
  telefono?: string;
  departamento_id: number;
  puesto_id: number;
  tipo_personal: 'OPERATIVO' | 'ADMINISTRATIVO';
  fecha_ingreso: string;
  activo?: boolean;
  departamento?: string;
  cargo?: string;
}

export interface UpdateTrabajadorDTO extends Partial<CreateTrabajadorDTO> {} 