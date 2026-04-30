import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/chat',
});

export const sendChat = (message) => api.post('/message', { message });
