export interface TipoLicencia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_duracion: 'DIAS' | 'HORAS' | 'CANTIDAD';
  periodo_renovacion: 'MENSUAL' | 'ANUAL';
  duracion_maxima: number;
  requiere_justificacion: boolean;
  requiere_aprobacion_especial: boolean;
  requiere_documentacion: boolean;
  pago_haberes: boolean;
  acumulable: boolean;
  transferible: boolean;
  aplica_genero: boolean;
  genero_aplicable: 'M' | 'F' | 'A';
  aplica_antiguedad: boolean;
  antiguedad_minima?: number;
  aplica_edad: boolean;
  edad_minima?: number;
  edad_maxima?: number;
  aplica_departamento: boolean;
  departamentos_aplicables?: string[];
  aplica_cargo: boolean;
  cargos_aplicables?: string[];
  aplica_tipo_personal: boolean;
  tipos_personal_aplicables?: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTipoLicenciaDTO {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_duracion: 'DIAS' | 'HORAS' | 'CANTIDAD';
  periodo_renovacion: 'MENSUAL' | 'ANUAL';
  duracion_maxima: number;
  requiere_justificacion: boolean;
  requiere_aprobacion_especial: boolean;
  requiere_documentacion: boolean;
  pago_haberes: boolean;
  acumulable: boolean;
  transferible: boolean;
  aplica_genero: boolean;
  genero_aplicable: 'M' | 'F' | 'A';
  aplica_antiguedad: boolean;
  antiguedad_minima?: number;
  aplica_edad: boolean;
  edad_minima?: number;
  edad_maxima?: number;
  aplica_departamento: boolean;
  departamentos_aplicables?: string[];
  aplica_cargo: boolean;
  cargos_aplicables?: string[];
  aplica_tipo_personal: boolean;
  tipos_personal_aplicables?: string[];
}

export interface UpdateTipoLicenciaDTO extends Partial<CreateTipoLicenciaDTO> {} 