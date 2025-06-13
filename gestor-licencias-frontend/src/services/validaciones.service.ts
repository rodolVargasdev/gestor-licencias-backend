import { api } from '../config/axios';
import { API_ROUTES } from '../constants/api';
import { handleApiError } from '../utils/errorHandler';
import type { Validacion, CreateValidacionDTO, UpdateValidacionDTO } from '../types/validacion';

class ValidacionesService {
  async getAll() {
    try {
      const response = await api.get<Validacion[]>(API_ROUTES.VALIDACIONES.BASE);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getById(id: number) {
    try {
      const response = await api.get<Validacion>(API_ROUTES.VALIDACIONES.BY_ID(id));
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async create(data: CreateValidacionDTO) {
    try {
      const response = await api.post<Validacion>(API_ROUTES.VALIDACIONES.BASE, data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async update(id: number, data: UpdateValidacionDTO) {
    try {
      const response = await api.put<Validacion>(API_ROUTES.VALIDACIONES.BY_ID(id), data);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async delete(id: number) {
    try {
      await api.delete(API_ROUTES.VALIDACIONES.BY_ID(id));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Métodos adicionales específicos para validaciones
  async getByTipoLicencia(tipoLicenciaId: number) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA(tipoLicenciaId)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTrabajador(trabajadorId: number) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TRABAJADOR(trabajadorId)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByEstado(estado: string) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_ESTADO(estado)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByFechaInicio(fechaInicio: string) {
    return api.get<Validacion[]>(`${API_ROUTES.VALIDACIONES.BASE}/fecha-inicio/${fechaInicio}`);
  }

  async getByFechaFin(fechaFin: string) {
    return api.get<Validacion[]>(`${API_ROUTES.VALIDACIONES.BASE}/fecha-fin/${fechaFin}`);
  }

  async getByRangoFechas(fechaInicio: string, fechaFin: string) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_RANGO_FECHAS(fechaInicio, fechaFin)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTipoLicenciaAndEstado(tipoLicenciaId: number, estado: string) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA_AND_ESTADO(tipoLicenciaId, estado)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTrabajadorAndEstado(trabajadorId: number, estado: string) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TRABAJADOR_AND_ESTADO(trabajadorId, estado)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTipoLicenciaAndTrabajador(tipoLicenciaId: number, trabajadorId: number) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA_AND_TRABAJADOR(tipoLicenciaId, trabajadorId)
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTipoLicenciaAndTrabajadorAndEstado(
    tipoLicenciaId: number,
    trabajadorId: number,
    estado: string
  ) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA_AND_TRABAJADOR_AND_ESTADO(
          tipoLicenciaId,
          trabajadorId,
          estado
        )
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTipoLicenciaAndRangoFechas(
    tipoLicenciaId: number,
    fechaInicio: string,
    fechaFin: string
  ) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA_AND_RANGO_FECHAS(
          tipoLicenciaId,
          fechaInicio,
          fechaFin
        )
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTrabajadorAndRangoFechas(
    trabajadorId: number,
    fechaInicio: string,
    fechaFin: string
  ) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TRABAJADOR_AND_RANGO_FECHAS(
          trabajadorId,
          fechaInicio,
          fechaFin
        )
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTipoLicenciaAndTrabajadorAndRangoFechas(
    tipoLicenciaId: number,
    trabajadorId: number,
    fechaInicio: string,
    fechaFin: string
  ) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA_AND_TRABAJADOR_AND_RANGO_FECHAS(
          tipoLicenciaId,
          trabajadorId,
          fechaInicio,
          fechaFin
        )
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getByTipoLicenciaAndTrabajadorAndEstadoAndRangoFechas(
    tipoLicenciaId: number,
    trabajadorId: number,
    estado: string,
    fechaInicio: string,
    fechaFin: string
  ) {
    try {
      const response = await api.get<Validacion[]>(
        API_ROUTES.VALIDACIONES.BY_TIPO_LICENCIA_AND_TRABAJADOR_AND_ESTADO_AND_RANGO_FECHAS(
          tipoLicenciaId,
          trabajadorId,
          estado,
          fechaInicio,
          fechaFin
        )
      );
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const validacionesService = new ValidacionesService(); 