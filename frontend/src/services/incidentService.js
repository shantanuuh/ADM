import api from '../config/api';

// Get all incidents
const getIncidents = async () => {
    const response = await api.get('/api/incidents');
    return response.data; // GeoJSON FeatureCollection
};

// Create a new incident
const createIncident = async (incidentData) => {
    const response = await api.post('/api/incidents', incidentData);
    return response.data;
};

// Get single incident
const getIncident = async (id) => {
    const response = await api.get(`/api/incidents/${id}`);
    return response.data;
};

// Update incident
const updateIncident = async (id, incidentData) => {
    const response = await api.put(`/api/incidents/${id}`, incidentData);
    return response.data;
};

// Delete incident
const deleteIncident = async (id) => {
    const response = await api.delete(`/api/incidents/${id}`);
    return response.data;
};

const incidentService = {
    getIncidents,
    createIncident,
    getIncident,
    updateIncident,
    deleteIncident
};

export default incidentService;
