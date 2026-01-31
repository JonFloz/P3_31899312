import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido a JonMangas</h1>
          <p>Compra tus mangas a buen precio, calidad en Mangas.</p>
          <Link to="/productos" className="cta-button">
            Explorar Productos
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>🚚 Envío Rápido</h3>
          <p>Entrega en 24-48 horas a todo el país</p>
        </div>
        <div className="feature">
          <h3>💳 Pago Seguro</h3>
          <p>Múltiples opciones de pago y totalmente seguro</p>
        </div>
        <div className="feature">
          <h3>🛡️ Garantía</h3>
          <p>Todos nuestros productos tienen garantía</p>
        </div>
        <div className="feature">
          <h3>👥 Soporte 24/7</h3>
          <p>Atención al cliente disponible siempre</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
