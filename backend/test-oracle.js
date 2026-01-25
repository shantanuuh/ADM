require('dotenv').config();
const oracledb = require('oracledb');

async function testConnection() {
    console.log('--- Oracle Connection Diagnostic ---');
    console.log(`User: ${process.env.ORACLE_USER}`);
    console.log(`Connection String: ${process.env.ORACLE_CONN_STR}`);

    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });
        console.log('✅ Connection Successful!');

        // Check if table exists
        try {
            const result = await connection.execute(
                `SELECT count(*) as count FROM INCIDENTS_SPATIAL`
            );
            console.log(`✅ Table INCIDENTS_SPATIAL found. Row count: ${result.rows[0]}`);
        } catch (err) {
            console.error('❌ Table INCIDENTS_SPATIAL check failed.');
            console.error('   Error:', err.message);
            if (err.message.includes('ORA-00942')) {
                console.error('   -> CAUSE: The table does not exist. Please run init_spatial.sql.');
            }
        }

    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('   Error:', err.message);
        if (err.message.includes('ORA-12541')) console.error('   -> CAUSE: TNS:no listener. Oracle is likely not running.');
        if (err.message.includes('ORA-01017')) console.error('   -> CAUSE: Invalid username/password.');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

testConnection();
