const { AppDataSource } = require('../config/database');
const Licencia = require('../models/licencia.model');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const ControlLimite = require('../models/control-limite.model');
const Disponibilidad = require('../models/disponibilidad.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

class ReportesService {
    constructor() {
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.controlLimitesRepository = AppDataSource.getRepository(ControlLimite);
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
    }

    async reporteLicenciasPorPeriodo(fechaInicio, fechaFin) {
        try {
            const licencias = await this.licenciasRepository.find({
                where: {
                    fecha_inicio: Between(fechaInicio, fechaFin)
                },
                relations: ['trabajador', 'tipo_licencia', 'solicitud']
            });

            const reporte = {
                total_licencias: licencias.length,
                total_dias: licencias.reduce((sum, lic) => sum + lic.dias_totales, 0),
                por_tipo_licencia: {},
                por_departamento: {},
                por_tipo_personal: {
                    OPERATIVO: 0,
                    ADMINISTRATIVO: 0
                }
            };

            licencias.forEach(licencia => {
                // Agrupar por tipo de licencia
                const tipoLicencia = licencia.tipo_licencia.nombre;
                if (!reporte.por_tipo_licencia[tipoLicencia]) {
                    reporte.por_tipo_licencia[tipoLicencia] = {
                        cantidad: 0,
                        dias_totales: 0
                    };
                }
                reporte.por_tipo_licencia[tipoLicencia].cantidad++;
                reporte.por_tipo_licencia[tipoLicencia].dias_totales += licencia.dias_totales;

                // Agrupar por departamento
                const departamento = licencia.trabajador.departamento?.nombre || 'Sin departamento';
                if (!reporte.por_departamento[departamento]) {
                    reporte.por_departamento[departamento] = {
                        cantidad: 0,
                        dias_totales: 0
                    };
                }
                reporte.por_departamento[departamento].cantidad++;
                reporte.por_departamento[departamento].dias_totales += licencia.dias_totales;

                // Agrupar por tipo de personal
                reporte.por_tipo_personal[licencia.trabajador.tipo_personal]++;
            });

            return reporte;
        } catch (error) {
            throw new Error(`Error al generar el reporte de licencias por período: ${error.message}`);
        }
    }

    async reporteSolicitudesPorEstado(fechaInicio, fechaFin) {
        try {
            const solicitudes = await this.solicitudesRepository.find({
                where: {
                    fecha_solicitud: Between(fechaInicio, fechaFin)
                },
                relations: ['trabajador', 'tipo_licencia']
            });

            const reporte = {
                total_solicitudes: solicitudes.length,
                por_estado: {
                    PENDIENTE: 0,
                    APROBADA: 0,
                    RECHAZADA: 0,
                    CANCELADA: 0
                },
                tiempo_promedio_respuesta: 0,
                por_tipo_licencia: {},
                por_departamento: {}
            };

            let tiempoTotalRespuesta = 0;
            let solicitudesConRespuesta = 0;

            solicitudes.forEach(solicitud => {
                // Contar por estado
                reporte.por_estado[solicitud.estado]++;

                // Calcular tiempo de respuesta
                if (solicitud.fecha_respuesta) {
                    const tiempoRespuesta = new Date(solicitud.fecha_respuesta) - new Date(solicitud.fecha_solicitud);
                    tiempoTotalRespuesta += tiempoRespuesta;
                    solicitudesConRespuesta++;
                }

                // Agrupar por tipo de licencia
                const tipoLicencia = solicitud.tipo_licencia.nombre;
                if (!reporte.por_tipo_licencia[tipoLicencia]) {
                    reporte.por_tipo_licencia[tipoLicencia] = 0;
                }
                reporte.por_tipo_licencia[tipoLicencia]++;

                // Agrupar por departamento
                const departamento = solicitud.trabajador.departamento?.nombre || 'Sin departamento';
                if (!reporte.por_departamento[departamento]) {
                    reporte.por_departamento[departamento] = 0;
                }
                reporte.por_departamento[departamento]++;
            });

            reporte.tiempo_promedio_respuesta = solicitudesConRespuesta > 0 
                ? tiempoTotalRespuesta / solicitudesConRespuesta 
                : 0;

            return reporte;
        } catch (error) {
            throw new Error(`Error al generar el reporte de solicitudes por estado: ${error.message}`);
        }
    }

    async reporteDisponibilidadPorPeriodo(fechaInicio, fechaFin) {
        try {
            const disponibilidad = await this.disponibilidadRepository.find({
                where: {
                    fecha: Between(fechaInicio, fechaFin)
                },
                relations: ['trabajador', 'licencia', 'solicitud']
            });

            const reporte = {
                total_registros: disponibilidad.length,
                dias_disponibles: 0,
                dias_no_disponibles: 0,
                por_departamento: {},
                por_tipo_personal: {
                    OPERATIVO: { disponible: 0, no_disponible: 0 },
                    ADMINISTRATIVO: { disponible: 0, no_disponible: 0 }
                },
                razones_no_disponibilidad: {}
            };

            disponibilidad.forEach(registro => {
                // Contar días disponibles y no disponibles
                if (registro.disponible) {
                    reporte.dias_disponibles++;
                } else {
                    reporte.dias_no_disponibles++;
                    // Contar razones de no disponibilidad
                    const razon = registro.motivo_no_disponible || 'Sin motivo';
                    reporte.razones_no_disponibilidad[razon] = (reporte.razones_no_disponibilidad[razon] || 0) + 1;
                }

                // Agrupar por departamento
                const departamento = registro.trabajador.departamento?.nombre || 'Sin departamento';
                if (!reporte.por_departamento[departamento]) {
                    reporte.por_departamento[departamento] = {
                        disponible: 0,
                        no_disponible: 0
                    };
                }
                if (registro.disponible) {
                    reporte.por_departamento[departamento].disponible++;
                } else {
                    reporte.por_departamento[departamento].no_disponible++;
                }

                // Agrupar por tipo de personal
                const tipoPersonal = registro.trabajador.tipo_personal;
                if (registro.disponible) {
                    reporte.por_tipo_personal[tipoPersonal].disponible++;
                } else {
                    reporte.por_tipo_personal[tipoPersonal].no_disponible++;
                }
            });

            return reporte;
        } catch (error) {
            throw new Error(`Error al generar el reporte de disponibilidad por período: ${error.message}`);
        }
    }

    async reporteLímitesPorTipoLicencia(anio) {
        try {
            const limites = await this.controlLimitesRepository.find({
                where: { anio },
                relations: ['trabajador', 'tipo_licencia']
            });

            const reporte = {
                total_trabajadores: new Set(limites.map(l => l.trabajador_id)).size,
                por_tipo_licencia: {},
                por_departamento: {},
                por_tipo_personal: {
                    OPERATIVO: {
                        dias_totales: 0,
                        dias_utilizados: 0,
                        dias_disponibles: 0
                    },
                    ADMINISTRATIVO: {
                        dias_totales: 0,
                        dias_utilizados: 0,
                        dias_disponibles: 0
                    }
                }
            };

            limites.forEach(limite => {
                // Agrupar por tipo de licencia
                const tipoLicencia = limite.tipo_licencia.nombre;
                if (!reporte.por_tipo_licencia[tipoLicencia]) {
                    reporte.por_tipo_licencia[tipoLicencia] = {
                        dias_totales: 0,
                        dias_utilizados: 0,
                        dias_disponibles: 0,
                        trabajadores: 0
                    };
                }
                reporte.por_tipo_licencia[tipoLicencia].dias_totales += limite.dias_totales;
                reporte.por_tipo_licencia[tipoLicencia].dias_utilizados += limite.dias_utilizados;
                reporte.por_tipo_licencia[tipoLicencia].dias_disponibles += limite.dias_disponibles;
                reporte.por_tipo_licencia[tipoLicencia].trabajadores++;

                // Agrupar por departamento
                const departamento = limite.trabajador.departamento?.nombre || 'Sin departamento';
                if (!reporte.por_departamento[departamento]) {
                    reporte.por_departamento[departamento] = {
                        dias_totales: 0,
                        dias_utilizados: 0,
                        dias_disponibles: 0
                    };
                }
                reporte.por_departamento[departamento].dias_totales += limite.dias_totales;
                reporte.por_departamento[departamento].dias_utilizados += limite.dias_utilizados;
                reporte.por_departamento[departamento].dias_disponibles += limite.dias_disponibles;

                // Agrupar por tipo de personal
                const tipoPersonal = limite.trabajador.tipo_personal;
                reporte.por_tipo_personal[tipoPersonal].dias_totales += limite.dias_totales;
                reporte.por_tipo_personal[tipoPersonal].dias_utilizados += limite.dias_utilizados;
                reporte.por_tipo_personal[tipoPersonal].dias_disponibles += limite.dias_disponibles;
            });

            return reporte;
        } catch (error) {
            throw new Error(`Error al generar el reporte de límites por tipo de licencia: ${error.message}`);
        }
    }
}

module.exports = new ReportesService(); 