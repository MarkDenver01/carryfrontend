import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach token to each request unless it's login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    const isLogin = config.url?.includes('/user/public');

    if (!isLogin && token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default api;