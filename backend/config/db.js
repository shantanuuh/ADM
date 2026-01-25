const mongoose = require('mongoose');
const { Pool } = require('pg');

// Postgres Configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database Connection Logic
const connectDB = async () => {
    // MongoDB Connection
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // We don't exit process here strictly so Postgres can still attempt connection, but usually fatal.
        // In strict production, might want to process.exit(1);
    }

    // PostgreSQL Connection Check
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log(`PostgreSQL Connected: ${res.rows[0].now}`);
        client.release();
    } catch (error) {
        console.error(`Error connecting to PostgreSQL: ${error.message}`);
    }
};

module.exports = { connectDB, pool };
