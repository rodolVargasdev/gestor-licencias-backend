const { AppDataSource } = require('../config/database');
const Licencia = require('../models/licencia.model');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const Disponibilidad = require('../models/disponibilidad.model');
const { Between, LessThanOrEqual, MoreThanOrEqual } = require('typeorm');

/**
 * Servicio unificado para el manejo de licencias
 * Este servicio maneja tanto la creación directa de licencias como la lógica de disponibilidad
 */
class LicenciasService {
    constructor() {
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
    }

    async create(licenciaData) {
        try {
            const trabajadorId = licenciaData.trabajador_id;
            const tipoLicenciaId = licenciaData.tipo_licencia_id;
            if (!trabajadorId || !tipoLicenciaId) {
                throw new Error('Faltan datos de trabajador o tipo de licencia');
            }

            // Buscar tipo de licencia para obtener configuración
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({ where: { id: tipoLicenciaId } });
            if (!tipoLicencia) {
                throw new Error('El tipo de licencia no existe');
            }

            // Validaciones y lógica especial por tipo de licencia
            // 1. Por horas: calcular diferencia en horas
            let consumo = 1;
            let horasTotales = 0;
            if (tipoLicencia.unidad_control === 'horas') {
                if (!licenciaData.fecha_inicio || !licenciaData.fecha_fin) {
                    throw new Error('Debe ingresar fecha y hora de inicio y fin');
                }
                const inicio = new Date(licenciaData.fecha_inicio);
                const fin = new Date(licenciaData.fecha_fin);
                horasTotales = (fin - inicio) / (1000 * 60 * 60); // horas
                consumo = horasTotales;
                if (consumo <= 0) throw new Error('La fecha/hora de fin debe ser posterior a la de inicio');
                // Agregar horas_totales a los datos de la licencia
                licenciaData.horas_totales = horasTotales;
            }
            // 2. Por días: calcular diferencia en días
            else if (tipoLicencia.unidad_control === 'días') {
                if (!licenciaData.fecha_inicio || !licenciaData.fecha_fin) {
                    throw new Error('Debe ingresar fecha de inicio y fin');
                }
                const inicio = new Date(licenciaData.fecha_inicio);
                const fin = new Date(licenciaData.fecha_fin);
                consumo = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
                if (consumo <= 0) throw new Error('La fecha de fin debe ser posterior o igual a la de inicio');
            }

            // 3. Validaciones especiales por tipo/código
            // Máximo de días por solicitud
            const cod = tipoLicencia.codigo || '';
            if ([
                'ENFERMEDAD', 'DUEL0', 'PATERNIDAD', 'MATRIMONIO', 'OLVIDO-ENT', 'OLVIDO-SAL', 'CAMBIO-TUR'
            ].includes(cod) && consumo > tipoLicencia.duracion_maxima) {
                throw new Error(`No puede solicitar más de ${tipoLicencia.duracion_maxima} días para este permiso.`);
            }
            // Maternidad: no más de 112 días
            if (cod === 'MATERNIDAD' && consumo > tipoLicencia.duracion_maxima) {
                throw new Error('No puede solicitar más de 112 días para este permiso.');
            }
            // Lactancia materna: autocompletar fecha fin (inicio + 6 meses)
            if (cod === 'LACTANCIA' && licenciaData.fecha_inicio) {
                const inicio = new Date(licenciaData.fecha_inicio);
                const fin = new Date(inicio);
                fin.setMonth(fin.getMonth() + 6);
                licenciaData.fecha_fin = fin.toISOString().slice(0, 10);
                consumo = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
            }
            // Olvido de marcación: debe diferenciar entrada/salida
            if (cod === 'OLVIDO-ENT' || cod === 'OLVIDO-SAL') {
                if (!licenciaData.tipo_olvido_marcacion) {
                    throw new Error('Debe especificar si el olvido fue de ENTRADA o SALIDA');
                }
                // Validar máximo 2 eventos por mes
                const mes = licenciaData.fecha_inicio.slice(0, 7);
                const ultimoDiaMes = new Date(licenciaData.fecha_inicio.slice(0, 4), licenciaData.fecha_inicio.slice(5, 7), 0).getDate();
                const count = await this.licenciasRepository.count({
                    where: {
                        trabajador_id: trabajadorId,
                        tipo_licencia_id: tipoLicenciaId,
                        fecha_inicio: Between(`${mes}-01`, `${mes}-${ultimoDiaMes.toString().padStart(2, '0')}`)
                    }
                });
                if (count >= tipoLicencia.duracion_maxima) {
                    throw new Error('Ya ha alcanzado el máximo de olvidos de marcación este mes.');
                }
            }
            // Cambio de turno: requiere trabajador de cambio
            if (cod === 'CAMBIO-TUR' && !licenciaData.trabajador_cambio_id) {
                throw new Error('Debe especificar el trabajador que hará el cambio de turno');
            }

            // 4. Si es solo registro, no descontar disponibilidad
            if (tipoLicencia.periodo_control === 'ninguno' && tipoLicencia.duracion_maxima === 0) {
                const licencia = this.licenciasRepository.create(licenciaData);
                return await this.licenciasRepository.save(licencia);
            }

            // 5. Control de disponibilidad por periodo
            let disponibilidad = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: trabajadorId,
                    tipo_licencia_id: tipoLicenciaId
                }
            });
            if (!disponibilidad) {
                disponibilidad = this.disponibilidadRepository.create({
                    trabajador_id: trabajadorId,
                    tipo_licencia_id: tipoLicenciaId,
                    dias_disponibles: tipoLicencia.duracion_maxima,
                    dias_usados: 0,
                    dias_restantes: tipoLicencia.duracion_maxima
                });
            }
            // Validar disponibilidad
            if (disponibilidad.dias_restantes < consumo) {
                throw new Error('No hay suficiente disponibilidad para este permiso.');
            }
            // Actualizar disponibilidad
            disponibilidad.dias_usados += consumo;
            disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
            await this.disponibilidadRepository.save(disponibilidad);

            // Crear la licencia
            const licencia = this.licenciasRepository.create(licenciaData);
            return await this.licenciasRepository.save(licencia);
        } catch (error) {
            throw new Error(`Error al crear la licencia: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.licenciasRepository.find({
                relations: ['solicitud', 'trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const licencia = await this.licenciasRepository.findOne({
                where: { id },
                relations: ['solicitud', 'trabajador', 'tipo_licencia']
            });

            if (!licencia) {
                throw new Error('Licencia no encontrada');
            }

            return licencia;
        } catch (error) {
            throw new Error(`Error al obtener la licencia: ${error.message}`);
        }
    }

    async update(id, licenciaData) {
        try {
            const licencia = await this.findById(id);
            if (!licencia) throw new Error('Licencia no encontrada');

            // Buscar tipo de licencia actual y nuevo
            const tipoLicenciaActual = await this.tiposLicenciasRepository.findOne({ where: { id: licencia.tipo_licencia_id } });
            const tipoLicenciaNueva = await this.tiposLicenciasRepository.findOne({ where: { id: licenciaData.tipo_licencia_id || licencia.tipo_licencia_id } });

            // Calcular consumo anterior
            let consumoAnterior = 1;
            if (tipoLicenciaActual.unidad_control === 'horas') {
                // Usar horas_totales si está disponible, sino calcular por diferencia de fechas
                consumoAnterior = parseFloat(licencia.horas_totales) || ((new Date(licencia.fecha_fin) - new Date(licencia.fecha_inicio)) / (1000 * 60 * 60));
            } else if (tipoLicenciaActual.unidad_control === 'días') {
                const inicio = new Date(licencia.fecha_inicio);
                const fin = new Date(licencia.fecha_fin);
                consumoAnterior = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
            }

            // Calcular consumo nuevo
            let consumoNuevo = consumoAnterior;
            let horasTotalesNuevas = 0;
            if (tipoLicenciaNueva.unidad_control === 'horas' && licenciaData.fecha_inicio && licenciaData.fecha_fin) {
                const inicio = new Date(licenciaData.fecha_inicio);
                const fin = new Date(licenciaData.fecha_fin);
                horasTotalesNuevas = (fin - inicio) / (1000 * 60 * 60);
                consumoNuevo = horasTotalesNuevas;
                // Agregar horas_totales a los datos de la licencia
                licenciaData.horas_totales = horasTotalesNuevas;
            } else if (tipoLicenciaNueva.unidad_control === 'días' && licenciaData.fecha_inicio && licenciaData.fecha_fin) {
                const inicio = new Date(licenciaData.fecha_inicio);
                const fin = new Date(licenciaData.fecha_fin);
                consumoNuevo = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
            }

            // Si cambia trabajador, tipo o fechas, devolver disponibilidad anterior y descontar la nueva
            const cambiaDisponibilidad = (
                licencia.trabajador_id !== (licenciaData.trabajador_id || licencia.trabajador_id) ||
                licencia.tipo_licencia_id !== (licenciaData.tipo_licencia_id || licencia.tipo_licencia_id) ||
                licencia.fecha_inicio !== (licenciaData.fecha_inicio || licencia.fecha_inicio) ||
                licencia.fecha_fin !== (licenciaData.fecha_fin || licencia.fecha_fin)
            );

            if (cambiaDisponibilidad) {
                // Devolver disponibilidad anterior
                let disponibilidadAnterior = await this.disponibilidadRepository.findOne({
                    where: {
                        trabajador_id: licencia.trabajador_id,
                        tipo_licencia_id: licencia.tipo_licencia_id
                    }
                });
                if (disponibilidadAnterior) {
                    disponibilidadAnterior.dias_usados -= consumoAnterior;
                    disponibilidadAnterior.dias_restantes = disponibilidadAnterior.dias_disponibles - disponibilidadAnterior.dias_usados;
                    await this.disponibilidadRepository.save(disponibilidadAnterior);
                }
                // Descontar nueva disponibilidad
                let disponibilidadNueva = await this.disponibilidadRepository.findOne({
                    where: {
                        trabajador_id: licenciaData.trabajador_id || licencia.trabajador_id,
                        tipo_licencia_id: licenciaData.tipo_licencia_id || licencia.tipo_licencia_id
                    }
                });
                if (!disponibilidadNueva) {
                    disponibilidadNueva = this.disponibilidadRepository.create({
                        trabajador_id: licenciaData.trabajador_id || licencia.trabajador_id,
                        tipo_licencia_id: licenciaData.tipo_licencia_id || licencia.tipo_licencia_id,
                        dias_disponibles: tipoLicenciaNueva.duracion_maxima,
                        dias_usados: 0,
                        dias_restantes: tipoLicenciaNueva.duracion_maxima
                    });
                }
                if (disponibilidadNueva.dias_restantes < consumoNuevo) {
                    throw new Error('No hay suficiente disponibilidad para este permiso.');
                }
                disponibilidadNueva.dias_usados += consumoNuevo;
                disponibilidadNueva.dias_restantes = disponibilidadNueva.dias_disponibles - disponibilidadNueva.dias_usados;
                await this.disponibilidadRepository.save(disponibilidadNueva);
            }

            // Validaciones especiales (igual que en create)
            // ... (puedes reutilizar la lógica de create para validaciones por tipo/código) ...

            Object.assign(licencia, licenciaData);
            return await this.licenciasRepository.save(licencia);
        } catch (error) {
            throw new Error(`Error al actualizar la licencia: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const licencia = await this.findById(id);
            if (!licencia) throw new Error('Licencia no encontrada');

            // Buscar tipo de licencia
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({ where: { id: licencia.tipo_licencia_id } });
            // Calcular consumo
            let consumo = 1;
            if (tipoLicencia.unidad_control === 'horas') {
                // Usar horas_totales si está disponible, sino calcular por diferencia de fechas
                consumo = parseFloat(licencia.horas_totales) || ((new Date(licencia.fecha_fin) - new Date(licencia.fecha_inicio)) / (1000 * 60 * 60));
            } else if (tipoLicencia.unidad_control === 'días') {
                const inicio = new Date(licencia.fecha_inicio);
                const fin = new Date(licencia.fecha_fin);
                consumo = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
            }
            // Devolver disponibilidad
            let disponibilidad = await this.disponibilidadRepository.findOne({
                where: {
                    trabajador_id: licencia.trabajador_id,
                    tipo_licencia_id: licencia.tipo_licencia_id
                }
            });
            if (disponibilidad) {
                disponibilidad.dias_usados -= consumo;
                disponibilidad.dias_restantes = disponibilidad.dias_disponibles - disponibilidad.dias_usados;
                await this.disponibilidadRepository.save(disponibilidad);
            }
            await this.licenciasRepository.remove(licencia);
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar la licencia: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            return await this.licenciasRepository.find({
                where: { trabajador_id: trabajadorId },
                relations: ['tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias del trabajador: ${error.message}`);
        }
    }

    async findByTipoLicencia(tipoLicenciaId) {
        try {
            return await this.licenciasRepository.find({
                where: { tipo_licencia_id: tipoLicenciaId },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias del tipo de licencia: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
            return await this.licenciasRepository.find({
                where: { estado },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias por estado: ${error.message}`);
        }
    }

    async findBySolicitud(solicitudId) {
        try {
            return await this.licenciasRepository.findOne({
                where: { solicitud_id: solicitudId },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener la licencia de la solicitud: ${error.message}`);
        }
    }

    async findByFecha(fechaInicio, fechaFin) {
        try {
            return await this.licenciasRepository.find({
                where: {
                    fecha_inicio: Between(fechaInicio, fechaFin)
                },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las licencias por fecha: ${error.message}`);
        }
    }
}

module.exports = new LicenciasService(); 