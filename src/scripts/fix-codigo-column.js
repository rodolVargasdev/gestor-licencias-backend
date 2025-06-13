const { AppDataSource } = require('../config/database');

async function fixCodigoColumn() {
    try {
        // Initialize the data source
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        // Start a transaction
        await queryRunner.startTransaction();

        try {
            // 1. Update NULL values
            await queryRunner.query(`
                UPDATE tipos_licencias 
                SET codigo = 'TEMP-' || id::text 
                WHERE codigo IS NULL
            `);

            // 2. Truncate long values
            await queryRunner.query(`
                UPDATE tipos_licencias 
                SET codigo = LEFT(codigo, 10)
                WHERE LENGTH(codigo) > 10
            `);

            // 3. Add length constraint
            await queryRunner.query(`
                ALTER TABLE tipos_licencias 
                ALTER COLUMN codigo TYPE varchar(10)
            `);

            // 4. Add NOT NULL constraint
            await queryRunner.query(`
                ALTER TABLE tipos_licencias 
                ALTER COLUMN codigo SET NOT NULL
            `);

            // 5. Add unique constraint if it doesn't exist
            await queryRunner.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 
                        FROM pg_constraint 
                        WHERE conname = 'tipos_licencias_codigo_key'
                    ) THEN
                        ALTER TABLE tipos_licencias 
                        ADD CONSTRAINT tipos_licencias_codigo_key UNIQUE (codigo);
                    END IF;
                END $$;
            `);

            // Commit the transaction
            await queryRunner.commitTransaction();
            console.log('Migration completed successfully');

        } catch (error) {
            // Rollback the transaction in case of error
            await queryRunner.rollbackTransaction();
            console.error('Error during migration:', error);
            throw error;
        } finally {
            // Release the query runner
            await queryRunner.release();
        }

    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    } finally {
        // Destroy the data source connection
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Run the migration
fixCodigoColumn()
    .then(() => {
        console.log('Migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    }); 