import type { TipoLicencia } from './tipoLicencia';

export interface ControlLimite {
  id: number;
  tipo_licencia_id: number;
  tipo_licencia: TipoLicencia;
  anio: number;
  limite_mensual: number;
  limite_anual: number;
}

export interface CreateControlLimiteDTO {
  tipo_licencia_id: number;
  anio: number;
  limite_mensual: number;
  limite_anual: number;
}

export interface UpdateControlLimiteDTO extends CreateControlLimiteDTO {} 