const { AppDataSource } = require('../config/database');
const Licencia = require('../models/licencia.model');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const ControlLimite = require('../models/control-limite.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

class LicenciasService {
    constructor() {
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.controlLimitesRepository = AppDataSource.getRepository(ControlLimite);
    }

    async create(licenciaData) {
        try {
            // Verificar si la solicitud existe y está aprobada
            const solicitud = await this.solicitudesRepository.findOne({
                where: { id: licenciaData.solicitud_id },
                relations: ['tipo_licencia']
            });

            if (!solicitud) {
                throw new Error('La solicitud no existe');
            }

            if (solicitud.estado !== 'APROBADA') {
                throw new Error('La solicitud debe estar aprobada para crear una licencia');
            }

            // Verificar si ya existe una licencia para esta solicitud
            const licenciaExistente = await this.licenciasRepository.findOne({
                where: { solicitud_id: licenciaData.solicitud_id }
            });

            if (licenciaExistente) {
                throw new Error('Ya existe una licencia para esta solicitud');
            }

            // Copiar datos de la solicitud
            licenciaData.trabajador_id = solicitud.trabajador_id;
            licenciaData.tipo_licencia_id = solicitud.tipo_licencia_id;
            licenciaData.fecha_inicio = solicitud.fecha_inicio;
            licenciaData.fecha_fin = solicitud.fecha_fin;
            licenciaData.dias_habiles = solicitud.dias_habiles;
            licenciaData.dias_calendario = solicitud.dias_calendario;
            licenciaData.dias_totales = solicitud.dias_solicitados;
            licenciaData.estado = 'ACTIVA';

            // Actualizar el control de límites
            const controlLimite = await this.controlLimitesRepository.findOne({
                where: {
                    trabajador_id: solicitud.trabajador_id,
                    tipo_licencia_id: solicitud.tipo_licencia_id,
                    anio: new Date(solicitud.fecha_inicio).getFullYear()
                }
            });

            if (!controlLimite) {
                throw new Error('No existe un control de límite para este trabajador y tipo de licencia');
            }

            controlLimite.dias_utilizados += solicitud.dias_solicitados;
            controlLimite.dias_disponibles = controlLimite.dias_totales - controlLimite.dias_utilizados;
            await this.controlLimitesRepository.save(controlLimite);

            const licencia = this.licenciasRepository.create(licenciaData);
            return await this.licenciasRepository.save(licencia);
        } catch (error) {
            throw new Error(`Error al crear la licencia: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.licenciasRepository.find({
                relations: ['solicitud', 'trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const licencia = await this.licenciasRepository.findOne({
                where: { id },
                relations: ['solicitud', 'trabajador', 'tipo_licencia']
            });

            if (!licencia) {
                throw new Error('Licencia no encontrada');
            }

            return licencia;
        } catch (error) {
            throw new Error(`Error al obtener la licencia: ${error.message}`);
        }
    }

    async update(id, licenciaData) {
        try {
            const licencia = await this.findById(id);

            // Si se está cancelando la licencia
            if (licenciaData.estado === 'CANCELADA' && licencia.estado !== 'CANCELADA') {
                licenciaData.fecha_cancelacion = new Date();

                // Restaurar días en el control de límites
                const controlLimite = await this.controlLimitesRepository.findOne({
                    where: {
                        trabajador_id: licencia.trabajador_id,
                        tipo_licencia_id: licencia.tipo_licencia_id,
                        anio: new Date(licencia.fecha_inicio).getFullYear()
                    }
                });

                if (controlLimite) {
                    controlLimite.dias_utilizados -= licencia.dias_totales;
                    controlLimite.dias_disponibles = controlLimite.dias_totales - controlLimite.dias_utilizados;
                    await this.controlLimitesRepository.save(controlLimite);
                }
            }

            Object.assign(licencia, licenciaData);
            return await this.licenciasRepository.save(licencia);
        } catch (error) {
            throw new Error(`Error al actualizar la licencia: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const licencia = await this.findById(id);
            return await this.licenciasRepository.remove(licencia);
        } catch (error) {
            throw new Error(`Error al eliminar la licencia: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            return await this.licenciasRepository.find({
                where: { trabajador_id: trabajadorId },
                relations: ['tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias del trabajador: ${error.message}`);
        }
    }

    async findByTipoLicencia(tipoLicenciaId) {
        try {
            return await this.licenciasRepository.find({
                where: { tipo_licencia_id: tipoLicenciaId },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias del tipo de licencia: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
            return await this.licenciasRepository.find({
                where: { estado },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias por estado: ${error.message}`);
        }
    }

    async findBySolicitud(solicitudId) {
        try {
            return await this.licenciasRepository.findOne({
                where: { solicitud_id: solicitudId },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener la licencia de la solicitud: ${error.message}`);
        }
    }

    async findByFecha(fechaInicio, fechaFin) {
        try {
            return await this.licenciasRepository.find({
                where: {
                    fecha_inicio: Between(fechaInicio, fechaFin)
                },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias por fecha: ${error.message}`);
        }
    }
}

module.exports = new LicenciasService(); 