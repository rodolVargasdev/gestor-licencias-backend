const { AppDataSource } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized.');

    // Crear la tabla de migraciones si no existe
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Migrations table is ready.');

    const migrationsDir = path.join(__dirname, '../config/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordena los archivos alfabéticamente

    for (const file of migrationFiles) {
      // Verificar si la migración ya se ejecutó
      const result = await queryRunner.query('SELECT name FROM migrations WHERE name = $1', [file]);
      
      if (result.length === 0) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await queryRunner.query(migrationSQL);
        
        // Registrar la migración en la base de datos
        await queryRunner.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        console.log(`✅ Migration ${file} completed and registered.`);
      } else {
        // console.log(`Migration ${file} already executed. Skipping.`);
      }
    }

    console.log('All migrations have been executed successfully.');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1); // Salir con error para que el despliegue de Render falle
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

runMigrations(); 