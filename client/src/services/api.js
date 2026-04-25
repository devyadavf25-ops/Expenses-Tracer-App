import axios from 'axios';
import { queueMutation } from './offlineSync';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
    : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
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
    
    // EXCLUDE Auth requests from offline sync (they require immediate feedback)
    const isAuthRequest = config.url?.includes('/auth/login') || 
                         config.url?.includes('/auth/register') || 
                         config.url?.includes('/auth/forgot-password');

    if (isNetworkError && isMutation && !isAuthRequest && !config.headers?.['X-Offline-Sync']) {
      try {
        let mutationData = config.data;
        
        // Handle axios data which might be stringified or an object
        if (typeof mutationData === 'string' && mutationData.startsWith('{')) {
          try { mutationData = JSON.parse(mutationData); } catch (e) { /* use as is */ }
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
