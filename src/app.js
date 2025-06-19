const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { AppDataSource } = require('./config/database');
require('dotenv').config();

// Importar rutas
const trabajadoresRoutes = require('./routes/trabajadores.routes');
const tiposLicenciasRoutes = require('./routes/tipos-licencias.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const validacionesRoutes = require('./routes/validaciones.routes');
const licenciasRoutes = require('./routes/licencias.routes');
const disponibilidadRoutes = require('./routes/disponibilidad.routes');
const reportesRoutes = require('./routes/reportes.routes');
const departamentosRoutes = require('./routes/departamentos.routes');
const puestosRoutes = require('./routes/puestos.routes');

const app = express();

// Configuración CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/tipos-licencias', tiposLicenciasRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/validaciones', validacionesRoutes);
app.use('/api/licencias', licenciasRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/puestos', puestosRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Inicializar la base de datos y el servidor
console.log('Iniciando conexión a la base de datos...');
console.log('Host:', process.env.DB_HOST);
console.log('Puerto:', process.env.DB_PORT);
console.log('Usuario:', process.env.DB_USER);
console.log('Base de datos:', process.env.DB_NAME);

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Base de datos conectada exitosamente');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
      console.log('Ambiente:', process.env.NODE_ENV);
      console.log('CORS Origin:', process.env.CORS_ORIGIN);
    });
  })
  .catch(error => {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  });

module.exports = app; 