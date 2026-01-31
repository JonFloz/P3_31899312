// URLs de la API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  PRODUCTS: {
    LIST: '/v2/mangas',
    DETAIL: '/v2/mangas/:id',
    CREATE: '/v2/mangas',
    UPDATE: '/v2/mangas/:id',
    DELETE: '/v2/mangas/:id',
  },
  ORDERS: {
    LIST: '/v2/orders',
    DETAIL: '/v2/orders/:id',
    CREATE: '/v2/orders',
    UPDATE: '/v2/orders/:id',
  },
};

// Mensajes de error
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  NETWORK_ERROR: 'Error de conexión',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'No encontrado',
};

// Otros
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};
