import apiClient from './api';
import { isUserAdmin } from '../utils/adminWhitelist';

const authService = {
  login: async (User) => {
    console.log('🔐 authService.login - Iniciando con:', User.email);
    try {
      console.log('📤 Enviando petición POST a /api/auth/login');
      const response = await apiClient.post('/api/auth/login', User);
      console.log('✅ Respuesta recibida:', response.status, response.data);
      
      if (response.data.data?.token) {
        console.log('💾 Guardando token en localStorage');
        localStorage.setItem('token', response.data.data.token);
        
        // Guardar datos del usuario
        const user = { 
          id: response.data.data.user?.id,
          email: response.data.data.user?.email,
          nombre: response.data.data.user?.nombre,
          isAdmin: isUserAdmin(response.data.data.user) // ✅ Verificar si es admin
        };
        console.log('👤 Guardando usuario:', user);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (err) {
      console.error('❌ Error en authService.login:', err);
      throw err;
    }
  },

  logout: () => {
    console.log('🚪 authService.logout - Limpiando localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ localStorage limpiado');
  },

  register: async (userData) => {
    console.log('📝 authService.register - Iniciando para:', userData.email);
    try {
      console.log('📤 Enviando petición POST a /api/auth/register');
      const response = await apiClient.post('/api/auth/register', userData);
      console.log('✅ Respuesta recibida:', response.status, response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Error en authService.register:', err);
      throw err;
    }
  },

  getLocalUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        console.log('👤 getLocalUser - Usuario encontrado');
        return JSON.parse(user);
      }
      console.log('👤 getLocalUser - No hay usuario en localStorage');
      return null;
    } catch (error) {
      console.error('❌ Error parseando usuario:', error);
      return null;
    }
  },
};

export default authService;
