const { getPgConnection } = require('../config/db');

const insertSpatialIncident = async (mongoId, title, lat, lng) => {
    const pool = getPgConnection();
    try {
        const query = `
      INSERT INTO incidents_spatial (mongo_id, title, location)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326))
    `;
        // $3 is lng (X), $4 is lat (Y)

        await pool.query(query, [mongoId, title, lat, lng]);
        console.log('✅ Spatial Insert Success for:', mongoId);
    } catch (err) {
        console.error('❌ PostGIS Insert Error:', err);
        throw err;
    }
};

const getNearbyIncidents = async (lat, lng, radiusMeters) => {
    const pool = getPgConnection();
    try {
        // Cast to geography to query in meters
        const query = `
      SELECT mongo_id, title, ST_X(location) as lng, ST_Y(location) as lat
      FROM incidents_spatial
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3
      )
    `;

        const result = await pool.query(query, [lat, lng, radiusMeters]);
        return result.rows.map(row => ({
            MONGO_ID: row.mongo_id,
            TITLE: row.title,
            LNG: row.lng,
            LAT: row.lat
        }));
    } catch (err) {
        console.error('❌ PostGIS Nearby Query Error:', err);
        throw err;
    }
};

const getAllSpatialIncidents = async () => {
    const pool = getPgConnection();
    try {
        const query = `
      SELECT mongo_id, title, ST_X(location) as lng, ST_Y(location) as lat
      FROM incidents_spatial
    `;

        const result = await pool.query(query);
        return result.rows.map(row => ({
            MONGO_ID: row.mongo_id,
            TITLE: row.title,
            LNG: row.lng,
            LAT: row.lat
        }));
    } catch (err) {
        console.error('❌ PostGIS Fetch All Error:', err);
        throw err;
    }
};

module.exports = { insertSpatialIncident, getNearbyIncidents, getAllSpatialIncidents };
