const { AppDataSource } = require('../config/database');
const Disponibilidad = require('../models/disponibilidad.model');
const Trabajador = require('../models/trabajador.model');
const Licencia = require('../models/licencia.model');
const Solicitud = require('../models/solicitud.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

class DisponibilidadService {
    constructor() {
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
    }

    async findAll() {
        try {
            return await this.disponibilidadRepository.find({
                relations: ['trabajador', 'tipo_licencia'],
                order: {
                    trabajador: {
                        nombre_completo: 'ASC'
                    },
                    tipo_licencia: {
                        nombre: 'ASC'
                    }
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
                relations: ['trabajador', 'tipo_licencia']
            });

            if (!disponibilidad) {
                throw new Error('Registro de disponibilidad no encontrado');
            }

            return disponibilidad;
        } catch (error) {
            throw new Error(`Error al obtener el registro de disponibilidad: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            // Buscar el trabajador
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id: trabajadorId },
                relations: ['licencias']
            });

            if (!trabajador) {
                throw new Error('Trabajador no encontrado');
            }

            // Obtener todos los tipos de licencia activos
            const tiposLicencia = await this.tiposLicenciasRepository.find({
                where: { activo: true }
            });

            // Para cada tipo de licencia, generar o actualizar la disponibilidad
            const disponibilidades = await Promise.all(tiposLicencia.map(async (tipoLicencia) => {
                // Buscar si ya existe una disponibilidad para este trabajador y tipo de licencia
                let disponibilidad = await this.disponibilidadRepository.findOne({
                    where: {
                        trabajador_id: trabajadorId,
                        tipo_licencia_id: tipoLicencia.id
                    },
                    relations: ['trabajador', 'tipo_licencia']
                });

                if (!disponibilidad) {
                    // Si no existe, crear una nueva disponibilidad
                    disponibilidad = this.disponibilidadRepository.create({
                        trabajador_id: trabajadorId,
                        tipo_licencia_id: tipoLicencia.id,
                        dias_disponibles: tipoLicencia.duracion_maxima,
                        dias_usados: 0,
                        dias_restantes: tipoLicencia.duracion_maxima
                    });
                    await this.disponibilidadRepository.save(disponibilidad);
                }

                // Calcular días usados basado en las licencias activas
                const licenciasActivas = trabajador.licencias.filter(licencia => 
                    licencia.tipo_licencia_id === tipoLicencia.id && 
                    licencia.estado === 'ACTIVA'
                );

                const diasUsados = licenciasActivas.reduce((total, licencia) => 
                    total + licencia.dias_habiles, 0
                );

                // Actualizar la disponibilidad
                disponibilidad.dias_usados = diasUsados;
                disponibilidad.dias_restantes = disponibilidad.dias_disponibles - diasUsados;
                await this.disponibilidadRepository.save(disponibilidad);

                return disponibilidad;
            }));

            return disponibilidades;
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad del trabajador: ${error.message}`);
        }
    }

    async findByAnio(anio) {
        try {
            return await this.disponibilidadRepository.find({
                relations: ['trabajador', 'tipo_licencia'],
                order: {
                    trabajador: {
                        nombre_completo: 'ASC'
                    },
                    tipo_licencia: {
                        nombre: 'ASC'
                    }
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener los registros de disponibilidad del año: ${error.message}`);
        }
    }

    async findByCodigoTrabajador(codigo) {
        try {
            // Buscar el trabajador por código
            const trabajador = await this.trabajadoresRepository.findOne({ where: { codigo } });
            if (!trabajador) {
                throw new Error('Trabajador no encontrado');
            }
            // Buscar la disponibilidad de ese trabajador
            return await this.disponibilidadRepository.find({
                where: { trabajador_id: trabajador.id },
                relations: ['trabajador', 'tipo_licencia'],
                order: {
                    tipo_licencia: {
                        nombre: 'ASC'
                    }
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener la disponibilidad por código: ${error.message}`);
        }
    }
} 