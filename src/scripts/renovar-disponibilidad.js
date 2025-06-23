const { AppDataSource } = require('../config/database');
const Disponibilidad = require('../models/disponibilidad.model');
const TipoLicencia = require('../models/tipo-licencia.model');
const { IsNull, Not } = require('typeorm');

/**
 * Script para renovar la disponibilidad de licencias (días/horas) para todos los trabajadores.
 * Se ejecuta periódicamente (ej. diariamente) a través de un cron job.
 * - Para licencias con control 'anual', resetea la disponibilidad si ha comenzado un nuevo año.
 * - Para licencias con control 'mensual', resetea la disponibilidad si ha comenzado un nuevo mes.
 */
async function renovarDisponibilidad() {
  console.log('🔄 Inciando proceso de renovación de disponibilidad...');
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexión a la base de datos inicializada.');
    }

    const disponibilidadRepo = AppDataSource.getRepository(Disponibilidad);
    
    // Obtener todas las disponibilidades con su tipo de licencia asociado
    const todasLasDisponibilidades = await disponibilidadRepo.find({
      relations: ['tipo_licencia'],
      where: {
        tipo_licencia: {
          periodo_control: Not(IsNull())
        }
      }
    });

    if (todasLasDisponibilidades.length === 0) {
      console.log('ℹ️ No se encontraron disponibilidades para renovar.');
      return;
    }

    console.log(`🔎 Se encontraron ${todasLasDisponibilidades.length} registros de disponibilidad para verificar.`);

    const hoy = new Date();
    const anoActual = hoy.getFullYear();
    const mesActual = hoy.getMonth(); // 0-11
    let registrosActualizados = 0;

    for (const disp of todasLasDisponibilidades) {
      const tipoLicencia = disp.tipo_licencia;
      
      // Si no hay tipo de licencia o periodo de control, no se puede procesar
      if (!tipoLicencia || !tipoLicencia.periodo_control || tipoLicencia.periodo_control === 'ninguno') {
        continue;
      }
      
      const fechaUltimaActualizacion = new Date(disp.updated_at);
      const anoUltimaActualizacion = fechaUltimaActualizacion.getFullYear();
      const mesUltimaActualizacion = fechaUltimaActualizacion.getMonth();

      let necesitaRenovacion = false;

      // Lógica para renovación anual
      if (tipoLicencia.periodo_control === 'anual') {
        if (anoActual > anoUltimaActualizacion) {
          necesitaRenovacion = true;
          console.log(`  -> Renovación ANUAL para trabajador ${disp.trabajador_id}, licencia ${tipoLicencia.nombre}`);
        }
      }

      // Lógica para renovación mensual
      if (tipoLicencia.periodo_control === 'mensual') {
        // Renovar si el año es mayor, o si es el mismo año pero el mes es mayor
        if (anoActual > anoUltimaActualizacion || (anoActual === anoUltimaActualizacion && mesActual > mesUltimaActualizacion)) {
          necesitaRenovacion = true;
          console.log(`  -> Renovación MENSUAL para trabajador ${disp.trabajador_id}, licencia ${tipoLicencia.nombre}`);
        }
      }
      
      // Si necesita renovación, actualizar el registro
      if (necesitaRenovacion) {
        disp.dias_usados = 0;
        disp.dias_restantes = disp.dias_disponibles; // Restaurar al total disponible
        
        await disponibilidadRepo.save(disp);
        registrosActualizados++;
      }
    }

    if (registrosActualizados > 0) {
      console.log(`✅ Proceso de renovación finalizado. Se actualizaron ${registrosActualizados} registros.`);
    } else {
      console.log('✅ Proceso de renovación finalizado. No fue necesario actualizar ningún registro.');
    }

  } catch (error) {
    console.error('❌ Error durante el proceso de renovación de disponibilidad:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      // No cerramos la conexión si el script es llamado desde el servidor principal
      // await AppDataSource.destroy();
      // console.log('🔚 Conexión a la base de datos cerrada.');
    }
  }
}

// Permitir que el script se ejecute directamente desde la línea de comandos para pruebas
if (require.main === module) {
  renovarDisponibilidad().then(() => {
    if (AppDataSource.isInitialized) {
      AppDataSource.destroy();
    }
  });
}

module.exports = { renovarDisponibilidad }; 