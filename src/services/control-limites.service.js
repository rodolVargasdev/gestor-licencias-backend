const { AppDataSource } = require('../config/database');
const ControlLimite = require('../models/control-limite.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');

class ControlLimitesService {
    constructor() {
        this.controlLimitesRepository = AppDataSource.getRepository(ControlLimite);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
    }

    async create(controlLimiteData) {
        try {
            // Verificar si el trabajador existe
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id: controlLimiteData.trabajador_id }
            });

            if (!trabajador) {
                throw new Error('El trabajador no existe');
            }

            // Verificar si el tipo de licencia existe
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({
                where: { id: controlLimiteData.tipo_licencia_id }
            });

            if (!tipoLicencia) {
                throw new Error('El tipo de licencia no existe');
            }

            // Verificar si ya existe un control de límite para el mismo trabajador, tipo de licencia y año
            const controlExistente = await this.controlLimitesRepository.findOne({
                where: {
                    trabajador_id: controlLimiteData.trabajador_id,
                    tipo_licencia_id: controlLimiteData.tipo_licencia_id,
                    anio: controlLimiteData.anio
                }
            });

            if (controlExistente) {
                throw new Error('Ya existe un control de límite para este trabajador, tipo de licencia y año');
            }

            // Calcular días disponibles
            controlLimiteData.dias_disponibles = controlLimiteData.dias_totales - controlLimiteData.dias_utilizados;

            const controlLimite = this.controlLimitesRepository.create(controlLimiteData);
            return await this.controlLimitesRepository.save(controlLimite);
        } catch (error) {
            throw new Error(`Error al crear el control de límite: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.controlLimitesRepository.find({
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener los controles de límites: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const controlLimite = await this.controlLimitesRepository.findOne({
                where: { id },
                relations: ['trabajador', 'tipo_licencia']
            });

            if (!controlLimite) {
                throw new Error('Control de límite no encontrado');
            }

            return controlLimite;
        } catch (error) {
            throw new Error(`Error al obtener el control de límite: ${error.message}`);
        }
    }

    async update(id, controlLimiteData) {
        try {
            const controlLimite = await this.findById(id);

            // Si se actualizan los días totales o utilizados, recalcular días disponibles
            if (controlLimiteData.dias_totales !== undefined || controlLimiteData.dias_utilizados !== undefined) {
                const diasTotales = controlLimiteData.dias_totales || controlLimite.dias_totales;
                const diasUtilizados = controlLimiteData.dias_utilizados || controlLimite.dias_utilizados;
                controlLimiteData.dias_disponibles = diasTotales - diasUtilizados;
            }

            Object.assign(controlLimite, controlLimiteData);
            return await this.controlLimitesRepository.save(controlLimite);
        } catch (error) {
            throw new Error(`Error al actualizar el control de límite: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const controlLimite = await this.findById(id);
            return await this.controlLimitesRepository.remove(controlLimite);
        } catch (error) {
            throw new Error(`Error al eliminar el control de límite: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            return await this.controlLimitesRepository.find({
                where: { trabajador_id: trabajadorId },
                relations: ['tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener los controles de límites del trabajador: ${error.message}`);
        }
    }

    async findByTipoLicencia(tipoLicenciaId) {
        try {
            return await this.controlLimitesRepository.find({
                where: { tipo_licencia_id: tipoLicenciaId },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener los controles de límites del tipo de licencia: ${error.message}`);
        }
    }

    async findByAnio(anio) {
        try {
            return await this.controlLimitesRepository.find({
                where: { anio },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener los controles de límites del año: ${error.message}`);
        }
    }
}

module.exports = new ControlLimitesService(); 