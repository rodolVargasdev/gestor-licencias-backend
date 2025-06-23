const { AppDataSource } = require('./src/config/database');
const solicitudesService = require('./src/services/solicitudes.service');
const disponibilidadService = require('./src/services/disponibilidad.service');
const Trabajador = require('./src/models/trabajador.model');
const TipoLicencia = require('./src/models/tipo-licencia.model');
const Solicitud = require('./src/models/solicitud.model');
const Licencia = require('./src/models/licencia.model');
const Disponibilidad = require('./src/models/disponibilidad.model');

class TestAfectaDisponibilidad {
    constructor() {
        this.solicitudesService = solicitudesService;
        this.disponibilidadService = disponibilidadService;
        this.testResults = [];
    }

    async initialize() {
        try {
            await AppDataSource.initialize();
            console.log('✅ Base de datos conectada');
            return true;
        } catch (error) {
            console.error('❌ Error conectando a la base de datos:', error.message);
            return false;
        }
    }

    async cleanup() {
        try {
            await AppDataSource.destroy();
            console.log('✅ Conexión cerrada');
        } catch (error) {
            console.error('❌ Error cerrando conexión:', error.message);
        }
    }

    logTest(testName, passed, details = '') {
        const status = passed ? '✅' : '❌';
        const message = `${status} ${testName}`;
        console.log(message);
        if (details) console.log(`   ${details}`);
        
        this.testResults.push({
            test: testName,
            passed,
            details
        });
    }

    async getTrabajadorT001() {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        return await trabajadorRepo.findOne({ where: { codigo: 'T001' } });
    }

    async getPrimerTipoLicencia() {
        const tipoLicenciaRepo = AppDataSource.getRepository(TipoLicencia);
        return await tipoLicenciaRepo.findOne({ where: {} });
    }

    async test1_CreateRetroactiveLicense() {
        console.log('\n🧪 Test 1: Crear licencia retroactiva');
        
        try {
            const trabajador = await this.getTrabajadorT001();
            const tipoLicencia = await this.getPrimerTipoLicencia();
            if (!trabajador || !tipoLicencia) {
                this.logTest('Crear licencia retroactiva', false, 'No se encontró trabajador T001 o tipo de licencia');
                return;
            }

            // Obtener disponibilidad inicial
            const disponibilidadInicial = await this.disponibilidadService.findByTrabajador(trabajador.id);
            const disponibilidadTipo = disponibilidadInicial.find(d => d.tipo_licencia_id === tipoLicencia.id);
            const diasRestantesInicial = disponibilidadTipo ? disponibilidadTipo.dias_restantes : 0;

            // Crear solicitud retroactiva
            const solicitudData = {
                trabajador_id: trabajador.id,
                tipo_licencia_id: tipoLicencia.id,
                fecha_inicio: '2023-01-15', // Fecha pasada
                fecha_fin: '2023-01-17',
                motivo: 'Test retroactiva',
                estado: 'APROBADA',
                fecha_solicitud: new Date().toISOString().split('T')[0],
                afecta_disponibilidad: false // ← CLAVE: Licencia retroactiva
            };

            const solicitud = await this.solicitudesService.create(solicitudData);
            
            // Verificar que la licencia se creó con afecta_disponibilidad = false
            const licenciaRepo = AppDataSource.getRepository(Licencia);
            const licencia = await licenciaRepo.findOne({
                where: { solicitud_id: solicitud.id }
            });

            const disponibilidadFinal = await this.disponibilidadService.findByTrabajador(trabajador.id);
            const disponibilidadTipoFinal = disponibilidadFinal.find(d => d.tipo_licencia_id === tipoLicencia.id);
            const diasRestantesFinal = disponibilidadTipoFinal ? disponibilidadTipoFinal.dias_restantes : 0;

            const passed = licencia.afecta_disponibilidad === false && diasRestantesFinal === diasRestantesInicial;
            
            this.logTest('Crear licencia retroactiva', passed, 
                `afecta_disponibilidad: ${licencia.afecta_disponibilidad}, ` +
                `días restantes: ${diasRestantesInicial} → ${diasRestantesFinal}`
            );

            return { solicitud, licencia };
        } catch (error) {
            this.logTest('Crear licencia retroactiva', false, error.message);
            return null;
        }
    }

