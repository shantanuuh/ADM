const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.get('/', incidentController.getAllIncidents);
router.post('/', incidentController.createIncident);
router.get('/:id', incidentController.getIncidentById);

// Protected routes
router.put('/:id/status', auth, incidentController.updateIncidentStatus);
router.delete('/:id', auth, incidentController.deleteIncident);

module.exports = router;
