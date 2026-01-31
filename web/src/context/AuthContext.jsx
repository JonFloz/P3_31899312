import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Verificando autenticación...');
        const token = localStorage.getItem('token');
        if (token) {
          // Usar usuario del localStorage si existe
          const localUser = authService.getLocalUser();
          if (localUser) {
            console.log('✅ Usuario encontrado:', localUser.email);
            setUser(localUser);
          } else {
            console.warn('⚠️ Token existe pero no hay usuario en localStorage');
          }
        } else {
          console.log('ℹ️ No hay token de autenticación');
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    console.log('🔐 Login iniciado para:', credentials.email);
    try {
      setError(null);
      console.log('📤 Enviando credenciales al servidor...');
      const response = await authService.login(credentials);
      console.log('✅ Login exitoso, respuesta:', response);
      
      const user = authService.getLocalUser();
      console.log('👤 Usuario cargado desde localStorage:', user);
      setUser(user);
      return response;
    } catch (err) {
      console.error('❌ Error en login:', err);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
      
      const errorMessage = err.response?.data?.data?.message || 
                          err.response?.data?.message || 
                          err.message || 
                          'Error al iniciar sesión';
      
      console.warn('⚠️ Mensaje de error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    console.log('🚪 Logout iniciado');
    authService.logout();
    setUser(null);
    setError(null);
    console.log('✅ Logout completado');
  };

  const register = async (userData) => {
    console.log('📝 Registro iniciado para:', userData.email);
    try {
      setError(null);
      console.log('📤 Enviando datos de registro...');
      const response = await authService.register(userData);
      console.log('✅ Registro exitoso');
      return response;
    } catch (err) {
      console.error('❌ Error en registro:', err);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
      
      const errorMessage = err.response?.data?.data?.message || 
                          err.response?.data?.message || 
                          err.message || 
                          'Error al registrarse';
      
      console.warn('⚠️ Mensaje de error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};


