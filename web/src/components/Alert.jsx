import React, { useEffect } from 'react';
import '../styles/Alert.css';

const Alert = ({ type = 'info', message, onClose }) => {
  useEffect(() => {
    if (onClose) {
      // Los errores duran más (7s), el resto (5s)
      const duration = type === 'error' ? 7000 : 5000;
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button 
          className="alert-close" 
          onClick={onClose}
          aria-label="Cerrar alerta"
          title="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
