const { AppDataSource } = require('../config/database');
const Solicitud = require('../models/solicitud.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const Disponibilidad = require('../models/disponibilidad.model');
const Licencia = require('../models/licencia.model');
const { Between } = require('typeorm');
const { normalizeDates } = require('../utils/dateUtils');

class SolicitudesService {
    constructor() {
        this.solicitudesRepository = AppDataSource.getRepository(Solicitud);
        this.trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        this.tiposLicenciasRepository = AppDataSource.getRepository(TipoLicencia);
        this.disponibilidadRepository = AppDataSource.getRepository(Disponibilidad);
        this.licenciasRepository = AppDataSource.getRepository(Licencia);
    }

    async create(solicitudData) {
        try {
            // Debug: Log the received data
            console.log('SolicitudesService.create - Received data:', JSON.stringify(solicitudData, null, 2));
            console.log('afecta_disponibilidad value:', solicitudData.afecta_disponibilidad);
            console.log('afecta_disponibilidad type:', typeof solicitudData.afecta_disponibilidad);
            
            // Normalizar las fechas a la zona horaria de El Salvador
            const normalizedData = normalizeDates(solicitudData);
            
            // Verificar si el trabajador existe
            const trabajador = await this.trabajadoresRepository.findOne({
                where: { id: normalizedData.trabajador_id }
            });

            if (!trabajador) {
                throw new Error('El trabajador no existe');
            }

            // Verificar si el tipo de licencia existe
            const tipoLicencia = await this.tiposLicenciasRepository.findOne({
                where: { id: normalizedData.tipo_licencia_id }
            });

            if (!tipoLicencia) {
                throw new Error('El tipo de licencia no existe');
            }

            // Verificar si es olvido de marcación
            const esOlvidoMarcacion = tipoLicencia.codigo === 'OLVIDO-ENT' || tipoLicencia.codigo === 'OLVIDO-SAL';

            // Calcular días hábiles y calendario solo si NO es olvido de marcación
            let diasHabiles = 0;
            let diasCalendario = 0;
            let diasSolicitados = 0;

            if (!esOlvidoMarcacion) {
                diasHabiles = this.calcularDiasHabiles(normalizedData.fecha_inicio, normalizedData.fecha_fin);
                diasCalendario = this.calcularDiasCalendario(normalizedData.fecha_inicio, normalizedData.fecha_fin);
                diasSolicitados = tipoLicencia.goce_salario ? diasHabiles : diasCalendario;
            }

            normalizedData.dias_habiles = diasHabiles;
            normalizedData.dias_calendario = diasCalendario;
            normalizedData.dias_solicitados = diasSolicitados;

            // Para olvido de marcación, validar cantidad de eventos por mes
            if (esOlvidoMarcacion) {
                if (!normalizedData.tipo_olvido_marcacion || normalizedData.tipo_olvido_marcacion === '' || !['ENTRADA', 'SALIDA'].includes(normalizedData.tipo_olvido_marcacion)) {
                    throw new Error('Debe especificar si el olvido fue de ENTRADA o SALIDA');
                }
                
                // Validar máximo eventos por mes
                const mes = normalizedData.fecha_inicio.slice(0, 7);
                const ultimoDiaMes = new Date(normalizedData.fecha_inicio.slice(0, 4), normalizedData.fecha_inicio.slice(5, 7), 0).getDate();
                const count = await this.solicitudesRepository.count({
                    where: {
                        trabajador_id: normalizedData.trabajador_id,
                        tipo_licencia_id: normalizedData.tipo_licencia_id,
                        fecha_inicio: Between(`${mes}-01`, `${mes}-${ultimoDiaMes.toString().padStart(2, '0')}`)
                    }
                });
                
                if (count >= tipoLicencia.duracion_maxima) {
                    throw new Error('Ya ha alcanzado el máximo de olvidos de marcación este mes.');
                }
            } else {
                // Verificar disponibilidad de días solo si NO es olvido de marcación Y NO es tipo sin período
                if (tipoLicencia.periodo_control !== 'ninguno') {
                    let disponibilidad = await this.disponibilidadRepository.findOne({
                        where: {
                            trabajador_id: normalizedData.trabajador_id,
                            tipo_licencia_id: normalizedData.tipo_licencia_id
                        }
                    });

                    if (!disponibilidad) {
                        // Si no existe, crear una nueva disponibilidad
                        disponibilidad = this.disponibilidadRepository.create({
                            trabajador_id: normalizedData.trabajador_id,
                            tipo_licencia_id: normalizedData.tipo_licencia_id,
                            dias_disponibles: tipoLicencia.duracion_maxima,
                            dias_usados: 0,
                            dias_restantes: tipoLicencia.duracion_maxima
                        });
                        await this.disponibilidadRepository.save(disponibilidad);
                    }

                    // Validar que haya suficiente disponibilidad
                    if (disponibilidad.dias_restantes < diasSolicitados) {
                        throw new Error(`No hay suficiente disponibilidad. Días restantes: ${disponibilidad.dias_restantes}, Días solicitados: ${diasSolicitados}`);
                    }
                }
            }

            const solicitud = this.solicitudesRepository.create(normalizedData);
            const savedSolicitud = await this.solicitudesRepository.save(solicitud);

            // Si la solicitud es APROBADA, crear la licencia y actualizar disponibilidad
            if (savedSolicitud.estado === 'APROBADA') {
                // Usar el valor de afecta_disponibilidad que viene del frontend
                // Si no viene especificado, determinar automáticamente basándose en la fecha
                let afectaDisponibilidad = normalizedData.afecta_disponibilidad !== undefined ? 
                    normalizedData.afecta_disponibilidad : true;
                
                console.log('Debug afecta_disponibilidad logic:');
                console.log('- normalizedData.afecta_disponibilidad:', normalizedData.afecta_disponibilidad);
                console.log('- afectaDisponibilidad initial value:', afectaDisponibilidad);
                
                // Solo determinar automáticamente si no fue especificado explícitamente
                if (normalizedData.afecta_disponibilidad === undefined) {
                    const hoy = new Date();
                    const fechaInicioLicencia = new Date(savedSolicitud.fecha_inicio);

                    if (tipoLicencia.periodo_control === 'anual' && fechaInicioLicencia.getFullYear() < hoy.getFullYear()) {
                        afectaDisponibilidad = false;
                    }
                    if (tipoLicencia.periodo_control === 'mensual' && (fechaInicioLicencia.getFullYear() < hoy.getFullYear() || fechaInicioLicencia.getMonth() < hoy.getMonth())) {
                        afectaDisponibilidad = false;
                    }
                    console.log('- Auto-determined afectaDisponibilidad:', afectaDisponibilidad);
                } else {
                    console.log('- Using frontend-provided afectaDisponibilidad:', afectaDisponibilidad);
                }

                // Actualizar disponibilidad SOLO si la licencia no es retroactiva
                if (afectaDisponibilidad && !esOlvidoMarcacion && tipoLicencia.periodo_control !== 'ninguno') {
                    const disponibilidad = await this.disponibilidadRepository.findOne({
                        where: {
                            trabajador_id: savedSolicitud.trabajador_id,
                            tipo_licencia_id: savedSolicitud.tipo_licencia_id
                        }
                    });
                    
                    if (disponibilidad) {
                        // Convertir a float para asegurar la precisión decimal
                        const diasDisponibles = parseFloat(disponibilidad.dias_disponibles);
                        let diasUsados = parseFloat(disponibilidad.dias_usados);

                        if (tipoLicencia.unidad_control === 'horas') {
                            const inicio = new Date(savedSolicitud.fecha_inicio);
                            const fin = new Date(savedSolicitud.fecha_fin);
                            const horasCalculadas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                            diasUsados += horasCalculadas;
                        } else {
                            diasUsados += diasHabiles;
                        }

                        disponibilidad.dias_usados = diasUsados.toFixed(2);
                        disponibilidad.dias_restantes = (diasDisponibles - diasUsados).toFixed(2);
                        
                        await this.disponibilidadRepository.save(disponibilidad);
                    }
                }

                // Crear la licencia
                const licencia = this.licenciasRepository.create({
                    solicitud_id: savedSolicitud.id,
                    trabajador_id: savedSolicitud.trabajador_id,
                    tipo_licencia_id: savedSolicitud.tipo_licencia_id,
                    fecha_inicio: savedSolicitud.fecha_inicio,
                    fecha_fin: savedSolicitud.fecha_fin || savedSolicitud.fecha_inicio,
                    dias_totales: savedSolicitud.dias_solicitados,
                    dias_habiles: savedSolicitud.dias_habiles,
                    dias_calendario: savedSolicitud.dias_calendario,
                    estado: 'ACTIVA',
                    activo: true,
                    tipo_olvido_marcacion: savedSolicitud.tipo_olvido_marcacion,
                    afecta_disponibilidad: afectaDisponibilidad
                });

                // Calcular horas si el tipo de licencia es por horas
                if (tipoLicencia.unidad_control === 'horas' && savedSolicitud.fecha_inicio && savedSolicitud.fecha_fin) {
                    const inicio = new Date(savedSolicitud.fecha_inicio);
                    const fin = new Date(savedSolicitud.fecha_fin);
                    const horasCalculadas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                    licencia.horas_totales = horasCalculadas;
                    console.log('Horas calculadas para licencia:', horasCalculadas);
                }

                await this.licenciasRepository.save(licencia);
            }

            return savedSolicitud;
        } catch (error) {
            throw new Error(`Error al crear la solicitud: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await this.solicitudesRepository.find({
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const solicitud = await this.solicitudesRepository.findOne({
                where: { id },
                relations: ['trabajador', 'tipo_licencia']
            });

            if (!solicitud) {
                throw new Error('Solicitud no encontrada');
            }

            return solicitud;
        } catch (error) {
            throw new Error(`Error al obtener la solicitud: ${error.message}`);
        }
    }

    async update(id, solicitudData) {
        try {
            // Normalizar las fechas a la zona horaria de El Salvador
            const normalizedData = normalizeDates(solicitudData);
            
            const solicitud = await this.findById(id);

            // Si se están actualizando las fechas, recalcular días
            if (normalizedData.fecha_inicio || normalizedData.fecha_fin) {
                const fechaInicio = normalizedData.fecha_inicio || solicitud.fecha_inicio;
                const fechaFin = normalizedData.fecha_fin || solicitud.fecha_fin;

                const diasHabiles = this.calcularDiasHabiles(fechaInicio, fechaFin);
                const diasCalendario = this.calcularDiasCalendario(fechaInicio, fechaFin);

                normalizedData.dias_habiles = diasHabiles;
                normalizedData.dias_calendario = diasCalendario;
                normalizedData.dias_solicitados = solicitud.tipo_licencia.goce_salario ? diasHabiles : diasCalendario;
            }

            // Buscar la licencia asociada antes de actualizar la solicitud
            const licencia = await this.licenciasRepository.findOne({
                where: { solicitud_id: id }
            });

            // Actualizar la solicitud
            Object.assign(solicitud, normalizedData);
            const solicitudActualizada = await this.solicitudesRepository.save(solicitud);

            // Si existe una licencia asociada, actualizarla
            if (licencia) {
                // Usar el valor de afecta_disponibilidad que viene del frontend
                // Si no viene especificado, mantener el valor actual
                const afectaDisponibilidad = normalizedData.afecta_disponibilidad !== undefined ? 
                    normalizedData.afecta_disponibilidad : licencia.afecta_disponibilidad;

                // Actualizar el campo afecta_disponibilidad en la licencia
                licencia.afecta_disponibilidad = afectaDisponibilidad;

                // Calcular la diferencia de días para actualizar la disponibilidad
                // SOLO si la licencia afecta la disponibilidad
                if (afectaDisponibilidad) {
                    const diasAnteriores = licencia.dias_calendario || 0;
                    const diasNuevos = solicitudActualizada.dias_calendario || 0;
                    const diferenciaDias = diasNuevos - diasAnteriores;

                    // Si hay cambio en los días, actualizar la disponibilidad
                    if (diferenciaDias !== 0) {
                        const disponibilidad = await this.disponibilidadRepository.findOne({
                            where: {
                                trabajador_id: solicitudActualizada.trabajador_id,
                                tipo_licencia_id: solicitudActualizada.tipo_licencia_id
                            }
                        });

                        if (disponibilidad) {
                            // Convertir a float para asegurar la precisión decimal
                            const diasDisponibles = parseFloat(disponibilidad.dias_disponibles);
                            let diasUsados = parseFloat(disponibilidad.dias_usados);

                            diasUsados += diferenciaDias;

                            disponibilidad.dias_usados = diasUsados.toFixed(2);
                            disponibilidad.dias_restantes = (diasDisponibles - diasUsados).toFixed(2);
                            
                            await this.disponibilidadRepository.save(disponibilidad);
                        }
                    }
                } else {
                    // Si la licencia NO afecta la disponibilidad, revertir los días que ya se habían descontado
                    const diasAnteriores = licencia.dias_calendario || 0;
                    const diasNuevos = solicitudActualizada.dias_calendario || 0;
                    
                    // Si antes afectaba la disponibilidad y ahora no, devolver los días
                    if (licencia.afecta_disponibilidad && !afectaDisponibilidad && diasAnteriores > 0) {
                        const disponibilidad = await this.disponibilidadRepository.findOne({
                            where: {
                                trabajador_id: solicitudActualizada.trabajador_id,
                                tipo_licencia_id: solicitudActualizada.tipo_licencia_id
                            }
                        });

                        if (disponibilidad) {
                            const diasDisponibles = parseFloat(disponibilidad.dias_disponibles);
                            let diasUsados = parseFloat(disponibilidad.dias_usados);

                            // Devolver los días que se habían descontado
                            diasUsados -= diasAnteriores;

                            disponibilidad.dias_usados = Math.max(0, diasUsados).toFixed(2);
                            disponibilidad.dias_restantes = (diasDisponibles - diasUsados).toFixed(2);
                            
                            await this.disponibilidadRepository.save(disponibilidad);
                        }
                    }
                }

                // Actualizar la licencia con los nuevos datos
                Object.assign(licencia, {
                    trabajador_id: solicitudActualizada.trabajador_id,
                    tipo_licencia_id: solicitudActualizada.tipo_licencia_id,
                    fecha_inicio: solicitudActualizada.fecha_inicio,
                    fecha_fin: solicitudActualizada.fecha_fin,
                    dias_habiles: solicitudActualizada.dias_habiles,
                    dias_calendario: solicitudActualizada.dias_calendario,
                    dias_totales: solicitudActualizada.dias_solicitados,
                    estado: solicitudActualizada.estado === 'APROBADA' ? 'ACTIVA' : licencia.estado,
                    fecha_actualizacion: new Date()
                });

                // Calcular horas si el tipo de licencia es por horas
                if (solicitudActualizada.tipo_licencia.unidad_control === 'horas' && solicitudActualizada.fecha_inicio && solicitudActualizada.fecha_fin) {
                    const inicio = new Date(solicitudActualizada.fecha_inicio);
                    const fin = new Date(solicitudActualizada.fecha_fin);
                    const horasCalculadas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                    licencia.horas_totales = horasCalculadas;
                    console.log('Horas calculadas para licencia actualizada:', horasCalculadas);
                }

                await this.licenciasRepository.save(licencia);
            }

            return {
                solicitud: solicitudActualizada,
                licencia: licencia
            };
        } catch (error) {
            throw new Error(`Error al actualizar la solicitud: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const solicitud = await this.findById(id);
            return await this.solicitudesRepository.remove(solicitud);
        } catch (error) {
            throw new Error(`Error al eliminar la solicitud: ${error.message}`);
        }
    }

    async findByTrabajador(trabajadorId) {
        try {
            return await this.solicitudesRepository.find({
                where: { trabajador_id: trabajadorId },
                relations: ['tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes del trabajador: ${error.message}`);
        }
    }

    async findByTipoLicencia(tipoLicenciaId) {
        try {
            return await this.solicitudesRepository.find({
                where: { tipo_licencia_id: tipoLicenciaId },
                relations: ['trabajador']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes del tipo de licencia: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
            return await this.solicitudesRepository.find({
                where: { estado },
                relations: ['trabajador', 'tipo_licencia']
            });
        } catch (error) {
            throw new Error(`Error al obtener las solicitudes por estado: ${error.message}`);
        }
    }

    calcularDiasHabiles(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        let diasHabiles = 0;

        for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
            const diaSemana = fecha.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) { // 0 = Domingo, 6 = Sábado
                diasHabiles++;
            }
        }

        return diasHabiles;
    }

    calcularDiasCalendario(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffTime = Math.abs(fin - inicio);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
}

module.exports = new SolicitudesService(); 