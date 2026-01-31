import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import '../styles/Auth.css';

const Login = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', contrasena: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  // Debug: mostrar cuando la página se carga
  useEffect(() => {
    console.log('📝 Componente Login montado');
    console.log('📍 Ubicación actual:', location.pathname);
    
    return () => {
      console.log('📝 Componente Login desmontado');
    };
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Intentando login con email:', formData.email);
    
    // Validar formulario antes de enviar
    if (!formData.email || !formData.contrasena) {
      console.warn('⚠️ Campos vacíos');
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('📤 Enviando credenciales...');
      const result = await login({ 
        email: formData.email.trim(), 
        contrasena: formData.contrasena 
      });
      
      console.log('✅ Login exitoso:', result);
      setSuccess('¡Sesión iniciada correctamente!');
      
      // Pequeño delay para que se vea el mensaje de éxito
      setTimeout(() => {
        console.log('🔄 Redirigiendo a home...');
        navigate('/');
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error en login:', err);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
      
      // Extraer mensaje de error de diferentes formatos posibles
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response?.data?.data?.message) {
        errorMessage = err.response.data.data.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.warn('⚠️ Mensaje de error extraído:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Iniciar Sesión</h1>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
          />
        )}
        
        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
          />
        )}

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              disabled={loading || authLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
              disabled={loading || authLoading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || authLoading}
          >
            {loading || authLoading ? (
              <>
                <span className="spinner"></span>
                Cargando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

