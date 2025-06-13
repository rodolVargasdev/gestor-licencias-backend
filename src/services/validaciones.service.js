const { AppDataSource } = require('../config/database');
const Validacion = require('../models/validacion.model');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');

class ValidacionesService {
    constructor() {
        this.validacionesRepository = AppDataSource.getRepository(Validacion);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
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
                relations: ['solicitud', 'validador']
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

            // Si se está actualizando el estado, registrar la fecha de validación
            if (validacionData.estado && validacionData.estado !== validacion.estado) {
                validacionData.fecha_validacion = new Date();
            }

            Object.assign(validacion, validacionData);
            return await this.validacionesRepository.save(validacion);
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