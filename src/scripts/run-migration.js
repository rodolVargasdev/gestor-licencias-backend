const { AppDataSource } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../config/migrations/003_fix_tipos_licencias_codigo.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await queryRunner.query(migrationSQL);
    
    console.log('Migration completed successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration(); 