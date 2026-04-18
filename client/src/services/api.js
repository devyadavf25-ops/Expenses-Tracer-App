import axios from 'axios';
import { queueMutation } from './offlineSync';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and offline states
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Handle 401 responses globally
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle offline mutations (POST, PUT, DELETE)
    const isMutation = config && ['post', 'put', 'delete'].includes(config.method?.toLowerCase());
    const isNetworkError = !response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';

    if (isNetworkError && isMutation && !config.headers?.['X-Offline-Sync']) {
      try {
        let mutationData = config.data;
        if (typeof mutationData === 'string') {
          try { mutationData = JSON.parse(mutationData); } catch (e) { /* ignore */ }
        }

        await queueMutation({
          method: config.method,
          url: config.url,
          data: mutationData,
        });

        toast.success('Connection lost. Transaction saved locally.', {
          icon: '📴',
          duration: 4000,
        });

        // Return a mock success response so UI doesn't break
        return Promise.resolve({ 
          data: { success: true, message: 'Offline cache', data: mutationData }, 
          status: 200,
          offline: true 
        });
      } catch (err) {
        console.error('Failed to queue offline mutation:', err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
