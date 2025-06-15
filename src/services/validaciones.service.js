const { AppDataSource } = require('../config/database');
const Validacion = require('../models/validacion.model');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const Disponibilidad = require('../models/disponibilidad.model');
const Licencia = require('../models/licencia.model');

class ValidacionesService {
    constructor() {
        this.validacionesRepository = AppDataSource.getRepository(Validacion);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
    }

    async create(validacionData) {
        try {
            // Verificar si la solicitud existe
            const solicitud = await this.solicitudesRepository.findOne({
                where: { id: validacionData.solicitud_id }
            });

            if (!solicitud) {
                throw new Error('La solicitud no existe');
            }

            // Verificar si el validador existe
            const validador = await this.trabajadoresRepository.findOne({
                where: { id: validacionData.validado_por }
            });

            if (!validador) {
                throw new Error('El validador no existe');
            }

            // Verificar si ya existe una validación para esta solicitud
            const validacionExistente = await this.validacionesRepository.findOne({
                where: { solicitud_id: validacionData.solicitud_id }
            });

            if (validacionExistente) {
                throw new Error('Ya existe una validación para esta solicitud');
            }

            const validacion = this.validacionesRepository.create(validacionData);
            return await this.validacionesRepository.save(validacion);
        } catch (error) {
            throw new Error(`Error al crear la validación: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.validacionesRepository.find({
                relations: [
                    'solicitud',
                    'solicitud.trabajador',
                    'solicitud.tipo_licencia',
                    'validador'
                ]
            });
        } catch (error) {
            throw new Error(`Error al obtener las validaciones: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const validacion = await this.validacionesRepository.findOne({
                where: { id },
                relations: ['solicitud', 'validador']
            });

            if (!validacion) {
                throw new Error('Validación no encontrada');
            }

            return validacion;
        } catch (error) {
            throw new Error(`Error al obtener la validación: ${error.message}`);
        }
    }

    async update(id, validacionData) {
        try {
            const validacion = await this.findById(id);
            const solicitud = await this.solicitudesRepository.findOne({
                where: { id: validacion.solicitud_id },
                relations: ['tipo_licencia']
            });

            if (!solicitud) {
                throw new Error('La solicitud asociada no existe');
            }

            let disponibilidadActualizada = null;

            // Si se está actualizando el estado, registrar la fecha de validación
            if (validacionData.estado && validacionData.estado !== validacion.estado) {
                validacionData.fecha_validacion = new Date();

                // Si se está aprobando la validación
                if (validacionData.estado === 'APROBADA') {
                    // 1. Actualizar la solicitud a APROBADA
                    solicitud.estado = 'APROBADA';
                    solicitud.fecha_aprobacion = new Date();
                    await this.solicitudesRepository.save(solicitud);

                    // 2. Buscar o crear registro de disponibilidad
                    let disponibilidad = await this.disponibilidadRepository.findOne({
                        where: {
                            trabajador_id: solicitud.trabajador_id,
                            tipo_licencia_id: solicitud.tipo_licencia_id
                        }
                    });

                    if (!disponibilidad) {
                        disponibilidad = this.disponibilidadRepository.create({
                            trabajador_id: solicitud.trabajador_id,
                            tipo_licencia_id: solicitud.tipo_licencia_id,
                            dias_disponibles: solicitud.tipo_licencia.duracion_maxima,
                            dias_usados: 0,
                            dias_restantes: solicitud.tipo_licencia.duracion_maxima
                        });
                    }

                    // 3. Actualizar disponibilidad (permitiendo números negativos)
                    disponibilidad.dias_usados += solicitud.dias_habiles;
                    disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
                    disponibilidadActualizada = await this.disponibilidadRepository.save(disponibilidad);

                    // 4. Crear la licencia
                    const licencia = this.licenciasRepository.create({
                        solicitud_id: solicitud.id,
                        trabajador_id: solicitud.trabajador_id,
                        tipo_licencia_id: solicitud.tipo_licencia_id,
                        fecha_inicio: solicitud.fecha_inicio,
                        fecha_fin: solicitud.fecha_fin,
                        dias_habiles: solicitud.dias_habiles,
                        dias_calendario: solicitud.dias_calendario,
                        dias_totales: solicitud.dias_solicitados,
                        estado: 'ACTIVA'
                    });
                    await this.licenciasRepository.save(licencia);
                }
            }

            Object.assign(validacion, validacionData);
            const validacionActualizada = await this.validacionesRepository.save(validacion);

            // Devolver la validación actualizada junto con la información de disponibilidad si se aprobó
            return {
                ...validacionActualizada,
                disponibilidad: disponibilidadActualizada
            };
        } catch (error) {
            throw new Error(`Error al actualizar la validación: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const validacion = await this.findById(id);
            return await this.validacionesRepository.remove(validacion);
        } catch (error) {
            throw new Error(`Error al eliminar la validación: ${error.message}`);
        }
    }

    async findBySolicitud(solicitudId) {
        try {
            return await this.validacionesRepository.find({
                where: { solicitud_id: solicitudId },
                relations: ['validador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las validaciones de la solicitud: ${error.message}`);
        }
    }

    async findByValidador(validadorId) {
        try {
            return await this.validacionesRepository.find({
                where: { validado_por: validadorId },
                relations: ['solicitud']
            });
        } catch (error) {
            throw new Error(`Error al obtener las validaciones del validador: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
            return await this.validacionesRepository.find({
                where: { estado },
                relations: ['solicitud', 'validador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las validaciones por estado: ${error.message}`);
        }
    }
}

module.exports = new ValidacionesService(); 