const { AppDataSource } = require('../config/database');
const TipoLicencia = require('../models/tipo-licencia.model');

class TipoLicenciaService {
    constructor() {
        this.tipoLicenciaRepository = AppDataSource.getRepository('TipoLicencia');
    }

    async create(data) {
        const tipoLicencia = this.tipoLicenciaRepository.create(data);
        const savedTipoLicencia = await this.tipoLicenciaRepository.save(tipoLicencia);

        // Inicializar disponibilidad para todos los trabajadores existentes
        const trabajadorRepo = AppDataSource.getRepository('Trabajador');
        const disponibilidadRepo = AppDataSource.getRepository('Disponibilidad');
        const trabajadores = await trabajadorRepo.find();
        for (const trabajador of trabajadores) {
            // Verificar si ya existe
            const existe = await disponibilidadRepo.findOne({
                where: {
                    trabajador_id: trabajador.id,
                    tipo_licencia_id: savedTipoLicencia.id
                }
            });
            if (!existe) {
                await disponibilidadRepo.save({
                    trabajador_id: trabajador.id,
                    tipo_licencia_id: savedTipoLicencia.id,
                    dias_disponibles: savedTipoLicencia.duracion_maxima,
                    dias_usados: 0,
                    dias_restantes: savedTipoLicencia.duracion_maxima
                });
            }
        }
        return savedTipoLicencia;
    }

    async findAll() {
        return await this.tipoLicenciaRepository.find({
            where: { activo: true },
            order: { nombre: 'ASC' }
        });
    }

    async findById(id) {
        return await this.tipoLicenciaRepository.findOneBy({ id });
    }

    async update(id, data) {
        const tipoLicencia = await this.findById(id);
        if (!tipoLicencia) return null;
        
        Object.assign(tipoLicencia, data);
        return await this.tipoLicenciaRepository.save(tipoLicencia);
    }

    async delete(id) {
        const tipoLicencia = await this.findById(id);
        if (!tipoLicencia) return null;
        
        tipoLicencia.activo = false;
        await this.tipoLicenciaRepository.save(tipoLicencia);
        return true;
    }

    async findByDepartamento(departamentoId) {
        return await this.tipoLicenciaRepository.find({
            where: {
                activo: true,
                aplica_departamento: true,
                departamentos_aplicables: { $in: [departamentoId] }
            },
            order: { nombre: 'ASC' }
        });
    }

    async findByCargo(cargoId) {
        return await this.tipoLicenciaRepository.find({
            where: {
                activo: true,
                aplica_cargo: true,
                cargos_aplicables: { $in: [cargoId] }
            },
            order: { nombre: 'ASC' }
        });
    }

    async findByTipoPersonal(tipoPersonalId) {
        return await this.tipoLicenciaRepository.find({
            where: {
                activo: true,
                aplica_tipo_personal: true,
                tipos_personal_aplicables: { $in: [tipoPersonalId] }
            },
            order: { nombre: 'ASC' }
        });
    }
}

module.exports = { TipoLicenciaService }; 