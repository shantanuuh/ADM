import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const login = async (userData) => {
    const response = await api.post('/users/login', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/users', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getIncidents = async () => {
    const response = await api.get('/incidents');
    return response.data;
};

export const getMapIncidents = async () => {
    const response = await api.get('/incidents/map');
    return response.data;
};

export const reportIncident = async (incidentData) => {
    const response = await api.post('/incidents', incidentData);
    return response.data;
};

export const getNearbyIncidents = async (lat, lng, radius) => {
    const response = await api.get(`/incidents/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
};

export default api;
