const express = require('express');
const router = express.Router();
const { reportIncident, getIncidents, getMapIncidents, findNearby } = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reportIncident);
router.get('/', getIncidents);
router.get('/map', getMapIncidents);
router.get('/nearby', findNearby);

module.exports = router;
