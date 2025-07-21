import axios from 'axios';
import { envVariables } from '../utils/env';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: envVariables.API_APP_BASE_URL,
  timeout: envVariables.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptors
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        // Clear auth data
        localStorage.removeItem('authToken');
        // This could be replaced with your routing logic
        window.location.href = '/login';
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }
      
      // Handle 500 Internal Server Error
      if (status >= 500) {
        console.error('Server error, please try again later');
      }
    }
    
    return Promise.reject(error);
  }
);

// Instancia para el API de la app móvil
const appApiClient = axios.create({
  baseURL: envVariables.API_APP_BASE_URL,
  timeout: envVariables.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Aplicamos los mismos interceptores a la instancia de app móvil
appApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

appApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      
      if (status === 403) {
        console.error('Access forbidden');
      }
      
      if (status >= 500) {
        console.error('Server error, please try again later');
      }
    }
    
    return Promise.reject(error);
  }
);

export { appApiClient };
export default apiClient;
