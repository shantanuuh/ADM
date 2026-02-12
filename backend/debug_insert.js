const db = require('./config/db');
const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function debugInsert() {
    console.log('--- Debugging Insert ---');
    try {
        await db.initialize();
        const connection = await db.getPool().getConnection();

        // Test Data
        const title = 'Test Incident';
        const description = 'Debug Report';
        const type = 'Fire';
        const latitude = 19.0;
        const longitude = 72.8;

        console.log('Attempting INSERT...');

        try {
            const result = await connection.execute(
                `INSERT INTO incidents (title, description, type, latitude, longitude) 
         VALUES (:title, :description, :type, :latitude, :longitude)
         RETURNING id INTO :id`,
                {
                    title,
                    description,
                    type,
                    latitude,
                    longitude,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );

            console.log('✅ Insert Successful! ID:', result.outBinds.id[0]);
        } catch (err) {
            console.error('❌ Insert Failed!');
            console.error('Error Message:', err.message);
            console.error('Error Code:', err.errorNum);
            if (err.offset) console.error('Error Offset:', err.offset);
        } finally {
            await connection.close();
            await db.close();
        }
    } catch (err) {
        console.error('❌ DB Connection Failed:', err.message);
    }
}

debugInsert();
