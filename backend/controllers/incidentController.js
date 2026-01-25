const Incident = require('../models/Incident');
const { insertSpatialIncident, getNearbyIncidents, getAllSpatialIncidents } = require('../services/spatialService');

// @desc    Report an incident
// @route   POST /api/incidents
// @access  Private
const reportIncident = async (req, res) => {
    const { title, description, category, latitude, longitude } = req.body;

    if (!title || !description || !category || !latitude || !longitude) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // 1. Create in MongoDB
        const incident = await Incident.create({
            title,
            description,
            category,
            location: {
                latitude,
                longitude
            },
            postedBy: req.user.id
        });

        // 2. Create in Oracle Spatial
        // We use the Mongo ID as the link
        try {
            await insertSpatialIncident(incident.id, title, latitude, longitude);
        } catch (oracleErr) {
            console.error("Oracle Insert Failed. Rolling back Mongo...", oracleErr);
            await Incident.findByIdAndDelete(incident.id);
            return res.status(500).json({ message: 'Spatial Database Error. Incident not saved.' });
        }

        res.status(201).json(incident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all incidents (List View)
// @route   GET /api/incidents
// @access  Public
const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find().populate('postedBy', 'name');
        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get incidents for map (GeoJSON format preferred)
// @route   GET /api/incidents/map
// @access  Public
const getMapIncidents = async (req, res) => {
    try {
        const rows = await getAllSpatialIncidents();

        // Convert to standard GeoJSON FeatureCollection
        const geoJSON = {
            type: "FeatureCollection",
            features: rows.map(row => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [row.LNG, row.LAT]
                },
                properties: {
                    id: row.MONGO_ID,
                    title: row.TITLE
                }
            }))
        };

        res.status(200).json(geoJSON);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Find nearby incidents
// @route   GET /api/incidents/nearby
// @access  Public
const findNearby = async (req, res) => {
    // Query params: lat, lng, radius (meters)
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
        return res.status(400).json({ message: 'Missing lat, lng, or radius' });
    }

    try {
        const rows = await getNearbyIncidents(parseFloat(lat), parseFloat(lng), parseFloat(radius));
        // Convert to standard GeoJSON FeatureCollection
        const geoJSON = {
            type: "FeatureCollection",
            features: rows.map(row => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [row.LNG, row.LAT]
                },
                properties: {
                    id: row.MONGO_ID,
                    title: row.TITLE
                }
            }))
        };
        res.status(200).json(geoJSON);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    reportIncident,
    getIncidents,
    getMapIncidents,
    findNearby
};
