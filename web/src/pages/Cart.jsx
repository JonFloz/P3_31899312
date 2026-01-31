import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [quantityErrors, setQuantityErrors] = useState({});

  const handleQuantityChange = (itemId, newQuantity) => {
    const newQty = parseInt(newQuantity, 10);
    
    if (isNaN(newQty) || newQty <= 0) {
      return;
    }

    // Encontrar el item para validar stock
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (newQty > item.stock) {
      setQuantityErrors(prev => ({
        ...prev,
        [itemId]: `No puedes agregar más de ${item.stock} unidades`
      }));
      return;
    }

    // Limpiar error si existe
    setQuantityErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });

    updateQuantity(itemId, newQty);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <h1>Mi Carrito de Compras</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
          <button onClick={() => navigate('/productos')} className="continue-shopping">
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    {item.author && <div className="item-author">{item.author}</div>}
                  </div>

                  <div className="item-price-cell">
                    <div className="item-price-label">Precio</div>
                    <div className="item-price-value">$/. {item.price.toFixed(2)}</div>
                  </div>

                  <div className="quantity-section">
                    <div className="quantity-label">Cantidad (Máx: {item.stock})</div>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      className="quantity-input"
                    />
                    {quantityErrors[item.id] && (
                      <div className="quantity-error">⚠️ {quantityErrors[item.id]}</div>
                    )}
                  </div>

                  <div className="subtotal-cell">
                    <div className="subtotal-label">Subtotal</div>
                    <div className="subtotal-value">$/. {(item.price * item.quantity).toFixed(2)}</div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Resumen del Pedido</h3>

              <div className="summary-item total">
                <span className="summary-item-label">Total:</span>
                <span className="summary-item-value">$/. {getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="cart-buttons">
                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceder al Pago
                </button>

                <button
                  className="continue-shopping-btn"
                  onClick={() => navigate('/productos')}
                >
                  Continuar Comprando
                </button>

                <button
                  className="clear-cart-btn"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
                      clearCart();
                    }
                  }}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
