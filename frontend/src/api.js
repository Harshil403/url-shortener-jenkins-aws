import axios from 'axios';

// No base URL needed — same-origin via Ingress
const api = axios.create({
  baseURL: '',
});

export const shortenUrl = (originalUrl, customCode) =>
  api.post('/api/shorten', { originalUrl, customCode: customCode || undefined });

export const getAllUrls = () => api.get('/api/urls');

export const getOverallAnalytics = () => api.get('/api/analytics');

export const getUrlAnalytics = (shortCode) =>
  api.get(`/api/analytics/${shortCode}`);

export default api;