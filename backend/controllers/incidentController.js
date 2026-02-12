const db = require('../config/db');
const oracledb = require('oracledb');

const incidentController = {
    // Get all incidents
    getAllIncidents: async (req, res) => {
        let connection;
        try {
            connection = await db.getPool().getConnection();
            const result = await connection.execute(
                `SELECT id, title, description, type, latitude, longitude, status, created_at 
         FROM incidents`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // Transform to GeoJSON
            const geoJson = {
                type: "FeatureCollection",
                features: result.rows.map(row => ({
                    type: "Feature",
                    properties: {
                        id: row.ID,
                        title: row.TITLE,
                        description: row.DESCRIPTION,
                        type: row.TYPE,
                        status: row.STATUS,
                        created_at: row.CREATED_AT
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [row.LONGITUDE, row.LATITUDE]
                    }
                }))
            };

            res.json(geoJson);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    },

    // Create new incident
    createIncident: async (req, res) => {
        const { description, type, latitude, longitude } = req.body;
        // Default title to type if not provided, since frontend doesn't send title
        const title = req.body.title || type || 'Incident';

        let connection;
        try {
            connection = await db.getPool().getConnection();
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

            res.status(201).json({
                message: 'Incident created',
                id: result.outBinds.id[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    },

    // Get single incident
    getIncidentById: async (req, res) => {
        const { id } = req.params;
        let connection;
        try {
            connection = await db.getPool().getConnection();
            const result = await connection.execute(
                `SELECT * FROM incidents WHERE id = :id`,
                [id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Incident not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    },

    // Delete incident
    deleteIncident: async (req, res) => {
        const { id } = req.params;
        let connection;
        try {
            connection = await db.getPool().getConnection();
            const result = await connection.execute(
                `DELETE FROM incidents WHERE id = :id`,
                [id],
                { autoCommit: true }
            );

            if (result.rowsAffected === 0) {
                return res.status(404).json({ error: 'Incident not found' });
            }
            res.json({ message: 'Incident deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    },

    // Update incident status
    updateIncidentStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'RESOLVED', 'CLOSED'

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        let connection;
        try {
            connection = await db.getPool().getConnection();
            const result = await connection.execute(
                `UPDATE incidents SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
                [status, id],
                { autoCommit: true }
            );

            if (result.rowsAffected === 0) {
                return res.status(404).json({ error: 'Incident not found' });
            }
            res.json({ message: 'Incident status updated', status });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
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
};

module.exports = incidentController;