    async test2_CreateNormalLicense() {
        console.log('\n🧪 Test 2: Crear licencia normal');
        
        try {
            const trabajador = await this.getTrabajadorT001();
            const tipoLicencia = await this.getPrimerTipoLicencia();
            if (!trabajador || !tipoLicencia) {
                this.logTest('Crear licencia normal', false, 'No se encontró trabajador T001 o tipo de licencia');
                return;
            }

            // Obtener disponibilidad inicial
            const disponibilidadInicial = await this.disponibilidadService.findByTrabajador(trabajador.id);
            const disponibilidadTipo = disponibilidadInicial.find(d => d.tipo_licencia_id === tipoLicencia.id);
            const diasRestantesInicial = disponibilidadTipo ? disponibilidadTipo.dias_restantes : 0;

            // Crear solicitud normal
            const solicitudData = {
                trabajador_id: trabajador.id,
                tipo_licencia_id: tipoLicencia.id,
                fecha_inicio: new Date().toISOString().split('T')[0], // Fecha actual
                fecha_fin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +2 días
                motivo: 'Test normal',
                estado: 'APROBADA',
                fecha_solicitud: new Date().toISOString().split('T')[0],
                afecta_disponibilidad: true // ← CLAVE: Licencia normal
            };

            const solicitud = await this.solicitudesService.create(solicitudData);
            
            // Verificar que la licencia se creó con afecta_disponibilidad = true
            const licenciaRepo = AppDataSource.getRepository(Licencia);
            const licencia = await licenciaRepo.findOne({
                where: { solicitud_id: solicitud.id }
            });

            const disponibilidadFinal = await this.disponibilidadService.findByTrabajador(trabajador.id);
            const disponibilidadTipoFinal = disponibilidadFinal.find(d => d.tipo_licencia_id === tipoLicencia.id);
            const diasRestantesFinal = disponibilidadTipoFinal ? disponibilidadTipoFinal.dias_restantes : 0;

            const passed = licencia.afecta_disponibilidad === true && diasRestantesFinal < diasRestantesInicial;
            
            this.logTest('Crear licencia normal', passed, 
                `afecta_disponibilidad: ${licencia.afecta_disponibilidad}, ` +
                `días restantes: ${diasRestantesInicial} → ${diasRestantesFinal}`
            );

            return { solicitud, licencia };
        } catch (error) {
            this.logTest('Crear licencia normal', false, error.message);
            return null;
        }
    }

    async test3_UpdateLicenseToRetroactive() {
        console.log('\n🧪 Test 3: Actualizar licencia a retroactiva');
        
        try {
            // Primero crear una licencia normal
            const result = await this.test2_CreateNormalLicense();
            if (!result) {
                this.logTest('Actualizar licencia a retroactiva', false, 'No se pudo crear licencia base');
                return;
            }

            const { solicitud, licencia } = result;
            
            // Obtener disponibilidad antes del cambio
            const disponibilidadAntes = await this.disponibilidadService.findByTrabajador(solicitud.trabajador_id);
            const disponibilidadTipoAntes = disponibilidadAntes.find(d => d.tipo_licencia_id === solicitud.tipo_licencia_id);
            const diasRestantesAntes = disponibilidadTipoAntes ? disponibilidadTipoAntes.dias_restantes : 0;

            // Actualizar la solicitud para hacerla retroactiva
            const updateData = {
                afecta_disponibilidad: false
            };

            await this.solicitudesService.update(solicitud.id, updateData);
            
            // Verificar que la licencia se actualizó
            const licenciaRepo = AppDataSource.getRepository(Licencia);
            const licenciaActualizada = await licenciaRepo.findOne({
                where: { solicitud_id: solicitud.id }
            });

            const disponibilidadDespues = await this.disponibilidadService.findByTrabajador(solicitud.trabajador_id);
            const disponibilidadTipoDespues = disponibilidadDespues.find(d => d.tipo_licencia_id === solicitud.tipo_licencia_id);
            const diasRestantesDespues = disponibilidadTipoDespues ? disponibilidadTipoDespues.dias_restantes : 0;

            const passed = licenciaActualizada.afecta_disponibilidad === false && diasRestantesDespues > diasRestantesAntes;
            
            this.logTest('Actualizar licencia a retroactiva', passed, 
                `afecta_disponibilidad: ${licenciaActualizada.afecta_disponibilidad}, ` +
                `días restantes: ${diasRestantesAntes} → ${diasRestantesDespues}`
            );

        } catch (error) {
            this.logTest('Actualizar licencia a retroactiva', false, error.message);
        }
    }

