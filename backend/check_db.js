const oracledb = require('oracledb');
require('dotenv').config();

async function check() {
    console.log('--- Database Diagnostic Tool ---');
    console.log('Connecting with:', {
        user: process.env.DB_USER,
        connectString: process.env.DB_CONNECT_STRING,
        libDir: process.env.ORACLE_LIB_DIR || 'Not Set (Using Thin Mode)'
    });

    let connection;
    try {
        // Enable Thin mode manually just in case
        try {
            if (process.env.ORACLE_LIB_DIR) {
                oracledb.initOracleClient({ libDir: process.env.ORACLE_LIB_DIR });
            }
        } catch (err) {
            // Ignore if already initialized
        }

        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        console.log('✅ Connection Successful!');

        // Check table
        try {
            const result = await connection.execute(
                `SELECT count(*) as count FROM incidents`
            );
            console.log(`✅ Table INCIDENTS exists. Row count: ${result.rows[0]}`);
        } catch (err) {
            if (err.errorNum === 942) {
                console.error('❌ Table INCIDENTS does not exist (ORA-00942).');
                console.log('   Run the schema creation script.');
            } else {
                console.error('❌ Error querying INCIDENTS table:', err.message);
            }
        }

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.message.includes('ORA-12514')) console.log('   Hint: Service name in connect string might be wrong.');
        if (err.message.includes('ORA-01017')) console.log('   Hint: Invalid username/password.');
        if (err.message.includes('ORA-28001')) console.log('   Hint: Password expired.');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

check();
