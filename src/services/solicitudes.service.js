const { AppDataSource } = require('../config/database');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const Disponibilidad = require('../models/disponibilidad.model');
const Licencia = require('../models/licencia.model');

class SolicitudesService {
    constructor() {
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
    }

    async create(solicitudData) {
        try {
            // Verificar si el trabajador existe
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id: solicitudData.trabajador_id }
            });

            if (!trabajador) {
                throw new Error('El trabajador no existe');
            }

            // Verificar si el tipo de licencia existe
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({
                where: { id: solicitudData.tipo_licencia_id }
            });

            if (!tipoLicencia) {
                throw new Error('El tipo de licencia no existe');
            }

            // Calcular días hábiles y calendario
            const diasHabiles = this.calcularDiasHabiles(solicitudData.fecha_inicio, solicitudData.fecha_fin);
            const diasCalendario = this.calcularDiasCalendario(solicitudData.fecha_inicio, solicitudData.fecha_fin);

            solicitudData.dias_habiles = diasHabiles;
            solicitudData.dias_calendario = diasCalendario;
            solicitudData.dias_solicitados = tipoLicencia.goce_salario ? diasHabiles : diasCalendario;

            // Verificar disponibilidad de días
            let disponibilidad = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: solicitudData.trabajador_id,
                    tipo_licencia_id: solicitudData.tipo_licencia_id
                }
            });

            if (!disponibilidad) {
                // Si no existe, crear una nueva disponibilidad
                disponibilidad = this.disponibilidadRepository.create({
                    trabajador_id: solicitudData.trabajador_id,
                    tipo_licencia_id: solicitudData.tipo_licencia_id,
                    dias_disponibles: tipoLicencia.duracion_maxima,
                    dias_usados: 0,
                    dias_restantes: tipoLicencia.duracion_maxima
                });
                await this.disponibilidadRepository.save(disponibilidad);
            }

            const solicitud = this.solicitudesRepository.create(solicitudData);
            const savedSolicitud = await this.solicitudesRepository.save(solicitud);

            // Si la solicitud es APROBADA, crear la licencia y actualizar disponibilidad
            if (savedSolicitud.estado === 'APROBADA') {
                // Actualizar disponibilidad
                disponibilidad.dias_usados += diasHabiles;
                disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
                await this.disponibilidadRepository.save(disponibilidad);

                // Crear la licencia
                const licencia = this.licenciasRepository.create({
                    solicitud_id: savedSolicitud.id,
                    trabajador_id: savedSolicitud.trabajador_id,
                    tipo_licencia_id: savedSolicitud.tipo_licencia_id,
                    fecha_inicio: savedSolicitud.fecha_inicio,
                    fecha_fin: savedSolicitud.fecha_fin,
                    dias_totales: savedSolicitud.dias_solicitados,
                    dias_habiles: savedSolicitud.dias_habiles,
                    dias_calendario: savedSolicitud.dias_calendario,
                    estado: 'ACTIVA',
                    activo: true
                });
                await this.licenciasRepository.save(licencia);
            }

            return savedSolicitud;
        } catch (error) {
            throw new Error(`Error al crear la solicitud: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.solicitudesRepository.find({
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const solicitud = await this.solicitudesRepository.findOne({
                where: { id },
                relations: ['trabajador', 'tipo_licencia']
            });

            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            return solicitud;
        } catch (error) {
            throw new Error(`Error al obtener la solicitud: ${error.message}`);
        }
    }

    async update(id, solicitudData) {
        try {
            const solicitud = await this.findById(id);

            // Si se están actualizando las fechas, recalcular días
            if (solicitudData.fecha_inicio || solicitudData.fecha_fin) {
                const fechaInicio = solicitudData.fecha_inicio || solicitud.fecha_inicio;
                const fechaFin = solicitudData.fecha_fin || solicitud.fecha_fin;

                const diasHabiles = this.calcularDiasHabiles(fechaInicio, fechaFin);
                const diasCalendario = this.calcularDiasCalendario(fechaInicio, fechaFin);

                solicitudData.dias_habiles = diasHabiles;
                solicitudData.dias_calendario = diasCalendario;
                solicitudData.dias_solicitados = solicitud.tipo_licencia.goce_salario ? diasHabiles : diasCalendario;
            }

            Object.assign(solicitud, solicitudData);
            return await this.solicitudesRepository.save(solicitud);
        } catch (error) {
            throw new Error(`Error al actualizar la solicitud: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const solicitud = await this.findById(id);
            return await this.solicitudesRepository.remove(solicitud);
        } catch (error) {
            throw new Error(`Error al eliminar la solicitud: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            return await this.solicitudesRepository.find({
                where: { trabajador_id: trabajadorId },
                relations: ['tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes del trabajador: ${error.message}`);
        }
    }

    async findByTipoLicencia(tipoLicenciaId) {
        try {
            return await this.solicitudesRepository.find({
                where: { tipo_licencia_id: tipoLicenciaId },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes del tipo de licencia: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
            return await this.solicitudesRepository.find({
                where: { estado },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes por estado: ${error.message}`);
        }
    }

    calcularDiasHabiles(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        let diasHabiles = 0;

        for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
            const diaSemana = fecha.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) { // 0 = Domingo, 6 = Sábado
                diasHabiles++;
            }
        }

        return diasHabiles;
    }

    calcularDiasCalendario(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffTime = Math.abs(fin - inicio);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
}

module.exports = new SolicitudesService(); 