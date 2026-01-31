import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  // Obtener URL base del API
  const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  // Construir URL de imagen
  const getImageUrl = () => {
    if (!product.image) {
      return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3ESin imagen%3C/text%3E%3C/svg%3E';
    }
    
    // Si ya es una URL completa (comienza con http)
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    // Si es una ruta relativa del servidor
    return `${apiUrl}${product.image}`;
  };

  const handleAddToCart = () => {
    setError('');
    
    // Validar que la cantidad no supere el stock
    if (quantity > product.stock) {
      setError(`No puedes agregar más de ${product.stock} unidades`);
      return;
    }

    const result = addToCart(product, quantity);
    if (result && result.success === false) {
      setError(result.message || 'Error al agregar al carrito');
      return;
    }
    
    setAdded(true);
    setError('');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={getImageUrl()}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214%22 fill=%22%23999%22%3ESin imagen%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.author && <p className="product-author">Autor: {product.author}</p>}

        <p className="product-category">
          {product.category?.name || product.categoryName || 'Sin categoría'}
        </p>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-footer">
          <span className="product-price">$ {(Number(product.price) || 0).toFixed(2)}</span>

          <div className="product-stock">
            <span className={`stock ${product.stock > 0 ? 'available' : 'unavailable'}`}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
            </span>
          </div>
        </div>

        {product.stock > 0 ? (
          <div className="product-actions">
            {error && <div className="product-error">⚠️ {error}</div>}
            <select
              className="quantity-selector"
              value={quantity}
              onChange={handleQuantityChange}
            >
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <button
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? '✓ Agregado' : 'Agregar al Carrito'}
            </button>
          </div>
        ) : (
          <button className="add-to-cart-btn disabled" disabled>
            No disponible
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
