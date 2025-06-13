const { AppDataSource } = require('../config/database');

async function updateNullCodes() {
    try {
        // Initialize the data source
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        // Start a transaction
        await queryRunner.startTransaction();

        try {
            // Update NULL values
            const result = await queryRunner.query(`
                UPDATE tipos_licencias 
                SET codigo = 'TEMP-' || id::text 
                WHERE codigo IS NULL
                RETURNING id, codigo
            `);

            console.log('Updated records:', result);

            // Commit the transaction
            await queryRunner.commitTransaction();
            console.log('Update completed successfully');

        } catch (error) {
            // Rollback the transaction in case of error
            await queryRunner.rollbackTransaction();
            console.error('Error during update:', error);
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

// Run the update
updateNullCodes()
    .then(() => {
        console.log('Update completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Update failed:', error);
        process.exit(1);
    }); 