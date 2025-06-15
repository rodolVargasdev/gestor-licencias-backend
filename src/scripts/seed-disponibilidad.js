const { AppDataSource } = require('../config/database');

async function seedDisponibilidad() {
  await AppDataSource.initialize();
  const trabajadorRepo = AppDataSource.getRepository('Trabajador');
  const tipoLicenciaRepo = AppDataSource.getRepository('TipoLicencia');
  const disponibilidadRepo = AppDataSource.getRepository('Disponibilidad');

  const trabajadores = await trabajadorRepo.find();
  const tipos = await tipoLicenciaRepo.find({ where: { activo: true } });

  let count = 0;
  for (const trabajador of trabajadores) {
    for (const tipo of tipos) {
      const existe = await disponibilidadRepo.findOne({
        where: {
          trabajador_id: trabajador.id,
          tipo_licencia_id: tipo.id
        }
      });
      if (!existe) {
        await disponibilidadRepo.save({
          trabajador_id: trabajador.id,
          tipo_licencia_id: tipo.id,
          dias_disponibles: tipo.duracion_maxima,
          dias_usados: 0,
          dias_restantes: tipo.duracion_maxima
        });
        count++;
      }
    }
  }
  await AppDataSource.destroy();
  console.log(`Disponibilidad inicializada para ${count} combinaciones nuevas.`);
}

seedDisponibilidad().catch(e => {
  console.error(e);
  process.exit(1);
}); 