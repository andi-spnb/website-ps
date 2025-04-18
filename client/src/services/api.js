import axios from 'axios';

// Set your backend URL here - pastikan ini sesuai dengan port server Anda
const BASE_URL = 'http://absenta.my.id/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
  // Hapus default Content-Type header agar bisa dinamis
});

// Initialize token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor for adding token to header
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.url);
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Jangan atur Content-Type jika sudah diatur (penting untuk FormData)
    if (!config.headers['Content-Type'] && !config.data instanceof FormData) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Jika data FormData, biarkan browser set Content-Type dengan boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor masih sama seperti sebelumnya
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", 
      error.response?.status, 
      error.response?.config?.url, 
      error.response?.data
    );
    
    // Token expired or invalid - 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Authentication failed. Redirecting to login...');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        // Use replace to avoid adding to navigation history
        window.location.replace('/login');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;