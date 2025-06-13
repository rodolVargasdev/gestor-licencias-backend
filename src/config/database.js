const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'gestor_licencias',
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