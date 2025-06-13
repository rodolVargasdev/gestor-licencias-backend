import axios from './axios';

export const getReportePorDepartamento = (departamentoId: number, fechaInicio: string, fechaFin: string) =>
  axios.get('/api/reportes/departamento', {
    params: { departamento_id: departamentoId, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });

export const getReportePorTrabajador = (trabajadorId: number, fechaInicio: string, fechaFin: string) =>
  axios.get('/api/reportes/trabajador', {
    params: { trabajador_id: trabajadorId, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });

export const getReportePorTipoLicencia = (tipoLicenciaId: number, fechaInicio: string, fechaFin: string) =>
  axios.get('/api/reportes/tipo-licencia', {
    params: { tipo_licencia_id: tipoLicenciaId, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });

export const getReporteTendencias = (fechaInicio: string, fechaFin: string) =>
  axios.get('/api/reportes/tendencias', {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });

export const getReporteDisponibilidadGlobal = (anio: number, mes?: number) =>
  axios.get('/api/reportes/disponibilidad-global', {
    params: { anio, mes }
  }); 