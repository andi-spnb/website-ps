import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request debug
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request');
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response debug
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status || 'No status', 
                  error.response?.data || error.message);
    
    // Redirect ke login jika unauthorized (401)
    if (error.response && error.response.status === 401) {
      // Check if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Unauthorized, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;