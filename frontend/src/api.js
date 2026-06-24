import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

export const shortenUrl = (originalUrl, customCode) =>
  api.post('/api/shorten', { originalUrl, customCode: customCode || undefined });

export const getAllUrls = () => api.get('/api/urls');

export const getOverallAnalytics = () => api.get('/api/analytics');

export const getUrlAnalytics = (shortCode) =>
  api.get(`/api/analytics/${shortCode}`);

export default api;
