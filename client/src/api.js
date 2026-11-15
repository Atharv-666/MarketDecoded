import axios from 'axios';

// Automatically uses your live Render URL in production, and localhost during local development
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default API;