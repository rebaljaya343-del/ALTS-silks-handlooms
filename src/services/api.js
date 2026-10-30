import axios from 'axios';

// Create Axios client with base URL from environment or fallback
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || '';
    const isCustomerRequest = requestUrl.includes('/customer-auth') || requestUrl.startsWith('/shop/');

    const storageKey = isCustomerRequest ? 'saree_customer_auth' : 'saree_auth_user';
    const authData = localStorage.getItem(storageKey);

    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed.token || parsed.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed parsing auth token from storage:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      const isCustomerRequest = requestUrl.includes('/customer-auth') || requestUrl.startsWith('/shop/');
      const storageKey = isCustomerRequest ? 'saree_customer_auth' : 'saree_auth_user';
      localStorage.removeItem(storageKey);

      if (isCustomerRequest && window.location.pathname !== '/shop/login' && window.location.pathname !== '/shop/signup') {
        window.location.href = '/shop/login';
      } else if (!isCustomerRequest && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
