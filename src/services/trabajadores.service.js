const { AppDataSource } = require('../config/database');
const Trabajador = require('../models/trabajador.model');
const Licencia = require('../models/licencia.model');
const { Between } = require('typeorm');
const XLSX = require('xlsx');

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

    async importFromExcel(fileBuffer) {
        console.log('🔧 Iniciando procesamiento del archivo Excel...');
        console.log('Tamaño del buffer:', fileBuffer.length, 'bytes');
        
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Leer el archivo Excel
            console.log('📖 Leyendo archivo Excel...');
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            console.log('Hojas disponibles:', workbook.SheetNames);
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            console.log('📊 Datos extraídos:', {
                totalRows: data.length,
                headers: data[0]
            });

            // Validar que hay datos
            if (data.length < 2) {
                throw new Error('El archivo Excel debe contener al menos una fila de datos (excluyendo el encabezado)');
            }

            // Obtener encabezados (primera fila)
            const headers = data[0];
            const expectedHeaders = [
                'Código', 'Nombre Completo', 'Email', 'Teléfono', 
                'Departamento', 'Puesto', 'Tipo Personal', 'Fecha Ingreso', 'Activo'
            ];

            console.log('🔍 Validando encabezados...');
            console.log('Encabezados encontrados:', headers);
            console.log('Encabezados esperados:', expectedHeaders);

            // Validar encabezados
            const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                throw new Error(`Faltan los siguientes encabezados: ${missingHeaders.join(', ')}`);
            }

            console.log('✅ Encabezados válidos');

            // Obtener repositorios necesarios
            const departamentoRepo = AppDataSource.getRepository('Departamento');
            const puestoRepo = AppDataSource.getRepository('Puesto');
            const tipoLicenciaRepo = AppDataSource.getRepository('TipoLicencia');
            const disponibilidadRepo = AppDataSource.getRepository('Disponibilidad');

            const results = {
                total: data.length - 1,
                success: 0,
                errors: [],
                duplicates: 0
            };

            console.log('🔄 Procesando filas de datos...');

            // Procesar cada fila de datos
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const rowNumber = i + 1;

                console.log(`📝 Procesando fila ${rowNumber}:`, row);

                try {
                    // Mapear datos de la fila
                    const trabajadorData = {
                        codigo: String(row[headers.indexOf('Código')] || '').trim(),
                        nombre_completo: String(row[headers.indexOf('Nombre Completo')] || '').trim(),
                        email: String(row[headers.indexOf('Email')] || '').trim(),
                        telefono: row[headers.indexOf('Teléfono')] ? String(row[headers.indexOf('Teléfono')]).trim() : null,
                        departamento_id: null,
                        puesto_id: null,
                        tipo_personal: String(row[headers.indexOf('Tipo Personal')] || '').trim().toUpperCase(),
                        fecha_ingreso: row[headers.indexOf('Fecha Ingreso')] ? new Date(row[headers.indexOf('Fecha Ingreso')]).toISOString() : new Date().toISOString(),
                        activo: String(row[headers.indexOf('Activo')] || '').toLowerCase() === 'sí' || 
                               String(row[headers.indexOf('Activo')] || '').toLowerCase() === 'si' ||
                               String(row[headers.indexOf('Activo')] || '').toLowerCase() === 'true' ||
                               String(row[headers.indexOf('Activo')] || '').toLowerCase() === '1'
                    };

                    console.log('📋 Datos mapeados:', trabajadorData);

                    // Validaciones básicas
                    if (!trabajadorData.codigo) {
                        throw new Error('El código es obligatorio');
                    }
                    if (!trabajadorData.nombre_completo) {
                        throw new Error('El nombre completo es obligatorio');
                    }
                    if (!trabajadorData.email) {
                        throw new Error('El email es obligatorio');
                    }
                    if (!['OPERATIVO', 'ADMINISTRATIVO'].includes(trabajadorData.tipo_personal)) {
                        throw new Error('El tipo personal debe ser OPERATIVO o ADMINISTRATIVO');
                    }

                    // Verificar si el código ya existe
                    const existingTrabajador = await this.findByCodigo(trabajadorData.codigo);
                    if (existingTrabajador) {
                        console.log(`⚠️ Código duplicado: ${trabajadorData.codigo}`);
                        results.duplicates++;
                        results.errors.push({
                            row: rowNumber,
                            error: `El código ${trabajadorData.codigo} ya existe`
                        });
                        continue;
                    }

                    // Buscar departamento por nombre
                    const departamentoNombre = String(row[headers.indexOf('Departamento')] || '').trim();
                    if (departamentoNombre) {
                        const departamento = await departamentoRepo.findOne({
                            where: { nombre: departamentoNombre }
                        });
                        if (departamento) {
                            trabajadorData.departamento_id = departamento.id;
                            console.log(`🏢 Departamento encontrado: ${departamentoNombre} (ID: ${departamento.id})`);
                        } else {
                            console.log(`⚠️ Departamento no encontrado: ${departamentoNombre}`);
                        }
                    }

                    // Buscar puesto por nombre
                    const puestoNombre = String(row[headers.indexOf('Puesto')] || '').trim();
                    if (puestoNombre) {
                        const puesto = await puestoRepo.findOne({
                            where: { nombre: puestoNombre }
                        });
                        if (puesto) {
                            trabajadorData.puesto_id = puesto.id;
                            console.log(`💼 Puesto encontrado: ${puestoNombre} (ID: ${puesto.id})`);
                        } else {
                            console.log(`⚠️ Puesto no encontrado: ${puestoNombre}`);
                        }
                    }

                    // Crear el trabajador
                    console.log('💾 Guardando trabajador...');
                    const trabajador = this.trabajadoresRepository.create(trabajadorData);
                    const savedTrabajador = await this.trabajadoresRepository.save(trabajador);
                    console.log(`✅ Trabajador guardado: ${savedTrabajador.codigo} (ID: ${savedTrabajador.id})`);

                    // Inicializar disponibilidad para todos los tipos de licencia activos
                    const tipos = await tipoLicenciaRepo.find({ where: { activo: true } });
                    console.log(`📅 Inicializando disponibilidad para ${tipos.length} tipos de licencia...`);
                    
                    for (const tipo of tipos) {
                        await disponibilidadRepo.save({
                            trabajador_id: savedTrabajador.id,
                            tipo_licencia_id: tipo.id,
                            dias_disponibles: tipo.duracion_maxima,
                            dias_usados: 0,
                            dias_restantes: tipo.duracion_maxima
                        });
                    }

                    results.success++;
                    console.log(`✅ Fila ${rowNumber} procesada exitosamente`);

                } catch (error) {
                    console.error(`❌ Error en fila ${rowNumber}:`, error.message);
                    results.errors.push({
                        row: rowNumber,
                        error: error.message
                    });
                }
            }

            console.log('💾 Confirmando transacción...');
            await queryRunner.commitTransaction();
            
            console.log('✅ Procesamiento completado:', results);
            return results;

        } catch (error) {
            console.error('❌ Error en procesamiento:', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}

module.exports = new TrabajadoresService(); 