const { AppDataSource } = require('../config/database');

async function updateDisponibilidad() {
  await AppDataSource.initialize();
  const disponibilidadRepo = AppDataSource.getRepository('Disponibilidad');
  const tipoLicenciaRepo = AppDataSource.getRepository('TipoLicencia');

  const disponibilidades = await disponibilidadRepo.find();
  let count = 0;
  for (const disp of disponibilidades) {
    const tipo = await tipoLicenciaRepo.findOne({ where: { id: disp.tipo_licencia_id } });
    if (tipo) {
      disp.dias_disponibles = tipo.duracion_maxima;
      disp.dias_restantes = disp.dias_disponibles - disp.dias_usados;
      await disponibilidadRepo.save(disp);
      count++;
    }
  }
  await AppDataSource.destroy();
  console.log(`Actualizadas ${count} disponibilidades.`);
}

updateDisponibilidad().catch(e => {
  console.error(e);
  process.exit(1);
}); 