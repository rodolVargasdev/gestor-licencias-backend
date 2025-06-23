const { AppDataSource } = require('../config/database');
const Disponibilidad = require('../models/disponibilidad.model');
const TipoLicencia = require('../models/tipo-licencia.model');

async function fixDisponibilidadData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos inicializada.');

    const disponibilidadRepo = AppDataSource.getRepository(Disponibilidad);
    const tipoLicenciaRepo = AppDataSource.getRepository(TipoLicencia);

    const todasLasDisponibilidades = await disponibilidadRepo.find();
    console.log(`🔎 Se encontraron ${todasLasDisponibilidades.length} registros de disponibilidad para verificar.`);

    let updatedCount = 0;
    const tiposLicenciaCache = {};

    for (const disp of todasLasDisponibilidades) {
      // Usar un cache simple para no consultar el mismo tipo de licencia múltiples veces
      if (!tiposLicenciaCache[disp.tipo_licencia_id]) {
          tiposLicenciaCache[disp.tipo_licencia_id] = await tipoLicenciaRepo.findOne({ where: { id: disp.tipo_licencia_id } });
      }
      const tipoLicencia = tiposLicenciaCache[disp.tipo_licencia_id];

      if (!tipoLicencia) {
        console.warn(`⚠️ No se encontró el Tipo de Licencia con ID ${disp.tipo_licencia_id}. Saltando registro.`);
        continue;
      }

      const correctDiasDisponibles = parseFloat(tipoLicencia.duracion_maxima) || 0;
      const diasUsados = parseFloat(disp.dias_usados) || 0;
      const correctDiasRestantes = correctDiasDisponibles - diasUsados;

      const currentDiasDisponibles = parseFloat(disp.dias_disponibles);
      const currentDiasRestantes = parseFloat(disp.dias_restantes);

      // Verificar si algún valor es incorrecto y necesita ser actualizado
      if (currentDiasDisponibles !== correctDiasDisponibles || currentDiasRestantes !== correctDiasRestantes) {
        console.log(`🔧 Corrigiendo disponibilidad para trabajador ${disp.trabajador_id} | tipo ${disp.tipo_licencia_id}...`);
        console.log(`   - Días disponibles (actual): ${currentDiasDisponibles} -> (correcto): ${correctDiasDisponibles}`);
        console.log(`   - Días restantes (actual): ${currentDiasRestantes} -> (correcto): ${correctDiasRestantes}`);

        disp.dias_disponibles = correctDiasDisponibles;
        disp.dias_restantes = correctDiasRestantes;
        
        await disponibilidadRepo.save(disp);
        updatedCount++;
        console.log(`   ✔️ Registro actualizado.`);
      }
    }

    console.log(`\n✨ Proceso de reparación completado. Se actualizaron ${updatedCount} registros.`);
  } catch (error) {
    console.error('❌ Error durante la reparación de datos de disponibilidad:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexión a la base de datos cerrada.');
    }
  }
}

fixDisponibilidadData(); 