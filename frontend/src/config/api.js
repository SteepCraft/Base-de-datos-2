import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ← CRÍTICO: Envía cookies automáticamente
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
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
  }
);

export default api;
