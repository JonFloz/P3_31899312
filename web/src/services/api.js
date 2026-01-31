import axios from 'axios';

// Determinar la URL base según el ambiente
const getApiBaseUrl = () => {
  // Si hay variable de entorno VITE_API_URL, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En producción, usar la misma URL del servidor
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // En desarrollo, usar localhost:3000
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token JWT y manejar FormData
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Inicializar headers si no existen
  if (!config.headers) {
    config.headers = {};
  }
  
  // Agregar token JWT siempre que esté disponible
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Si se envía FormData, NO establecer Content-Type
  // Axios lo hará automáticamente con el boundary correcto
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (config.data && !(config.data instanceof FormData)) {
    // Si NO es FormData, usar application/json
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detallado del error
    console.error('🚨 API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data
    });
    
    // Solo redirigir a login si es una sesión expirada (401) Y no estamos en la ruta de login
    // Evitar redirigir en intentos de login fallidos
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.warn('⚠️ Unauthorized (401) - Sesión expirada. Limpiar token y redirigir a login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Usar una redirección más suave con setTimeout para permitir que se capture el error primero
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
