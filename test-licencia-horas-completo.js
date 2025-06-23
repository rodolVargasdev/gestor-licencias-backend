const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testLicenciaHoras() {
  console.log('🧪 Iniciando prueba completa de licencias por horas...\n');

  try {
    // 1. Obtener trabajadores
    console.log('1️⃣ Obteniendo trabajadores...');
    const trabajadoresResponse = await axios.get(`${API_BASE_URL}/trabajadores`);
    const trabajador = trabajadoresResponse.data[0];
    console.log(`   Trabajador seleccionado: ${trabajador.nombre_completo} (ID: ${trabajador.id})\n`);

    // 2. Obtener tipos de licencia por horas
    console.log('2️⃣ Obteniendo tipos de licencia por horas...');
    const tiposResponse = await axios.get(`${API_BASE_URL}/tipos-licencias`);
    const tipoHoras = tiposResponse.data.find(t => t.unidad_control === 'horas');
    console.log(`   Tipo de licencia por horas: ${tipoHoras.nombre} (ID: ${tipoHoras.id})\n`);

    // 3. Crear solicitud por horas
    console.log('3️⃣ Creando solicitud por horas...');
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaInicio = '08:00';
    const horaFin = '12:00';
    
    const solicitudData = {
      trabajador_id: trabajador.id,
      tipo_licencia_id: tipoHoras.id,
      fecha_inicio: `${fechaActual}T${horaInicio}`,
      fecha_fin: `${fechaActual}T${horaFin}`,
      motivo: 'Prueba de licencia por horas',
      estado: 'APROBADA',
      fecha_solicitud: fechaActual
    };

    console.log('   Datos de solicitud:', {
      fecha_inicio: solicitudData.fecha_inicio,
      fecha_fin: solicitudData.fecha_fin,
      diferencia_horas_esperada: 4
    });

    const solicitudResponse = await axios.post(`${API_BASE_URL}/solicitudes`, solicitudData);
    const solicitudCreada = solicitudResponse.data;
    console.log(`   ✅ Solicitud creada con ID: ${solicitudCreada.id}\n`);

    // 4. Verificar licencia creada
    console.log('4️⃣ Verificando licencia creada...');
    const licenciasResponse = await axios.get(`${API_BASE_URL}/licencias`);
    const licenciaCreada = licenciasResponse.data.find(l => l.solicitud_id === solicitudCreada.id);
    
    if (licenciaCreada) {
      console.log('   ✅ Licencia encontrada:');
      console.log(`      - ID: ${licenciaCreada.id}`);
      console.log(`      - Fecha inicio: ${licenciaCreada.fecha_inicio}`);
      console.log(`      - Fecha fin: ${licenciaCreada.fecha_fin}`);
      console.log(`      - Horas totales: ${licenciaCreada.horas_totales}`);
      console.log(`      - Días totales: ${licenciaCreada.dias_totales}`);
      console.log(`      - Días hábiles: ${licenciaCreada.dias_habiles}`);
      console.log(`      - Días calendario: ${licenciaCreada.dias_calendario}`);
    } else {
      console.log('   ❌ No se encontró licencia asociada');
    }
    console.log('');

    // 5. Actualizar solicitud
    console.log('5️⃣ Actualizando solicitud...');
    const nuevaHoraInicio = '09:00';
    const nuevaHoraFin = '14:00';
    
    const updateData = {
      fecha_inicio: `${fechaActual}T${nuevaHoraInicio}`,
      fecha_fin: `${fechaActual}T${nuevaHoraFin}`,
      motivo: 'Prueba actualizada de licencia por horas'
    };

    console.log('   Nuevos datos:', {
      fecha_inicio: updateData.fecha_inicio,
      fecha_fin: updateData.fecha_fin,
      diferencia_horas_esperada: 5
    });

    const updateResponse = await axios.put(`${API_BASE_URL}/solicitudes/${solicitudCreada.id}`, updateData);
    console.log(`   ✅ Solicitud actualizada\n`);

    // 6. Verificar licencia actualizada
    console.log('6️⃣ Verificando licencia actualizada...');
    const licenciasActualizadasResponse = await axios.get(`${API_BASE_URL}/licencias`);
    const licenciaActualizada = licenciasActualizadasResponse.data.find(l => l.solicitud_id === solicitudCreada.id);
    
    if (licenciaActualizada) {
      console.log('   ✅ Licencia actualizada:');
      console.log(`      - ID: ${licenciaActualizada.id}`);
      console.log(`      - Fecha inicio: ${licenciaActualizada.fecha_inicio}`);
      console.log(`      - Fecha fin: ${licenciaActualizada.fecha_fin}`);
      console.log(`      - Horas totales: ${licenciaActualizada.horas_totales}`);
      console.log(`      - Días totales: ${licenciaActualizada.dias_totales}`);
      console.log(`      - Días hábiles: ${licenciaActualizada.dias_habiles}`);
      console.log(`      - Días calendario: ${licenciaActualizada.dias_calendario}`);
    } else {
      console.log('   ❌ No se encontró licencia actualizada');
    }
    console.log('');

    // 7. Verificar disponibilidad
    console.log('7️⃣ Verificando disponibilidad...');
    const disponibilidadResponse = await axios.get(`${API_BASE_URL}/disponibilidad/trabajador/${trabajador.id}`);
    const disponibilidad = disponibilidadResponse.data.find(d => d.tipo_licencia.id === tipoHoras.id);
    
    if (disponibilidad) {
      console.log('   ✅ Disponibilidad:');
      console.log(`      - Días disponibles: ${disponibilidad.dias_disponibles}`);
      console.log(`      - Días usados: ${disponibilidad.dias_usados}`);
      console.log(`      - Días restantes: ${disponibilidad.dias_restantes}`);
    } else {
      console.log('   ❌ No se encontró disponibilidad');
    }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testLicenciaHoras(); 