const { AppDataSource } = require('../config/database');
const Departamento = require('../models/departamentos.model');
const Puesto = require('../models/puestos.model');

async function seedDepartamentosPuestos() {
  await AppDataSource.initialize();
  const depRepo = AppDataSource.getRepository('Departamento');
  const puestoRepo = AppDataSource.getRepository('Puesto');

  // Departamentos
  const departamentos = [
    { nombre: 'MEDICOS', descripcion: 'Departamento de médicos', activo: true },
    { nombre: 'CALL CENTER', descripcion: 'Departamento de atención telefónica', activo: true },
    { nombre: 'ENFERMERÍA', descripcion: 'Departamento de enfermería', activo: true },
    { nombre: 'ADMINISTRACIÓN', descripcion: 'Departamento administrativo', activo: true },
    { nombre: 'RECURSOS HUMANOS', descripcion: 'Departamento de RRHH', activo: true },
    { nombre: 'LABORATORIO', descripcion: 'Departamento de laboratorio clínico', activo: true },
    { nombre: 'FARMACIA', descripcion: 'Departamento de farmacia', activo: true }
  ];

  // Puestos
  const puestos = [
    { nombre: 'MEDICO DE MEDICINA GENERAL', descripcion: 'Atención médica general', activo: true },
    { nombre: 'AGENTE ATENCION AL USUARIO', descripcion: 'Atención a usuarios en call center', activo: true },
    { nombre: 'ENFERMERO/A', descripcion: 'Atención de enfermería', activo: true },
    { nombre: 'AUXILIAR ADMINISTRATIVO', descripcion: 'Apoyo administrativo', activo: true },
    { nombre: 'JEFE DE RECURSOS HUMANOS', descripcion: 'Jefatura de RRHH', activo: true },
    { nombre: 'QUIMICO DE LABORATORIO', descripcion: 'Procesos de laboratorio clínico', activo: true },
    { nombre: 'FARMACEUTICO', descripcion: 'Gestión de farmacia', activo: true }
  ];

  for (const dep of departamentos) {
    const exists = await depRepo.findOneBy({ nombre: dep.nombre });
    if (!exists) {
      await depRepo.save(dep);
      console.log(`Insertado departamento: ${dep.nombre}`);
    }
  }

  for (const puesto of puestos) {
    const exists = await puestoRepo.findOneBy({ nombre: puesto.nombre });
    if (!exists) {
      await puestoRepo.save(puesto);
      console.log(`Insertado puesto: ${puesto.nombre}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seed de departamentos y puestos finalizado.');
}

seedDepartamentosPuestos().catch(console.error); 