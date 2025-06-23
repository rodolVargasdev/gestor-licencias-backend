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

            // Obtener el año actual
            const anioActual = new Date().getFullYear();

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

                // Valor máximo en la unidad correcta
                const valorMaximo = tipoLicencia.duracion_maxima;

                if (!disponibilidad) {
                    // Si no existe, crear una nueva disponibilidad
                    disponibilidad = this.disponibilidadRepository.create({
                        trabajador_id: trabajadorId,
                        tipo_licencia_id: tipoLicencia.id,
                        dias_disponibles: valorMaximo, // Puede ser horas o días según la unidad
                        dias_usados: 0,
                        dias_restantes: valorMaximo
                    });
                    await this.disponibilidadRepository.save(disponibilidad);
                }

                // Calcular usados en la unidad correcta
                const licenciasActivas = trabajador.licencias.filter(licencia => 
                    licencia.tipo_licencia_id === tipoLicencia.id && 
                    licencia.estado === 'ACTIVA' &&
                    licencia.afecta_disponibilidad === true
                );

                let usados = 0;
                if (tipoLicencia.unidad_control === 'horas') {
                    // Para licencias por horas, usar el campo horas_totales
                    usados = licenciasActivas.reduce((total, licencia) => {
                        return total + (parseFloat(licencia.horas_totales) || 0);
                    }, 0);
                } else {
                    usados = licenciasActivas.reduce((total, licencia) => {
                        const inicio = new Date(licencia.fecha_inicio);
                        const fin = new Date(licencia.fecha_fin);
                        return total + (Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1); // días
                    }, 0);
                }

                // Calcular días restantes
                const diasDisponibles = parseFloat(disponibilidad.dias_disponibles) || 0;
                disponibilidad.dias_usados = usados;
                disponibilidad.dias_restantes = diasDisponibles - usados;

                // Lógica especial para licencias sin periodo de control (por evento)
                if (tipoLicencia.periodo_control === 'ninguno') {
                    disponibilidad.cantidad_registros = licenciasActivas.length;
                    // Si la duración máxima es 0, no hay un "banco" de días, por lo que la disponibilidad es informativa.
                    if (tipoLicencia.duracion_maxima === 0) {
                        disponibilidad.dias_disponibles = 0;
                        disponibilidad.dias_restantes = 0;
                    }
                }
                await this.disponibilidadRepository.save(disponibilidad);

                return disponibilidad;
            }));

            return disponibilidades;
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
                relations: ['trabajador', 'licencia', 'solicitud'],
                order: { fecha: 'DESC' }
            });
        } catch (error) {
            throw new Error(`Error al obtener la disponibilidad por código: ${error.message}`);
        }
    }
}

module.exports = new DisponibilidadService(); 