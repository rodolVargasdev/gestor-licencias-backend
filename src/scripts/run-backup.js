const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configura el pool de conexiones usando la variable de entorno de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeBackup() {
  const backupFilePath = path.join(__dirname, '../../backup.sql');
  
  if (!fs.existsSync(backupFilePath)) {
    console.error('❌ Error: backup.sql file not found!');
    process.exit(1);
  }

  const backupSQL = fs.readFileSync(backupFilePath, 'utf8');
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database restore from backup.sql...');
    // pg no puede ejecutar múltiples sentencias en una sola llamada a query.
    // No es necesario dividirlo, ya que el dump de pg_dump está formateado para ser ejecutado como un único script.
    await client.query(backupSQL);
    console.log('✅ Database restore completed successfully.');
  } catch (error) {
    console.error('❌ Error during database restore:', error);
    process.exit(1); // Salir con error para detener el despliegue
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

executeBackup(); 