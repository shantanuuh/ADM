const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initSchema() {
    console.log('Initializing Database Schema...');

    try {
        // Initialize pool using shared config
        await db.initialize();
        const pool = db.getPool();
        let connection;

        try {
            connection = await pool.getConnection();

            // Read schema file
            const schemaPath = path.join(__dirname, '../db/schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            // Simple splitter for PL/SQL block vs standard statements if needed
            // But our schema.sql is a single PL/SQL block (BEGIN ... END), so we execute it at once.
            // However, fs read might return extra whitespace.

            console.log('Executing schema...');
            await connection.execute(schemaSql);

            console.log('✅ Schema executed successfully (Table INCIDENTS created).');

        } catch (err) {
            console.error('❌ Error executing schema:', err.message);
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    } catch (err) {
        console.error('❌ Failed to initialize pool:', err.message);
    } finally {
        try {
            await db.close();
        } catch (err) { }
    }
}

initSchema();
