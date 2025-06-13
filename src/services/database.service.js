const AppDataSource = require('../config/typeorm.config');

class DatabaseService {
    static async initialize() {
        try {
            await AppDataSource.initialize();
            console.log('Conexión a la base de datos establecida correctamente');
            return true;
        } catch (error) {
            console.error('Error al conectar con la base de datos:', error.message);
            console.error('Stack trace:', error.stack);
            return false;
        }
    }

    static async runMigrations() {
        try {
            await AppDataSource.initialize();
            await AppDataSource.runMigrations();
            console.log('Migraciones ejecutadas correctamente');
            return true;
        } catch (error) {
            console.error('Error al ejecutar las migraciones:', error.message);
            console.error('Stack trace:', error.stack);
            return false;
        }
    }

    static async createTables() {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            await AppDataSource.synchronize(true); // true para forzar la sincronización
            console.log('Tablas creadas correctamente');
            return true;
        } catch (error) {
            console.error('Error al crear las tablas:', error.message);
            console.error('Stack trace:', error.stack);
            throw error; // Propagar el error para ver más detalles
        }
    }

    static async closeConnection() {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('Conexión a la base de datos cerrada');
        }
    }
}

module.exports = DatabaseService; 