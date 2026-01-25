const mongoose = require('mongoose');
const { Pool } = require('pg');

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcitygis';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        throw err;
    }
};

// PostgreSQL Configuration
const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: process.env.POSTGRES_DB || 'smartcitygis',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        port: process.env.POSTGRES_PORT || 5432,
    };

const pool = new Pool(poolConfig);

const getPgConnection = () => {
    return pool;
};

module.exports = { connectMongoDB, getPgConnection };
