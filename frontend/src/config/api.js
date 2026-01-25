import axios from 'axios';

// Create setup that works with local development or production
// In production, VITE_API_URL should be set. If not, fallback to relative path or localhost for safety.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach JWT token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Assuming you store token here
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error is 401 (Unauthorized) and redirect to login if you had a login page
        // For this simplified version, we just reject
        return Promise.reject(error);
    }
);

export default api;
