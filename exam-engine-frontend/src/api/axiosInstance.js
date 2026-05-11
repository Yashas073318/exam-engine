import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://10.10.20.116:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject JWT from localStorage ─────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ee_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');

    // Only force-logout when the 401 comes from a PROTECTED route,
    // not from login/register themselves (those 401s are expected on bad creds)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('ee_token');
      localStorage.removeItem('ee_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
