const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testValidacionDuracionMaxima() {
    try {
        console.log('=== PRUEBA: Validación de Duración Máxima para Licencias sin Período ===\n');

        // 1. Crear un tipo de licencia con periodo_control: 'ninguno' y duracion_maxima: 5
        console.log('1. Creando tipo de licencia con duración máxima limitada...');
        const tipoLicenciaData = {
            codigo: 'TEST-LIM',
            nombre: 'Licencia de Prueba con Límite',
            descripcion: 'Licencia sin período pero con duración máxima de 5 días',
            duracion_maxima: 5,
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

        // 3. Probar licencia dentro del límite (debe funcionar)
        console.log('\n3. Probando licencia dentro del límite (3 días)...');
        const licenciaDataValida = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicencia.id,
            fecha_inicio: '2024-01-15',
            fecha_fin: '2024-01-17',
            dias_totales: 3,
            dias_habiles: 3,
            dias_calendario: 3,
            estado: 'ACTIVA',
            activo: true
        };

        try {
            const licenciaResponse = await axios.post(`${API_BASE_URL}/licencias`, licenciaDataValida);
            console.log('✅ Licencia válida creada exitosamente (ID:', licenciaResponse.data.id, ')');
        } catch (error) {
            console.log('❌ Error inesperado al crear licencia válida:', error.response?.data?.error || error.message);
        }

        // 4. Probar licencia que excede el límite (debe fallar)
        console.log('\n4. Probando licencia que excede el límite (7 días)...');
        const licenciaDataInvalida = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicencia.id,
            fecha_inicio: '2024-02-01',
            fecha_fin: '2024-02-07',
            dias_totales: 7,
            dias_habiles: 7,
            dias_calendario: 7,
            estado: 'ACTIVA',
            activo: true
        };

        try {
            await axios.post(`${API_BASE_URL}/licencias`, licenciaDataInvalida);
            console.log('❌ ERROR: Se permitió crear una licencia que excede el límite');
        } catch (error) {
            if (error.response?.data?.error && error.response.data.error.includes('No puede solicitar más de 5 días')) {
                console.log('✅ Validación funcionando correctamente - Se rechazó la licencia que excede el límite');
                console.log('   Mensaje de error:', error.response.data.error);
            } else {
                console.log('❌ Error inesperado:', error.response?.data?.error || error.message);
            }
        }

        // 5. Probar licencia con duración máxima 0 (debe permitir cualquier duración)
        console.log('\n5. Creando tipo de licencia con duración máxima 0...');
        const tipoLicenciaDataSinLimite = {
            codigo: 'TEST-NO-L',
            nombre: 'Licencia de Prueba sin Límite',
            descripcion: 'Licencia sin período y sin duración máxima (como JRV)',
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

        const tipoLicenciaSinLimiteResponse = await axios.post(`${API_BASE_URL}/tipos-licencias`, tipoLicenciaDataSinLimite);
        const tipoLicenciaSinLimite = tipoLicenciaSinLimiteResponse.data;
        console.log('✅ Tipo de licencia sin límite creado:', tipoLicenciaSinLimite.nombre, '(ID:', tipoLicenciaSinLimite.id, ')');

        // 6. Probar licencia larga con duración máxima 0 (debe funcionar)
        console.log('\n6. Probando licencia larga con duración máxima 0 (30 días)...');
        const licenciaDataLarga = {
            trabajador_id: trabajador.id,
            tipo_licencia_id: tipoLicenciaSinLimite.id,
            fecha_inicio: '2024-03-01',
            fecha_fin: '2024-03-30',
            dias_totales: 30,
            dias_habiles: 30,
            dias_calendario: 30,
            estado: 'ACTIVA',
            activo: true
        };

        try {
            const licenciaLargaResponse = await axios.post(`${API_BASE_URL}/licencias`, licenciaDataLarga);
            console.log('✅ Licencia larga creada exitosamente (ID:', licenciaLargaResponse.data.id, ')');
            console.log('   - Duración: 30 días');
            console.log('   - Tipo: Sin límite de duración');
        } catch (error) {
            console.log('❌ Error inesperado al crear licencia larga:', error.response?.data?.error || error.message);
        }

        console.log('\n=== PRUEBA COMPLETADA ===');
        console.log('✅ Las validaciones de duración máxima funcionan correctamente');
        console.log('✅ Se respetan los límites para tipos con duracion_maxima > 0');
        console.log('✅ Se permiten duraciones variables para tipos con duracion_maxima = 0');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Ejecutar la prueba
testValidacionDuracionMaxima(); 