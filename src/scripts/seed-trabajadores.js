const { AppDataSource } = require('../config/database');
const Trabajador = require('../models/trabajador.model');
const Departamento = require('../models/departamentos.model');
const Puesto = require('../models/puestos.model');

function randomPhone() {
  return '7' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

function randomEmail(nombre) {
  // Usar primer apellido y primer nombre
  const partes = nombre.trim().split(/\s+/);
  const apellido = partes[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
  const nombreSimple = partes[partes.length - 1].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
  return `${nombreSimple}.${apellido}@ejemplo.com`;
}

async function seedTrabajadores() {
  await AppDataSource.initialize();
  const depRepo = AppDataSource.getRepository('Departamento');
  const puestoRepo = AppDataSource.getRepository('Puesto');
  const trabRepo = AppDataSource.getRepository('Trabajador');

  // Obtener departamentos y puestos por nombre
  const depMedicos = await depRepo.findOneBy({ nombre: 'MEDICOS' });
  const depCall = await depRepo.findOneBy({ nombre: 'CALL CENTER' });
  const depEnfermeria = await depRepo.findOneBy({ nombre: 'ENFERMERÍA' });
  const depAdmin = await depRepo.findOneBy({ nombre: 'ADMINISTRACIÓN' });
  const depRRHH = await depRepo.findOneBy({ nombre: 'RECURSOS HUMANOS' });
  const depLab = await depRepo.findOneBy({ nombre: 'LABORATORIO' });
  const depFarm = await depRepo.findOneBy({ nombre: 'FARMACIA' });

  const puestoMedico = await puestoRepo.findOneBy({ nombre: 'MEDICO DE MEDICINA GENERAL' });
  const puestoAgente = await puestoRepo.findOneBy({ nombre: 'AGENTE ATENCION AL USUARIO' });
  const puestoEnfermero = await puestoRepo.findOneBy({ nombre: 'ENFERMERO/A' });
  const puestoAuxAdmin = await puestoRepo.findOneBy({ nombre: 'AUXILIAR ADMINISTRATIVO' });
  const puestoJefeRRHH = await puestoRepo.findOneBy({ nombre: 'JEFE DE RECURSOS HUMANOS' });
  const puestoQuimico = await puestoRepo.findOneBy({ nombre: 'QUIMICO DE LABORATORIO' });
  const puestoFarmaceutico = await puestoRepo.findOneBy({ nombre: 'FARMACEUTICO' });

  // Trabajadores de la imagen
  const trabajadores = [
    {
      codigo: 'T001',
      nombre_completo: 'PLATERO DIAZ ZOILA ALEXANDRA',
      email: 'zoila.platero@ejemplo.com',
      telefono: randomPhone(),
      departamento_id: depMedicos.id,
      puesto_id: puestoMedico.id,
      tipo_personal: 'OPERATIVO',
      fecha_ingreso: '2025-03-04',
      activo: true
    },
    {
      codigo: 'T002',
      nombre_completo: 'LOPEZ HUEZO YENICEL ZOBEYDA',
      email: 'yenicel.lopez@ejemplo.com',
      telefono: randomPhone(),
      departamento_id: depMedicos.id,
      puesto_id: puestoMedico.id,
      tipo_personal: 'OPERATIVO',
      fecha_ingreso: '2025-03-04',
      activo: true
    },
    {
      codigo: 'T003',
      nombre_completo: 'NAVAS DELGADO DANIEL ERNESTO',
      email: 'daniel.navas@ejemplo.com',
      telefono: randomPhone(),
      departamento_id: depCall.id,
      puesto_id: puestoAgente.id,
      tipo_personal: 'OPERATIVO',
      fecha_ingreso: '2025-02-24',
      activo: true
    }
  ];

  // Trabajadores ficticios adicionales
  const nombresFicticios = [
    { nombre: 'MARTINEZ GARCIA LUIS ALBERTO', dep: depEnfermeria, puesto: puestoEnfermero, tipo: 'OPERATIVO', fecha: '2024-11-15' },
    { nombre: 'RAMIREZ PEREZ ANA SOFIA', dep: depAdmin, puesto: puestoAuxAdmin, tipo: 'ADMINISTRATIVO', fecha: '2025-01-10' },
    { nombre: 'CASTILLO MENDEZ JORGE ENRIQUE', dep: depRRHH, puesto: puestoJefeRRHH, tipo: 'ADMINISTRATIVO', fecha: '2024-12-01' },
    { nombre: 'MENDEZ LOPEZ MARIA JOSE', dep: depLab, puesto: puestoQuimico, tipo: 'OPERATIVO', fecha: '2025-03-01' },
    { nombre: 'GONZALEZ RIVERA SANDRA ELENA', dep: depFarm, puesto: puestoFarmaceutico, tipo: 'OPERATIVO', fecha: '2025-02-20' }
  ];

  let count = 4;
  for (const nf of nombresFicticios) {
    trabajadores.push({
      codigo: 'T' + String(count).padStart(3, '0'),
      nombre_completo: nf.nombre,
      email: randomEmail(nf.nombre),
      telefono: randomPhone(),
      departamento_id: nf.dep.id,
      puesto_id: nf.puesto.id,
      tipo_personal: nf.tipo,
      fecha_ingreso: nf.fecha,
      activo: true
    });
    count++;
  }

  for (const t of trabajadores) {
    const exists = await trabRepo.findOneBy({ codigo: t.codigo });
    if (!exists) {
      await trabRepo.save(t);
      console.log(`Insertado trabajador: ${t.nombre_completo}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seed de trabajadores finalizado.');
}

seedTrabajadores().catch(console.error); 