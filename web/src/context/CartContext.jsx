import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'mangas_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito del localStorage al montar el componente
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validar que sea un array
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Si hay error, limpiar localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (isLoaded) {
      try {
        if (cartItems.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded]);

  // Validar stock al cargar el carrito (en caso de que los stocks hayan cambiado)
  useEffect(() => {
    if (isLoaded && cartItems.length > 0) {
      // Aquí se podría hacer una validación adicional si es necesario
      // Por ahora, solo se valida en el momento de agregar/actualizar
    }
  }, [isLoaded]);

  const addToCart = useCallback((product, quantity = 1) => {
    // Require user to be logged in to add to cart
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Debes iniciar sesión para agregar al carrito' };
    }

    // Validar que la cantidad sea válida
    if (quantity <= 0) {
      return { success: false, message: 'La cantidad debe ser mayor a 0' };
    }

    // Validar stock disponible
    if (!product.stock || product.stock <= 0) {
      return { success: false, message: 'Este producto no está disponible' };
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      let newQuantity = quantity;

      if (existingItem) {
        newQuantity = existingItem.quantity + quantity;
      }

      // Validar que la cantidad total no supere el stock disponible
      if (newQuantity > product.stock) {
        return prevItems; // No agregar si supera el stock
      }

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });

    return { success: true };
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: 'Producto removido del carrito' };
    }

    // Obtener el producto del carrito para validar stock
    let maxQuantity = Infinity;
    let errorMessage = '';

    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.id === productId);
      if (!item) {
        errorMessage = 'Producto no encontrado en el carrito';
        return prevItems;
      }

      // Validar que no supere el stock disponible
      if (quantity > item.stock) {
        maxQuantity = item.stock;
        errorMessage = `La cantidad no puede superar el stock disponible (${item.stock})`;
        return prevItems; // No actualizar si supera stock
      }

      return prevItems.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      );
    });

    if (errorMessage) {
      return { success: false, message: errorMessage, maxQuantity };
    }

    return { success: true };
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing cart from localStorage:', e);
    }
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Limpiar carrito cuando el usuario cierra sesión
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue === null) {
        // Token fue removido (logout)
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
