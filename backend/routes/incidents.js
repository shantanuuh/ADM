const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const Joi = require('joi');
const { protect } = require('../middleware/auth');

// Validation Schema
const incidentSchema = Joi.object({
    type: Joi.string().required(),
    description: Joi.string().allow('', null),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    status: Joi.string().valid('open', 'closed', 'in-progress').default('open')
});

// @desc    Get all incidents (GeoJSON)
// @route   GET /api/incidents
router.get('/', async (req, res, next) => {
    try {
        const query = `
      SELECT 
        id, 
        type, 
        description, 
        status, 
        created_at, 
        ST_AsGeoJSON(location) as location 
      FROM incidents
      ORDER BY created_at DESC
    `;
        const { rows } = await pool.query(query);

        // Transform to standard GeoJSON FeatureCollection
        const geoJSON = {
            type: "FeatureCollection",
            features: rows.map(row => ({
                type: "Feature",
                geometry: JSON.parse(row.location),
                properties: {
                    id: row.id,
                    type: row.type,
                    description: row.description,
                    status: row.status,
                    created_at: row.created_at
                }
            }))
        };

        res.json(geoJSON);
    } catch (err) {
        next(err);
    }
});

// @desc    Create a new incident
// @route   POST /api/incidents
// @access  Private (usually, but public for demo if needed, sticking to requirements which implies auth for write)
// Note: User asked for JWT auth, so we'll protect this.
router.post('/', protect, async (req, res, next) => {
    try {
        const { error, value } = incidentSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { type, description, latitude, longitude, status } = value;

        const query = `
      INSERT INTO incidents (type, description, status, location)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING id, type, description, status, created_at, ST_AsGeoJSON(location) as location
    `;

        const { rows } = await pool.query(query, [type, description, status, longitude, latitude]);

        res.status(201).json({
            success: true,
            data: {
                ...rows[0],
                location: JSON.parse(rows[0].location)
            }
        });
    } catch (err) {
        next(err);
    }
});

// @desc    Get single incident
// @route   GET /api/incidents/:id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
      SELECT 
        id, type, description, status, created_at, 
        ST_AsGeoJSON(location) as location 
      FROM incidents WHERE id = $1
    `;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            res.status(404);
            throw new Error('Incident not found');
        }

        res.json({
            ...rows[0],
            location: JSON.parse(rows[0].location)
        });
    } catch (err) {
        next(err);
    }
});

// @desc    Update incident
// @route   PUT /api/incidents/:id
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, description, status } = req.body;

        // Build dynamic query
        // For simplicity in this demo, strict update of fields if provided
        // In production, might want more complex patch logic

        // Check existence
        const checkQuery = 'SELECT * FROM incidents WHERE id = $1';
        const checkRes = await pool.query(checkQuery, [id]);
        if (checkRes.rows.length === 0) {
            res.status(404);
            throw new Error('Incident not found');
        }

        const updateQuery = `
      UPDATE incidents 
      SET type = COALESCE($1, type), 
          description = COALESCE($2, description), 
          status = COALESCE($3, status),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

        const { rows } = await pool.query(updateQuery, [type, description, status, id]);

        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM incidents WHERE id = $1 RETURNING id';
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            res.status(404);
            throw new Error('Incident not found');
        }

        res.json({ message: 'Incident removed' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
