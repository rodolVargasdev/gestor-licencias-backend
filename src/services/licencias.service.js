const { AppDataSource } = require('../config/database');
const Licencia = require('../models/licencia.model');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const Disponibilidad = require('../models/disponibilidad.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

class LicenciasService {
    constructor() {
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
    }

    async create(licenciaData) {
        try {
            // Permitir crear licencia directamente, sin solicitud
            // Buscar trabajador y tipo de licencia
            const trabajadorId = licenciaData.trabajador_id;
            const tipoLicenciaId = licenciaData.tipo_licencia_id;
            if (!trabajadorId || !tipoLicenciaId) {
                throw new Error('Faltan datos de trabajador o tipo de licencia');
            }

            // Buscar tipo de licencia para obtener duración máxima
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({ where: { id: tipoLicenciaId } });
            if (!tipoLicencia) {
                throw new Error('El tipo de licencia no existe');
            }

            // Buscar o crear disponibilidad
            let disponibilidad = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: trabajadorId,
                    tipo_licencia_id: tipoLicenciaId
                }
            });
            if (!disponibilidad) {
                disponibilidad = this.disponibilidadRepository.create({
                    trabajador_id: trabajadorId,
                    tipo_licencia_id: tipoLicenciaId,
                    dias_disponibles: tipoLicencia.duracion_maxima,
                    dias_usados: 0,
                    dias_restantes: tipoLicencia.duracion_maxima
                });
            }

            // Actualizar disponibilidad
            disponibilidad.dias_usados += licenciaData.dias_habiles;
            disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
            await this.disponibilidadRepository.save(disponibilidad);

            // Crear la licencia
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

                // Restaurar días en disponibilidad
                const disponibilidad = await this.disponibilidadRepository.findOne({
                    where: {
                        trabajador_id: licencia.trabajador_id,
                        tipo_licencia_id: licencia.tipo_licencia_id
                    }
                });

                if (disponibilidad) {
                    disponibilidad.dias_usados -= licencia.dias_totales;
                    disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
                    await this.disponibilidadRepository.save(disponibilidad);
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

            if (!licencia) {
                throw new Error('La licencia no existe');
            }

            // Actualizar disponibilidad
            const disponibilidad = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: licencia.solicitud.trabajador_id,
                    tipo_licencia_id: licencia.solicitud.tipo_licencia_id
                }
            });

            if (disponibilidad) {
                disponibilidad.dias_usados -= licencia.dias_habiles;
                disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
                await this.disponibilidadRepository.save(disponibilidad);
            }

            await this.licenciasRepository.remove(licencia);
            return true;
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