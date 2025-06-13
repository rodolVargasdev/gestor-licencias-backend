const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  // Departamentos
  '/api/departamentos',
  '/api/departamentos/1',

  // Puestos
  '/api/puestos',
  '/api/puestos/1',

  // Trabajadores
  '/api/trabajadores',
  '/api/trabajadores/1',
  '/api/trabajadores/tipo/OPERATIVO',
  '/api/trabajadores/departamento/1',
  '/api/trabajadores/1/licencias/activas',
  '/api/trabajadores/1/licencias/periodo',

  // Tipos de Licencias
  '/api/tipos-licencias',
  '/api/tipos-licencias/1',

  // Solicitudes
  '/api/solicitudes',
  '/api/solicitudes/1',

  // Licencias
  '/api/licencias',
  '/api/licencias/1',

  // Reportes
  '/api/reportes',
  '/api/reportes/1',

  // Control de Límites
  '/api/control-limites',
  '/api/control-limites/1',

  // Validaciones
  '/api/validaciones',
  '/api/validaciones/1',
  '/api/validaciones/solicitud/1',
  '/api/validaciones/validador/1',
  '/api/validaciones/estado/APROBADO'
];

(async () => {
  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(BASE_URL + endpoint);
      console.log(`✅ [${res.status}] GET ${endpoint}`);
    } catch (err) {
      if (err.response) {
        console.log(`❌ [${err.response.status}] GET ${endpoint}`);
      } else {
        console.log(`❌ [NO RESPONSE] GET ${endpoint}`);
      }
    }
  }
})();