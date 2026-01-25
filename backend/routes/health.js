const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { pool } = require('../config/db');

// @desc    Simple health check
// @route   GET /health
router.get('/', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// @desc    Detailed system status including DB connectivity
// @route   GET /api/status
router.get('/status', async (req, res) => {
    const status = {
        uptime: process.uptime(),
        timestamp: new Date(),
        services: {
            api: 'UP',
            mongodb: 'UNKNOWN',
            postgres: 'UNKNOWN'
        }
    };

    // Check MongoDB
    try {
        if (mongoose.connection.readyState === 1) {
            status.services.mongodb = 'UP';
        } else {
            status.services.mongodb = 'DOWN';
        }
    } catch (e) {
        status.services.mongodb = 'DOWN';
    }

    // Check Postgres
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        status.services.postgres = 'UP';
    } catch (e) {
        status.services.postgres = 'DOWN';
    }

    const statusCode = (status.services.mongodb === 'UP' && status.services.postgres === 'UP') ? 200 : 503;
    res.status(statusCode).json(status);
});

module.exports = router;