    async test4_DisponibilidadCalculation() {
        console.log('\n🧪 Test 4: Cálculo de disponibilidad excluye licencias retroactivas');
        
        try {
            const trabajador = await this.getTrabajadorT001();
            const tipoLicencia = await this.getPrimerTipoLicencia();
            if (!trabajador || !tipoLicencia) {
                this.logTest('Cálculo de disponibilidad', false, 'No se encontró trabajador T001 o tipo de licencia');
                return;
            }

            // Obtener disponibilidad calculada por el servicio
            const disponibilidadCalculada = await this.disponibilidadService.findByTrabajador(trabajador.id);
            const disponibilidadTipo = disponibilidadCalculada.find(d => d.tipo_licencia_id === tipoLicencia.id);

            // Obtener licencias manualmente
            const licenciaRepo = AppDataSource.getRepository(Licencia);
            const todasLasLicencias = await licenciaRepo.find({
                where: {
                    trabajador_id: trabajador.id,
                    tipo_licencia_id: tipoLicencia.id,
                    estado: 'ACTIVA'
                }
            });

            const licenciasQueAfectan = todasLasLicencias.filter(l => l.afecta_disponibilidad === true);
            const licenciasRetroactivas = todasLasLicencias.filter(l => l.afecta_disponibilidad === false);

            const passed = disponibilidadTipo && 
                          disponibilidadTipo.dias_usados === licenciasQueAfectan.length &&
                          licenciasRetroactivas.length > 0;
            
            this.logTest('Cálculo de disponibilidad', passed, 
                `Licencias totales: ${todasLasLicencias.length}, ` +
                `Que afectan: ${licenciasQueAfectan.length}, ` +
                `Retroactivas: ${licenciasRetroactivas.length}, ` +
                `Días usados calculados: ${disponibilidadTipo ? disponibilidadTipo.dias_usados : 'N/A'}`
            );

        } catch (error) {
            this.logTest('Cálculo de disponibilidad', false, error.message);
        }
    }

    async test5_FrontendDataFlow() {
        console.log('\n🧪 Test 5: Flujo de datos frontend-backend');
        
        try {
            // Simular datos que vendrían del frontend
            const frontendData = {
                trabajador_id: 1,
                tipo_licencia_id: 1,
                fecha_inicio: '2023-01-15',
                fecha_fin: '2023-01-17',
                motivo: 'Test frontend',
                estado: 'APROBADA',
                fecha_solicitud: new Date().toISOString().split('T')[0],
                afecta_disponibilidad: false // ← Valor del checkbox del frontend
            };

            // Verificar que el backend recibe y procesa correctamente
            const solicitud = await this.solicitudesService.create(frontendData);
            
            const licenciaRepo = AppDataSource.getRepository(Licencia);
            const licencia = await licenciaRepo.findOne({
                where: { solicitud_id: solicitud.id }
            });

            const passed = licencia && licencia.afecta_disponibilidad === false;
            
            this.logTest('Flujo de datos frontend-backend', passed, 
                `Valor enviado: ${frontendData.afecta_disponibilidad}, ` +
                `Valor guardado: ${licencia ? licencia.afecta_disponibilidad : 'N/A'}`
            );

        } catch (error) {
            this.logTest('Flujo de datos frontend-backend', false, error.message);
        }
    }

    async runAllTests() {
        console.log('🚀 Iniciando tests de afecta_disponibilidad...\n');
        
        const initialized = await this.initialize();
        if (!initialized) {
            console.log('❌ No se pudo inicializar la base de datos');
            return;
        }

        try {
            await this.test1_CreateRetroactiveLicense();
            await this.test2_CreateNormalLicense();
            await this.test3_UpdateLicenseToRetroactive();
            await this.test4_DisponibilidadCalculation();
            await this.test5_FrontendDataFlow();

            // Resumen final
            console.log('\n📊 RESUMEN DE TESTS:');
            console.log('='.repeat(50));
            
            const passed = this.testResults.filter(r => r.passed).length;
            const total = this.testResults.length;
            
            this.testResults.forEach(result => {
                const status = result.passed ? '✅' : '❌';
                console.log(`${status} ${result.test}`);
                if (result.details) console.log(`   ${result.details}`);
            });
            
            console.log('\n' + '='.repeat(50));
            console.log(`🎯 Resultado: ${passed}/${total} tests pasaron`);
            
            if (passed === total) {
                console.log('🎉 ¡TODOS LOS TESTS PASARON! La funcionalidad está funcionando correctamente.');
            } else {
                console.log('⚠️  Algunos tests fallaron. Revisar la implementación.');
            }

        } catch (error) {
            console.error('❌ Error ejecutando tests:', error.message);
        } finally {
            await this.cleanup();
        }
    }
}

// Ejecutar los tests si se llama directamente
if (require.main === module) {
    const test = new TestAfectaDisponibilidad();
    test.runAllTests();
}

module.exports = TestAfectaDisponibilidad; 