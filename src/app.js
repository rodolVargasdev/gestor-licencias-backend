const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { AppDataSource } = require('./config/database');
require('dotenv').config();

// Importar rutas
const departamentosRoutes = require('./routes/departamentos.routes');
const puestosRoutes = require('./routes/puestos.routes');
const trabajadoresRoutes = require('./routes/trabajadores.routes');
const tiposLicenciasRoutes = require('./routes/tipos-licencias.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const licenciasRoutes = require('./routes/licencias.routes');
const reportesRoutes = require('./routes/reportes.routes');
const controlLimitesRoutes = require('./routes/control-limites.routes');
const validacionesRoutes = require('./routes/validaciones.routes');
const disponibilidadRoutes = require('./routes/disponibilidad.routes');

const app = express();

// Configuración CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/puestos', puestosRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/tipos-licencias', tiposLicenciasRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/licencias', licenciasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/control-limites', controlLimitesRoutes);
app.use('/api/validaciones', validacionesRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Inicializar la base de datos y el servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error al conectar con la base de datos:', error);
  });

module.exports = app; 