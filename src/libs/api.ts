// import axios, {
//   type AxiosError,
//   type AxiosResponse,
//   type InternalAxiosRequestConfig,
// } from "axios";

// const api = axios.create({
//   baseURL: "https://carrybackend-dfyh.onrender.com",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // needed if refresh tokens use cookies
// });

// // ✅ Utility: read cookie value (for CSRF if used)
// function getCookie(name: string) {
//   const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
//   return match ? decodeURIComponent(match[2]) : null;
// }

// // ✅ Request Interceptor
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem("jwtToken");
//     const isPublic =
//       config.url?.includes("/user/public");

//     if (!isPublic && token) {
//       config.headers.set("Authorization", `Bearer ${token}`);
//     }

//     // Optional CSRF header (ignored if CSRF disabled)
//     const csrfToken = getCookie("XSRF-TOKEN");
//     if (csrfToken) {
//       config.headers.set("X-XSRF-TOKEN", csrfToken);
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ✅ Refresh token handling
// let isRefreshing = false;
// let failedQueue: {
//   resolve: (token: string | null) => void;
//   reject: (err: unknown) => void;
// }[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// // ✅ Response Interceptor (auto refresh + retry)
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             if (token)
//               originalRequest.headers.set("Authorization", `Bearer ${token}`);
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshResponse = await axios.post(
//           "https://carrybackend-dfyh.onrender.com/user/auth/refresh",
//           {},
//           { withCredentials: true }
//         );

//         const newToken = (refreshResponse.data as any)?.jwtToken;

//         if (newToken) {
//           localStorage.setItem("jwtToken", newToken);
//           processQueue(null, newToken);

//           originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
//           return api(originalRequest);
//         } else {
//           throw new Error("No token returned from refresh endpoint");
//         }
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         localStorage.removeItem("jwtToken");
//         //window.location.href = "/login";
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://carrybackend-dfyh.onrender.com',
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

