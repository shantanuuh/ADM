const oracledb = require('oracledb');
require('dotenv').config();

// Enable Thin mode (no Instant Client required for basic connections)
try {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_LIB_DIR });
} catch (err) {
    console.log('Using Thin mode or Instant Client already initialized');
}

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 2
};

async function initialize() {
    await oracledb.createPool(dbConfig);
    console.log('Oracle Database pool created');
}

async function close() {
    await oracledb.getPool().close(0);
    console.log('Oracle Database pool closed');
}

function getPool() {
    return oracledb.getPool();
}

module.exports = {
    initialize,
    close,
    getPool
};
