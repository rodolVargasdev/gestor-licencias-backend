const { DataSource } = require('typeorm');
require('dotenv').config();

// Función para parsear la URL de la base de datos de Render
function parseDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.substring(1)
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gestor_licencias'
  };
}

const dbConfig = parseDatabaseUrl();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/../models/*.js'],
    migrations: [
        __dirname + '/../migrations/*.js',
        __dirname + '/migrations/*.sql'
    ],
    subscribers: [__dirname + '/../subscribers/*.js'],
});

module.exports = { AppDataSource }; 