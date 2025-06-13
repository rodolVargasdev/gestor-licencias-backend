const { AppDataSource } = require('../config/database');
const Disponibilidad = require('../models/disponibilidad.model');
const Trabajador = require('../models/trabajador.model');
const Licencia = require('../models/licencia.model');
const Solicitud = require('../models/solicitud.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

class DisponibilidadService {
    constructor() {
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
    }

    async create(disponibilidadData) {
        try {
            // Verificar si el trabajador existe
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id: disponibilidadData.trabajador_id }
            });

            if (!trabajador) {
                throw new Error('El trabajador no existe');
            }

            // Verificar si ya existe un registro para esa fecha y trabajador
            const registroExistente = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: disponibilidadData.trabajador_id,
                    fecha: disponibilidadData.fecha
                }
            });

            if (registroExistente) {
                throw new Error('Ya existe un registro de disponibilidad para esta fecha y trabajador');
            }

            // Si hay una licencia asociada, verificar que exista
            if (disponibilidadData.licencia_id) {
                const licencia = await this.licenciasRepository.findOne({
                    where: { id: disponibilidadData.licencia_id }
                });

                if (!licencia) {
                    throw new Error('La licencia no existe');
                }
            }

            // Si hay una solicitud asociada, verificar que exista
            if (disponibilidadData.solicitud_id) {
                const solicitud = await this.solicitudesRepository.findOne({
                    where: { id: disponibilidadData.solicitud_id }
                });

                if (!solicitud) {
                    throw new Error('La solicitud no existe');
                }
            }

            const disponibilidad = this.disponibilidadRepository.create(disponibilidadData);
            return await this.disponibilidadRepository.save(disponibilidad);
        } catch (error) {
            throw new Error(`Error al crear el registro de disponibilidad: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.disponibilidadRepository.find({
                relations: ['trabajador', 'licencia', 'solicitud'],
                order: {
                    fecha: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const disponibilidad = await this.disponibilidadRepository.findOne({
                where: { id },
                relations: ['trabajador', 'licencia', 'solicitud']
            });

            if (!disponibilidad) {
                throw new Error('Registro de disponibilidad no encontrado');
            }

            return disponibilidad;
        } catch (error) {
            throw new Error(`Error al obtener el registro de disponibilidad: ${error.message}`);
        }
    }

    async update(id, disponibilidadData) {
        try {
            const disponibilidad = await this.findById(id);

            // Si se está cambiando la disponibilidad a false, verificar que se proporcione un motivo
            if (disponibilidadData.disponible === false && !disponibilidadData.motivo_no_disponible) {
                throw new Error('Debe proporcionar un motivo cuando el trabajador no está disponible');
            }

            Object.assign(disponibilidad, disponibilidadData);
            return await this.disponibilidadRepository.save(disponibilidad);
        } catch (error) {
            throw new Error(`Error al actualizar el registro de disponibilidad: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const disponibilidad = await this.findById(id);
            return await this.disponibilidadRepository.remove(disponibilidad);
        } catch (error) {
            throw new Error(`Error al eliminar el registro de disponibilidad: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            return await this.disponibilidadRepository.find({
                where: { trabajador_id: trabajadorId },
                relations: ['licencia', 'solicitud'],
                order: {
                    fecha: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad del trabajador: ${error.message}`);
        }
    }

    async findByFecha(fecha) {
        try {
            return await this.disponibilidadRepository.find({
                where: { fecha },
                relations: ['trabajador', 'licencia', 'solicitud']
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad por fecha: ${error.message}`);
        }
    }

    async findByRangoFechas(fechaInicio, fechaFin) {
        try {
            return await this.disponibilidadRepository.find({
                where: {
                    fecha: Between(fechaInicio, fechaFin)
                },
                relations: ['trabajador', 'licencia', 'solicitud'],
                order: {
                    fecha: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad por rango de fechas: ${error.message}`);
        }
    }

    async findByDisponibilidad(disponible) {
        try {
            return await this.disponibilidadRepository.find({
                where: { disponible },
                relations: ['trabajador', 'licencia', 'solicitud'],
                order: {
                    fecha: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad por estado: ${error.message}`);
        }
    }

    async verificarDisponibilidad(trabajadorId, fecha) {
        try {
            const disponibilidad = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: trabajadorId,
                    fecha
                }
            });

            return disponibilidad ? disponibilidad.disponible : true;
        } catch (error) {
            throw new Error(`Error al verificar la disponibilidad: ${error.message}`);
        }
    }
}

module.exports = new DisponibilidadService(); 