const { AppDataSource } = require('../config/database');
const Disponibilidad = require('../models/disponibilidad.model');
const TipoLicencia = require('../models/tipo-licencia.model');

async function migrarDiasAHorasDisponibilidad() {
  await AppDataSource.initialize();

  // 1. Buscar todos los tipos de licencia con unidad_control = 'horas'
  const tiposHoras = await AppDataSource.getRepository(TipoLicencia).find({
    where: { unidad_control: 'horas' }
  });

  if (!tiposHoras.length) {
    console.log('No hay tipos de licencia con unidad_control = "horas"');
    return;
  }

  const tipoIds = tiposHoras.map(t => t.id);

  // 2. Buscar todas las disponibilidades asociadas
  const disponibilidades = await AppDataSource.getRepository(Disponibilidad).find({
    where: tipoIds.map(id => ({ tipo_licencia_id: id }))
  });

  if (!disponibilidades.length) {
    console.log('No hay disponibilidades para convertir.');
    return;
  }

  // 3. Multiplicar los valores por 8 (días a horas)
  for (const disp of disponibilidades) {
    disp.dias_disponibles = disp.dias_disponibles * 8;
    disp.dias_usados = disp.dias_usados * 8;
    disp.dias_restantes = disp.dias_restantes * 8;
    await AppDataSource.getRepository(Disponibilidad).save(disp);
    console.log(`Actualizada disponibilidad ID ${disp.id}: ahora en horas.`);
  }

  console.log('Migración completada.');
  await AppDataSource.destroy();
}

migrarDiasAHorasDisponibilidad().catch(err => {
  console.error('Error en la migración:', err);
  process.exit(1);
}); 