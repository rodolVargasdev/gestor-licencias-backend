const { AppDataSource } = require('./src/config/database');
const SolicitudesService = require('./src/services/solicitudes.service');
const DisponibilidadService = require('./src/services/disponibilidad.service');
const LicenciasService = require('./src/services/licencias.service');

async function testLicenciaHorasCompleto() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Base de datos conectada');

        // 1. Buscar un tipo de licencia por horas
        const tiposLicenciasRepository = AppDataSource.getRepository('TipoLicencia');
        const tipoLicencia = await tiposLicenciasRepository.findOne({
            where: { unidad_control: 'horas' }
        });

        if (!tipoLicencia) {
            console.log('❌ No se encontró ningún tipo de licencia por horas');
            return;
        }

        console.log('✅ Tipo de licencia encontrado:', tipoLicencia.nombre);
        console.log('   - Duración máxima:', tipoLicencia.duracion_maxima, 'horas');
        console.log('   - Unidad de control:', tipoLicencia.unidad_control);

        // 2. Buscar un trabajador
        const trabajadoresRepository = AppDataSource.getRepository('Trabajador');
        const trabajador = await trabajadoresRepository.findOne({
            where: { id: 1 }
        });

        if (!trabajador) {
            console.log('❌ No se encontró el trabajador con ID 1');
            return;
        }

        console.log('✅ Trabajador encontrado:', trabajador.nombre_completo);

        // 3. Verificar disponibilidad inicial
        console.log('\n📊 DISPONIBILIDAD INICIAL:');
        const disponibilidadInicial = await DisponibilidadService.findByTrabajador(trabajador.id);
        const disponibilidadTipo = disponibilidadInicial.find(d => d.tipo_licencia_id === tipoLicencia.id);
        
        if (disponibilidadTipo) {
            console.log('   - Disponible:', disponibilidadTipo.dias_disponibles, 'horas');
            console.log('   - Usado:', disponibilidadTipo.dias_usados, 'horas');
            console.log('   - Restante:', disponibilidadTipo.dias_restantes, 'horas');
        } else {
            console.log('   - No hay disponibilidad registrada para este tipo');
        }

        // 4. Simular creación de solicitud por horas
        console.log('\n🔄 CREANDO SOLICITUD DE LICENCIA POR HORAS...');
        
        const solicitudData = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicencia.id,
            fecha_inicio: '2024-01-15T08:00:00', // 8:00 AM
            fecha_fin: '2024-01-15T12:00:00',    // 12:00 PM (4 horas)
            motivo: 'Test de licencia por horas',
            estado: 'APROBADA',
            fecha_solicitud: '2024-01-14'
        };

        console.log('   - Fecha inicio:', solicitudData.fecha_inicio);
        console.log('   - Fecha fin:', solicitudData.fecha_fin);
        
        // Calcular horas esperadas
        const inicio = new Date(solicitudData.fecha_inicio);
        const fin = new Date(solicitudData.fecha_fin);
        const horasEsperadas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        console.log('   - Horas esperadas:', horasEsperadas);

        // 5. Crear la solicitud (esto también creará la licencia automáticamente)
        const solicitudCreada = await SolicitudesService.create(solicitudData);
        console.log('✅ Solicitud creada con ID:', solicitudCreada.id);

        // 6. Verificar que se creó la licencia
        console.log('\n📋 VERIFICANDO LICENCIA CREADA:');
        const licenciasRepository = AppDataSource.getRepository('Licencia');
        const licencia = await licenciasRepository.findOne({
            where: { solicitud_id: solicitudCreada.id },
            relations: ['tipo_licencia']
        });

        if (licencia) {
            console.log('✅ Licencia encontrada:');
            console.log('   - ID:', licencia.id);
            console.log('   - Estado:', licencia.estado);
            console.log('   - Fecha inicio:', licencia.fecha_inicio);
            console.log('   - Fecha fin:', licencia.fecha_fin);
            console.log('   - Horas totales:', licencia.horas_totales);
            console.log('   - Días totales:', licencia.dias_totales);
            
            // Verificar que las horas totales son correctas
            if (Math.abs(licencia.horas_totales - horasEsperadas) < 0.01) {
                console.log('✅ Horas totales calculadas correctamente');
            } else {
                console.log('❌ Error en cálculo de horas totales');
                console.log('   - Esperado:', horasEsperadas);
                console.log('   - Obtenido:', licencia.horas_totales);
            }
        } else {
            console.log('❌ No se encontró la licencia');
        }

        // 7. Verificar disponibilidad actualizada
        console.log('\n📊 DISPONIBILIDAD DESPUÉS DE CREAR LICENCIA:');
        const disponibilidadFinal = await DisponibilidadService.findByTrabajador(trabajador.id);
        const disponibilidadTipoFinal = disponibilidadFinal.find(d => d.tipo_licencia_id === tipoLicencia.id);
        
        if (disponibilidadTipoFinal) {
            console.log('   - Disponible:', disponibilidadTipoFinal.dias_disponibles, 'horas');
            console.log('   - Usado:', disponibilidadTipoFinal.dias_usados, 'horas');
            console.log('   - Restante:', disponibilidadTipoFinal.dias_restantes, 'horas');
            
            // Verificar que la disponibilidad se actualizó correctamente
            if (disponibilidadTipo) {
                const horasUsadasEsperadas = disponibilidadTipo.dias_usados + horasEsperadas;
                const horasRestantesEsperadas = disponibilidadTipo.dias_disponibles - horasUsadasEsperadas;
                
                if (Math.abs(disponibilidadTipoFinal.dias_usados - horasUsadasEsperadas) < 0.01) {
                    console.log('✅ Disponibilidad actualizada correctamente');
                } else {
                    console.log('❌ Error en actualización de disponibilidad');
                    console.log('   - Usado esperado:', horasUsadasEsperadas);
                    console.log('   - Usado obtenido:', disponibilidadTipoFinal.dias_usados);
                }
            }
        } else {
            console.log('❌ No se encontró disponibilidad actualizada');
        }

        // 8. Crear una segunda licencia para verificar acumulación
        console.log('\n🔄 CREANDO SEGUNDA SOLICITUD (2 horas)...');
        
        const solicitudData2 = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicencia.id,
            fecha_inicio: '2024-01-16T14:00:00', // 2:00 PM
            fecha_fin: '2024-01-16T16:00:00',    // 4:00 PM (2 horas)
            motivo: 'Test segunda licencia por horas',
            estado: 'APROBADA',
            fecha_solicitud: '2024-01-14'
        };

        const solicitudCreada2 = await SolicitudesService.create(solicitudData2);
        console.log('✅ Segunda solicitud creada con ID:', solicitudCreada2.id);

        // 9. Verificar disponibilidad después de la segunda licencia
        console.log('\n📊 DISPONIBILIDAD DESPUÉS DE SEGUNDA LICENCIA:');
        const disponibilidadFinal2 = await DisponibilidadService.findByTrabajador(trabajador.id);
        const disponibilidadTipoFinal2 = disponibilidadFinal2.find(d => d.tipo_licencia_id === tipoLicencia.id);
        
        if (disponibilidadTipoFinal2) {
            console.log('   - Disponible:', disponibilidadTipoFinal2.dias_disponibles, 'horas');
            console.log('   - Usado:', disponibilidadTipoFinal2.dias_usados, 'horas');
            console.log('   - Restante:', disponibilidadTipoFinal2.dias_restantes, 'horas');
            
            // Verificar que se acumularon las horas
            const totalHorasEsperadas = horasEsperadas + 2; // 4 + 2 = 6 horas
            if (Math.abs(disponibilidadTipoFinal2.dias_usados - totalHorasEsperadas) < 0.01) {
                console.log('✅ Horas acumuladas correctamente');
            } else {
                console.log('❌ Error en acumulación de horas');
                console.log('   - Total esperado:', totalHorasEsperadas);
                console.log('   - Total obtenido:', disponibilidadTipoFinal2.dias_usados);
            }
        }

        console.log('\n🎉 TEST COMPLETADO');

    } catch (error) {
        console.error('❌ Error en el test:', error);
    } finally {
        await AppDataSource.destroy();
        console.log('🔌 Conexión a base de datos cerrada');
    }
}

testLicenciaHorasCompleto(); 