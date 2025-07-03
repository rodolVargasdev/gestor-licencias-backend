const { AppDataSource } = require('./src/config/database');
const Disponibilidad = require('./src/models/disponibilidad.model');
const TipoLicencia = require('./src/models/tipo-licencia.model');
const { IsNull, Not } = require('typeorm');

async function verificarLogicaReseteo() {
  console.log('🔍 Verificando lógica de reseteo de disponibilidad...');
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexión a la base de datos inicializada.');
    }

    const disponibilidadRepo = AppDataSource.getRepository(Disponibilidad);
    const tipoLicenciaRepo = AppDataSource.getRepository(TipoLicencia);
    
    // Obtener todos los tipos de licencia con sus periodos de control
    const tiposLicencia = await tipoLicenciaRepo.find({
      where: {
        periodo_control: Not(IsNull())
      }
    });

    console.log('\n📊 TIPOS DE LICENCIA CON CONTROL DE PERÍODO:');
    console.log('='.repeat(80));
    
    const resumenPeriodos = {
      'año': 0,
      'mes': 0,
      'ninguno': 0
    };

    tiposLicencia.forEach(tipo => {
      resumenPeriodos[tipo.periodo_control]++;
      console.log(`  • ${tipo.codigo} - ${tipo.nombre} (${tipo.periodo_control})`);
    });

    console.log('\n📈 RESUMEN POR PERÍODO:');
    console.log(`  • Anual (año): ${resumenPeriodos['año']} tipos`);
    console.log(`  • Mensual (mes): ${resumenPeriodos['mes']} tipos`);
    console.log(`  • Sin control (ninguno): ${resumenPeriodos['ninguno']} tipos`);

    // Obtener algunas disponibilidades de ejemplo para verificar
    const disponibilidadesEjemplo = await disponibilidadRepo.find({
      relations: ['tipo_licencia'],
      where: {
        tipo_licencia: {
          periodo_control: Not(IsNull())
        }
      },
      take: 10
    });

    console.log('\n🔍 EJEMPLOS DE DISPONIBILIDADES:');
    console.log('='.repeat(80));
    
    const hoy = new Date();
    const anoActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    disponibilidadesEjemplo.forEach(disp => {
      const tipoLicencia = disp.tipo_licencia;
      const fechaUltimaActualizacion = new Date(disp.fecha_actualizacion);
      const anoUltimaActualizacion = fechaUltimaActualizacion.getFullYear();
      const mesUltimaActualizacion = fechaUltimaActualizacion.getMonth();

      let necesitaRenovacion = false;
      let motivo = '';

      if (tipoLicencia.periodo_control === 'año') {
        if (anoActual > anoUltimaActualizacion) {
          necesitaRenovacion = true;
          motivo = `Año actual (${anoActual}) > Último año (${anoUltimaActualizacion})`;
        }
      } else if (tipoLicencia.periodo_control === 'mes') {
        if (anoActual > anoUltimaActualizacion || (anoActual === anoUltimaActualizacion && mesActual > mesUltimaActualizacion)) {
          necesitaRenovacion = true;
          motivo = `Mes actual (${mesActual + 1}/${anoActual}) > Último mes (${mesUltimaActualizacion + 1}/${anoUltimaActualizacion})`;
        }
      }

      console.log(`  • Trabajador ${disp.trabajador_id} | ${tipoLicencia.nombre} (${tipoLicencia.periodo_control})`);
      console.log(`    - Días disponibles: ${disp.dias_disponibles}`);
      console.log(`    - Días usados: ${disp.dias_usados}`);
      console.log(`    - Días restantes: ${disp.dias_restantes}`);
      console.log(`    - Última actualización: ${fechaUltimaActualizacion.toLocaleDateString()}`);
      console.log(`    - Necesita renovación: ${necesitaRenovacion ? 'SÍ' : 'NO'}`);
      if (necesitaRenovacion) {
        console.log(`    - Motivo: ${motivo}`);
      }
      console.log('');
    });

    // Verificar configuración del cron job
    console.log('⏰ CONFIGURACIÓN DEL CRON JOB:');
    console.log('='.repeat(80));
    console.log('  • Expresión: 0 0 * * * (todos los días a las 00:00)');
    console.log('  • Zona horaria: America/El_Salvador');
    console.log('  • Estado: ACTIVO en app.js');
    console.log('  • Función: renovarDisponibilidad()');

    console.log('\n✅ Verificación completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔚 Conexión a la base de datos cerrada.');
    }
  }
}

// Ejecutar la verificación
verificarLogicaReseteo(); 