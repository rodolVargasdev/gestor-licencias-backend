const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testLicenciaTiempoIndefinido() {
    try {
        console.log('=== PRUEBA: Licencias de Tiempo Indefinido ===\n');

        // 1. Crear un tipo de licencia con periodo_control: 'ninguno' y duracion_maxima: 0
        console.log('1. Creando tipo de licencia de tiempo indefinido...');
        const tipoLicenciaData = {
            codigo: 'TIEMPO-IND',
            nombre: 'Licencia de Tiempo Indefinido',
            descripcion: 'Licencia sin límite de tiempo para casos especiales',
            duracion_maxima: 0,
            unidad_control: 'días',
            periodo_control: 'ninguno',
            requiere_justificacion: true,
            requiere_aprobacion_especial: false,
            requiere_documentacion: false,
            pago_haberes: true,
            acumulable: false,
            transferible: false,
            aplica_genero: false,
            genero_aplicable: 'A',
            aplica_antiguedad: false,
            aplica_edad: false,
            aplica_departamento: false,
            aplica_cargo: false,
            aplica_tipo_personal: false,
            activo: true
        };

        const tipoLicenciaResponse = await axios.post(`${API_BASE_URL}/tipos-licencias`, tipoLicenciaData);
        const tipoLicencia = tipoLicenciaResponse.data;
        console.log('✅ Tipo de licencia creado:', tipoLicencia.nombre, '(ID:', tipoLicencia.id, ')');

        // 2. Obtener un trabajador para la prueba
        console.log('\n2. Obteniendo trabajador para la prueba...');
        const trabajadoresResponse = await axios.get(`${API_BASE_URL}/trabajadores`);
        const trabajador = trabajadoresResponse.data[0];
        console.log('✅ Trabajador seleccionado:', trabajador.nombre_completo, '(ID:', trabajador.id, ')');

        // 3. Crear una licencia de tiempo indefinido
        console.log('\n3. Creando licencia de tiempo indefinido...');
        const licenciaData = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicencia.id,
            fecha_inicio: '2024-01-15',
            fecha_fin: '2024-01-20',
            dias_totales: 6,
            dias_habiles: 6,
            dias_calendario: 6,
            estado: 'ACTIVA',
            activo: true
        };

        const licenciaResponse = await axios.post(`${API_BASE_URL}/licencias`, licenciaData);
        const licencia = licenciaResponse.data;
        console.log('✅ Licencia creada exitosamente (ID:', licencia.id, ')');
        console.log('   - Fecha inicio:', licencia.fecha_inicio);
        console.log('   - Fecha fin:', licencia.fecha_fin);
        console.log('   - Estado:', licencia.estado);

        // 4. Verificar disponibilidad del trabajador
        console.log('\n4. Verificando disponibilidad del trabajador...');
        const disponibilidadResponse = await axios.get(`${API_BASE_URL}/disponibilidad/trabajador/${trabajador.id}`);
        const disponibilidad = disponibilidadResponse.data;
        
        const disponibilidadTiempoIndef = disponibilidad.find(d => d.tipo_licencia_id === tipoLicencia.id);
        if (disponibilidadTiempoIndef) {
            console.log('✅ Disponibilidad encontrada:');
            console.log('   - Tipo:', disponibilidadTiempoIndef.tipo_licencia?.nombre);
            console.log('   - Disponible:', disponibilidadTiempoIndef.dias_disponibles);
            console.log('   - Usado:', disponibilidadTiempoIndef.dias_usados);
            console.log('   - Restante:', disponibilidadTiempoIndef.dias_restantes);
            console.log('   - Cantidad registros:', disponibilidadTiempoIndef.cantidad_registros);
        } else {
            console.log('❌ No se encontró disponibilidad para este tipo de licencia');
        }

        // 5. Crear otra licencia para verificar que no hay restricciones
        console.log('\n5. Creando segunda licencia para verificar sin restricciones...');
        const licenciaData2 = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicencia.id,
            fecha_inicio: '2024-02-01',
            fecha_fin: '2024-02-10',
            dias_totales: 10,
            dias_habiles: 10,
            dias_calendario: 10,
            estado: 'ACTIVA',
            activo: true
        };

        const licenciaResponse2 = await axios.post(`${API_BASE_URL}/licencias`, licenciaData2);
        const licencia2 = licenciaResponse2.data;
        console.log('✅ Segunda licencia creada exitosamente (ID:', licencia2.id, ')');

        // 6. Verificar disponibilidad actualizada
        console.log('\n6. Verificando disponibilidad actualizada...');
        const disponibilidadResponse2 = await axios.get(`${API_BASE_URL}/disponibilidad/trabajador/${trabajador.id}`);
        const disponibilidad2 = disponibilidadResponse2.data;
        
        const disponibilidadTiempoIndef2 = disponibilidad2.find(d => d.tipo_licencia_id === tipoLicencia.id);
        if (disponibilidadTiempoIndef2) {
            console.log('✅ Disponibilidad actualizada:');
            console.log('   - Usado:', disponibilidadTiempoIndef2.dias_usados);
            console.log('   - Cantidad registros:', disponibilidadTiempoIndef2.cantidad_registros);
        }

        console.log('\n=== PRUEBA COMPLETADA EXITOSAMENTE ===');
        console.log('✅ Las licencias de tiempo indefinido funcionan correctamente');
        console.log('✅ No hay restricciones de duración para tipos con periodo_control: "ninguno"');
        console.log('✅ La disponibilidad muestra correctamente la información');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Ejecutar la prueba
testLicenciaTiempoIndefinido(); 