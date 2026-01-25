require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectMongoDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connections (Initialize when server starts)
const startServer = async () => {
    try {
        // 1. Connect to MongoDB
        await connectMongoDB();
        console.log('✅ MongoDB Connection Established');

        // 2. Initialize PostgreSQL/PostGIS (Auto-Migration)
        const { getPgConnection } = require('./config/db');
        const fs = require('fs');
        const path = require('path');

        const pool = getPgConnection();
        const sqlPath = path.join(__dirname, 'sql', 'init_postgis.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🔄 Running PostGIS Migration...');
        await pool.query(sql);
        console.log('✅ PostGIS Schema Verified');

        // Note: Oracle connection pool is usually initialized in the service/config 
        // and accessed on demand, or initialized here. We will check it later.

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Basic Health Check
app.get('/', (req, res) => {
    res.send('Smart City GIS Backend is Running');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
