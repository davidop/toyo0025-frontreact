import axios from 'axios';
import { envVariables } from '../utils/env';

// Create axios instance for the app API
const appApiClient = axios.create({
  baseURL: envVariables.API_APP_BASE_URL,
  timeout: envVariables.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptors
appApiClient.interceptors.request.use(
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
appApiClient.interceptors.response.use(
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
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default appApiClient;
