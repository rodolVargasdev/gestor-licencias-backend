const { AppDataSource } = require('../config/database');
const Licencia = require('../models/licencia.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const ControlLimite = require('../models/control-limite.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

class LicenciasService {
    constructor() {
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.controlLimitesRepository = AppDataSource.getRepository(ControlLimite);
    }

    async create(licenciaData) {
        try {
            // Verificar si el trabajador existe
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id: licenciaData.trabajador_id }
            });

            if (!trabajador) {
                throw new Error('El trabajador no existe');
            }

            // Verificar si el tipo de licencia existe
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({
                where: { id: licenciaData.tipo_licencia_id }
            });

            if (!tipoLicencia) {
                throw new Error('El tipo de licencia no existe');
            }

            // Verificar si ya existe una licencia activa para el mismo período
            const licenciaExistente = await this.licenciasRepository.findOne({
                where: {
                    trabajador_id: licenciaData.trabajador_id,
                    estado: 'ACTIVA',
                    fecha_inicio: LessThanOrEqual(licenciaData.fecha_fin),
                    fecha_fin: MoreThanOrEqual(licenciaData.fecha_inicio)
                }
            });

            if (licenciaExistente) {
                throw new Error('Ya existe una licencia activa para el trabajador en el período especificado');
            }

            // Actualizar el control de límites
            const controlLimite = await this.controlLimitesRepository.findOne({
                where: {
                    trabajador_id: licenciaData.trabajador_id,
                    tipo_licencia_id: licenciaData.tipo_licencia_id,
                    anio: new Date(licenciaData.fecha_inicio).getFullYear()
                }
            });

            if (!controlLimite) {
                throw new Error('No existe un control de límite para este trabajador y tipo de licencia');
            }

            // Verificar si hay días disponibles
            if (controlLimite.dias_disponibles < licenciaData.dias_habiles) {
                throw new Error('No hay suficientes días disponibles para este tipo de licencia');
            }

            // Actualizar el control de límites
            controlLimite.dias_utilizados += licenciaData.dias_habiles;
            controlLimite.dias_disponibles = controlLimite.dias_totales - controlLimite.dias_utilizados;
            await this.controlLimitesRepository.save(controlLimite);

            // Crear la licencia
            const licencia = this.licenciasRepository.create({
                ...licenciaData,
                estado: 'ACTIVA'
            });

            return await this.licenciasRepository.save(licencia);
        } catch (error) {
            throw new Error(`Error al crear la licencia: ${error.message}`);
        }
    }

    // ... resto del código sin cambios ...
} 