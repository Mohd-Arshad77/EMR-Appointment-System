import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://emr-backend-iorx.onrender.com/api',
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    let token;
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      token = JSON.parse(userInfo).token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.get('http://localhost:5005/api/auth/refresh', {
          withCredentials: true
        });

        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          parsed.token = data.token;
          localStorage.setItem('userInfo', JSON.stringify(parsed));
        }

        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
