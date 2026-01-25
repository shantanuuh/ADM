require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'smartcitygis',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
});

async function testConnection() {
    console.log('--- PostgreSQL Connection Diagnostic ---');
    console.log(`User: ${pool.options.user}`);
    console.log(`Host: ${pool.options.host}`);
    console.log(`Database: ${pool.options.database}`);

    try {
        const client = await pool.connect();
        console.log('✅ Connection Successful!');

        // Check for PostGIS extension
        try {
            const res = await client.query('SELECT PostGIS_Version()');
            console.log(`✅ PostGIS Version: ${res.rows[0].postgis_version}`);
        } catch (e) {
            console.warn('⚠️ PostGIS extension might not be enabled:', e.message);
        }

        // Check table
        try {
            const result = await client.query("SELECT count(*) FROM incidents_spatial");
            console.log(`✅ Table 'incidents_spatial' found. Row count: ${result.rows[0].count}`);
        } catch (err) {
            console.error("❌ Table 'incidents_spatial' check failed.");
            if (err.code === '42P01') {
                console.error("   -> CAUSE: Table does not exist. Did you run init_postgis.sql?");
            } else {
                console.error("   Error:", err.message);
            }
        }

        client.release();
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('   Error:', err.message);
        console.error('   Code:', err.code);
        if (err.code === '28P01') console.error('   -> CAUSE: Password authentication failed.');
        if (err.code === '3D000') console.error('   -> CAUSE: Database does not exist.');
        if (err.code === 'ECONNREFUSED') console.error('   -> CAUSE: PostgreSQL is not running on valid port.');
    } finally {
        await pool.end();
    }
}

testConnection();
