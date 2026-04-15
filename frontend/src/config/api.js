import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ← CRÍTICO: Envía cookies automáticamente
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Let the browser add multipart boundaries for FormData requests.
    delete config.headers?.["Content-Type"];
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada o inválida
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
