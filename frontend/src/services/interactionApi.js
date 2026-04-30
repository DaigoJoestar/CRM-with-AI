import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/interactions',
});

export const logInteraction = (payload) => api.post('/log', payload);
export const editInteraction = (interactionId, changes) => api.put(`/edit/${interactionId}`, changes);
export const getInteraction = (interactionId) => api.get(`/${interactionId}`);
