const { AppDataSource } = require('../config/database');
const AuditoriaSolicitud = require('../models/auditoria-solicitud.model');
const Solicitud = require('../models/solicitud.model');

class AuditoriaSolicitudesService {
    constructor() {
        this.auditoriaRepository = AppDataSource.getRepository(AuditoriaSolicitud);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
    }

    async create(auditoriaData) {
        try {
            // Verificar si la solicitud existe
            const solicitud = await this.solicitudesRepository.findOne({
                where: { id: auditoriaData.solicitud_id }
            });

            if (!solicitud) {
                throw new Error('La solicitud no existe');
            }

            const auditoria = this.auditoriaRepository.create(auditoriaData);
            return await this.auditoriaRepository.save(auditoria);
        } catch (error) {
            throw new Error(`Error al crear el registro de auditoría: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.auditoriaRepository.find({
                relations: ['solicitud', 'usuario'],
                order: {
                    fecha_cambio: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de auditoría: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const auditoria = await this.auditoriaRepository.findOne({
                where: { id },
                relations: ['solicitud', 'usuario']
            });

            if (!auditoria) {
                throw new Error('Registro de auditoría no encontrado');
            }

            return auditoria;
        } catch (error) {
            throw new Error(`Error al obtener el registro de auditoría: ${error.message}`);
        }
    }

    async findBySolicitud(solicitudId) {
        try {
            return await this.auditoriaRepository.find({
                where: { solicitud_id: solicitudId },
                relations: ['usuario'],
                order: {
                    fecha_cambio: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de auditoría de la solicitud: ${error.message}`);
        }
    }

    async findByUsuario(usuarioId) {
        try {
            return await this.auditoriaRepository.find({
                where: { usuario_id: usuarioId },
                relations: ['solicitud'],
                order: {
                    fecha_cambio: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de auditoría del usuario: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
            return await this.auditoriaRepository.find({
                where: { estado_nuevo: estado },
                relations: ['solicitud', 'usuario'],
                order: {
                    fecha_cambio: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de auditoría por estado: ${error.message}`);
        }
    }

    async findByFecha(fechaInicio, fechaFin) {
        try {
            return await this.auditoriaRepository.find({
                where: {
                    fecha_cambio: Between(fechaInicio, fechaFin)
                },
                relations: ['solicitud', 'usuario'],
                order: {
                    fecha_cambio: 'DESC'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de auditoría por fecha: ${error.message}`);
        }
    }
}

module.exports = new AuditoriaSolicitudesService(); 