const { AppDataSource } = require('../config/database');
const Solicitud = require('../models/solicitud.model');
const Licencia = require('../models/licencia.model');
const Limite = require('../models/limite.model');
const Validacion = require('../models/validacion.model');
const Trabajador = require('../models/trabajador.model');
const TipoLicencia = require('../models/tipo-licencia.model');

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().slice(0, 10);
}

async function seedSolicitudesLicencias() {
  await AppDataSource.initialize();
  const solicitudRepo = AppDataSource.getRepository('Solicitud');
  const licenciaRepo = AppDataSource.getRepository('Licencia');
  const limiteRepo = AppDataSource.getRepository('Limite');
  const validacionRepo = AppDataSource.getRepository('Validacion');
  const trabajadorRepo = AppDataSource.getRepository('Trabajador');
  const tipoLicenciaRepo = AppDataSource.getRepository('TipoLicencia');

  const trabajadores = await trabajadorRepo.find();
  const tiposLicencia = await tipoLicenciaRepo.find();
  const anio = 2025;

  // Poblar límites para cada trabajador y tipo de licencia
  for (const t of trabajadores) {
    for (const tipo of tiposLicencia) {
      const existe = await limiteRepo.findOneBy({ trabajador_id: t.id, tipo_licencia_id: tipo.id, anio });
      if (!existe) {
        await limiteRepo.save({
          trabajador_id: t.id,
          tipo_licencia_id: tipo.id,
          anio,
          dias_disponibles: tipo.dias_maximos,
          dias_utilizados: 0,
          activo: true
        });
      }
    }
  }

  // Crear solicitudes, licencias y validaciones para algunos trabajadores
  for (const t of trabajadores) {
    // Seleccionar 2 tipos de licencia aleatorios
    const tipos = tiposLicencia.sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const tipo of tipos) {
      const fecha_inicio = randomDate(new Date('2025-06-12'), new Date('2025-12-01'));
      const fecha_fin = randomDate(new Date(fecha_inicio), new Date('2025-12-31'));
      const dias = Math.max(1, Math.floor((new Date(fecha_fin) - new Date(fecha_inicio)) / (1000 * 60 * 60 * 24)));
      const solicitud = await solicitudRepo.save({
        trabajador_id: t.id,
        tipo_licencia_id: tipo.id,
        fecha_inicio,
        fecha_fin,
        motivo: 'Motivo de ejemplo para ' + tipo.nombre,
        estado: 'APROBADA',
        dias_solicitados: dias,
        dias_habiles: dias,
        dias_calendario: dias,
        activo: true
      });
      // Crear licencia asociada
      await licenciaRepo.save({
        solicitud_id: solicitud.id,
        trabajador_id: t.id,
        tipo_licencia_id: tipo.id,
        fecha_inicio,
        fecha_fin,
        dias_totales: dias,
        dias_habiles: dias,
        dias_calendario: dias,
        estado: 'ACTIVA',
        activo: true
      });
      // Actualizar límite
      const limite = await limiteRepo.findOneBy({ trabajador_id: t.id, tipo_licencia_id: tipo.id, anio });
      if (limite) {
        limite.dias_utilizados += dias;
        await limiteRepo.save(limite);
      }
      // Crear validación
      await validacionRepo.save({
        solicitud_id: solicitud.id,
        validado_por: t.id, // Para ejemplo, el mismo trabajador
        estado: 'APROBADO',
        observaciones: 'Validación automática de ejemplo',
        fecha_validacion: new Date(),
      });
    }
  }

  await AppDataSource.destroy();
  console.log('Seed de solicitudes, licencias, límites y validaciones finalizado.');
}

seedSolicitudesLicencias().catch(console.error); 