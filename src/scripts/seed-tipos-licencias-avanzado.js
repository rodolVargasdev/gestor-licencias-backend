const { AppDataSource } = require('../config/database');
const TipoLicencia = require('../models/tipo-licencia.model');

const seedTiposLicencias = async () => {
  await AppDataSource.initialize();

  const tipos = [
    {
      nombre: 'Permiso Personal',
      descripcion: 'Permiso personal por horas',
      duracion_maxima: 40, // horas
      unidad_control: 'horas',
      periodo_control: 'año',
      activo: true,
    },
    {
      nombre: 'Cambio de Turno',
      descripcion: 'Cambio de turno mensual',
      duracion_maxima: 3, // cambios
      unidad_control: 'días',
      periodo_control: 'mes',
      activo: true,
    },
    {
      nombre: 'Olvido de Marcación',
      descripcion: 'Olvido de marcación mensual',
      duracion_maxima: 2, // veces
      unidad_control: 'días',
      periodo_control: 'mes',
      activo: true,
    },
    {
      nombre: 'Llamado al Jurado',
      descripcion: 'Solo registro, sin control de disponibilidad',
      duracion_maxima: null,
      unidad_control: 'ninguno',
      periodo_control: 'ninguno',
      activo: true,
    },
  ];

  for (const tipo of tipos) {
    const exists = await AppDataSource.getRepository(TipoLicencia).findOne({ where: { nombre: tipo.nombre } });
    if (!exists) {
      await AppDataSource.getRepository(TipoLicencia).save(tipo);
      console.log(`Tipo de licencia creado: ${tipo.nombre}`);
    } else {
      console.log(`Ya existe: ${tipo.nombre}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seed finalizado.');
};

seedTiposLicencias().catch(console.error); 