export const API_ROUTES = {
  // Departamentos
  DEPARTAMENTOS: {
    BASE: '/api/departamentos',
    BY_ID: (id: number) => `/api/departamentos/${id}`
  },

  // Puestos
  PUESTOS: {
    BASE: '/api/puestos',
    BY_ID: (id: number) => `/api/puestos/${id}`
  },

  // Trabajadores
  TRABAJADORES: {
    BASE: '/api/trabajadores',
    BY_ID: (id: number) => `/api/trabajadores/${id}`,
    BY_TIPO: (tipo: string) => `/api/trabajadores/tipo/${tipo}`,
    BY_DEPARTAMENTO: (departamentoId: number) => `/api/trabajadores/departamento/${departamentoId}`,
    LICENCIAS_ACTIVAS: (id: number) => `/api/trabajadores/${id}/licencias/activas`,
    LICENCIAS_PERIODO: (id: number) => `/api/trabajadores/${id}/licencias/periodo`,
    IMPORT: '/api/trabajadores/import'
  },

  // Tipos de Licencias
  TIPOS_LICENCIAS: {
    BASE: '/api/tipos-licencias',
    BY_ID: (id: number) => `/api/tipos-licencias/${id}`
  },

  // Solicitudes
  SOLICITUDES: {
    BASE: '/api/solicitudes',
    BY_ID: (id: number) => `/api/solicitudes/${id}`,
    BY_TRABAJADOR: (trabajadorId: number) => `/api/solicitudes/trabajador/${trabajadorId}`,
  },

  // Licencias
  LICENCIAS: {
    BASE: '/api/licencias',
    BY_ID: (id: number) => `/api/licencias/${id}`
  },

  // Reportes
  REPORTES: {
    BASE: '/api/reportes',
    BY_ID: (id: number) => `/api/reportes/${id}`
  },

  // Control de Límites
  CONTROL_LIMITES: {
    BASE: '/api/control-limites',
    BY_ID: (id: number) => `/api/control-limites/${id}`
  },

  // Validaciones
  VALIDACIONES: {
    BASE: '/api/validaciones',
    BY_ID: (id: number) => `/api/validaciones/${id}`,
    BY_TIPO_LICENCIA: (tipoLicenciaId: number) => `/api/validaciones/tipo-licencia/${tipoLicenciaId}`,
    BY_TRABAJADOR: (trabajadorId: number) => `/api/validaciones/trabajador/${trabajadorId}`,
    BY_ESTADO: (estado: string) => `/api/validaciones/estado/${estado}`,
    BY_FECHA_INICIO: (fechaInicio: string) => `/api/validaciones/fecha-inicio/${fechaInicio}`,
    BY_FECHA_FIN: (fechaFin: string) => `/api/validaciones/fecha-fin/${fechaFin}`,
    BY_RANGO_FECHAS: (fechaInicio: string, fechaFin: string) => 
      `/api/validaciones/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    BY_TIPO_LICENCIA_AND_ESTADO: (tipoLicenciaId: number, estado: string) =>
      `/api/validaciones/tipo-licencia/${tipoLicenciaId}/estado/${estado}`,
    BY_TRABAJADOR_AND_ESTADO: (trabajadorId: number, estado: string) =>
      `/api/validaciones/trabajador/${trabajadorId}/estado/${estado}`,
    BY_TIPO_LICENCIA_AND_TRABAJADOR: (tipoLicenciaId: number, trabajadorId: number) =>
      `/api/validaciones/tipo-licencia/${tipoLicenciaId}/trabajador/${trabajadorId}`,
    BY_TIPO_LICENCIA_AND_TRABAJADOR_AND_ESTADO: (
      tipoLicenciaId: number,
      trabajadorId: number,
      estado: string
    ) => `/api/validaciones/tipo-licencia/${tipoLicenciaId}/trabajador/${trabajadorId}/estado/${estado}`,
    BY_TIPO_LICENCIA_AND_RANGO_FECHAS: (
      tipoLicenciaId: number,
      fechaInicio: string,
      fechaFin: string
    ) => `/api/validaciones/tipo-licencia/${tipoLicenciaId}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    BY_TRABAJADOR_AND_RANGO_FECHAS: (
      trabajadorId: number,
      fechaInicio: string,
      fechaFin: string
    ) => `/api/validaciones/trabajador/${trabajadorId}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    BY_TIPO_LICENCIA_AND_TRABAJADOR_AND_RANGO_FECHAS: (
      tipoLicenciaId: number,
      trabajadorId: number,
      fechaInicio: string,
      fechaFin: string
    ) => `/api/validaciones/tipo-licencia/${tipoLicenciaId}/trabajador/${trabajadorId}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    BY_TIPO_LICENCIA_AND_TRABAJADOR_AND_ESTADO_AND_RANGO_FECHAS: (
      tipoLicenciaId: number,
      trabajadorId: number,
      estado: string,
      fechaInicio: string,
      fechaFin: string
    ) => `/api/validaciones/tipo-licencia/${tipoLicenciaId}/trabajador/${trabajadorId}/estado/${estado}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
  },

  DISPONIBILIDAD: {
    BASE: '/api/disponibilidad',
    BY_ID: (id: number) => `/api/disponibilidad/${id}`
  }
}; 