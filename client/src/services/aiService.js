import API from './api';

export const aiCategorize = (data) => API.post('/ai/categorize', data);
export const getAiInsights = () => API.get('/ai/insights');
export const aiChat = (message) => API.post('/ai/chat', { message });
