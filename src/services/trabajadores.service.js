const { AppDataSource } = require('../config/database');
const Trabajador = require('../models/trabajador.model');
const Licencia = require('../models/licencia.model');
const { Between } = require('typeorm');

class TrabajadoresService {
    constructor() {
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
    }

    async create(trabajadorData) {
        try {
            const trabajador = this.trabajadoresRepository.create(trabajadorData);
            const savedTrabajador = await this.trabajadoresRepository.save(trabajador);

            // Inicializar disponibilidad para todos los tipos de licencia activos
            const tipoLicenciaRepo = AppDataSource.getRepository('TipoLicencia');
            const disponibilidadRepo = AppDataSource.getRepository('Disponibilidad');
            const tipos = await tipoLicenciaRepo.find({ where: { activo: true } });
            for (const tipo of tipos) {
                // Verificar si ya existe
                const existe = await disponibilidadRepo.findOne({
                    where: {
                        trabajador_id: savedTrabajador.id,
                        tipo_licencia_id: tipo.id
                    }
                });
                if (!existe) {
                    await disponibilidadRepo.save({
                        trabajador_id: savedTrabajador.id,
                        tipo_licencia_id: tipo.id,
                        dias_disponibles: tipo.duracion_maxima,
                        dias_usados: 0,
                        dias_restantes: tipo.duracion_maxima
                    });
                }
            }
            return savedTrabajador;
        } catch (error) {
            throw new Error(`Error al crear el trabajador: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.trabajadoresRepository.find({
                relations: ['licencias', 'departamento', 'puesto']
            });
        } catch (error) {
            throw new Error(`Error al obtener los trabajadores: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id },
                relations: ['licencias', 'departamento', 'puesto']
            });

            if (!trabajador) {
                throw new Error('Trabajador no encontrado');
            }

            return trabajador;
        } catch (error) {
            throw new Error(`Error al obtener el trabajador: ${error.message}`);
        }
    }

    async update(id, trabajadorData) {
        try {
            const trabajador = await this.findById(id);
            Object.assign(trabajador, trabajadorData);
            return await this.trabajadoresRepository.save(trabajador);
        } catch (error) {
            throw new Error(`Error al actualizar el trabajador: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const trabajador = await this.findById(id);
            return await this.trabajadoresRepository.remove(trabajador);
        } catch (error) {
            throw new Error(`Error al eliminar el trabajador: ${error.message}`);
        }
    }

    async findByTipoPersonal(tipoPersonal) {
        try {
            return await this.trabajadoresRepository.find({
                where: { tipo_personal: tipoPersonal },
                relations: ['licencias', 'departamento', 'puesto']
            });
        } catch (error) {
            throw new Error(`Error al obtener los trabajadores por tipo: ${error.message}`);
        }
    }

    async findByDepartamento(departamentoId) {
        try {
            return await this.trabajadoresRepository.find({
                where: { departamento_id: departamentoId },
                relations: ['licencias', 'departamento', 'puesto']
            });
        } catch (error) {
            throw new Error(`Error al obtener los trabajadores por departamento: ${error.message}`);
        }
    }

    async getLicenciasActivas(trabajadorId) {
        try {
            const fechaActual = new Date();
            return await this.licenciasRepository.find({
                where: {
                    trabajador_id: trabajadorId,
                    fecha_inicio: LessThanOrEqual(fechaActual),
                    fecha_fin: MoreThanOrEqual(fechaActual),
                    estado: 'aprobada'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias activas: ${error.message}`);
        }
    }

    async getLicenciasPorPeriodo(trabajadorId, fechaInicio, fechaFin) {
        try {
            return await this.licenciasRepository.find({
                where: {
                    trabajador_id: trabajadorId,
                    fecha_inicio: Between(fechaInicio, fechaFin)
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias por periodo: ${error.message}`);
        }
    }

    async findByCodigo(codigo) {
        try {
            return await this.trabajadoresRepository.findOne({
                where: { codigo },
                relations: ['licencias', 'departamento', 'puesto']
            });
        } catch (error) {
            throw new Error(`Error al buscar trabajador por código: ${error.message}`);
        }
    }
}

module.exports = new TrabajadoresService(); 