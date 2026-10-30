import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_CART_KEY = 'saree_shop_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_CART_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(STORAGE_CART_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const addToCart = (saree, quantity = 1) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.sareeId === saree.id);
      const maxStock = Number(saree.stock) || 0;
      const nextQuantity = Math.min(
        maxStock,
        (existing?.quantity || 0) + Math.max(1, Number(quantity) || 1)
      );

      if (nextQuantity === 0) return currentCart;
      if (existing) {
        return currentCart.map((item) =>
          item.sareeId === saree.id ? { ...item, quantity: nextQuantity, maxStock } : item
        );
      }

      return [
        ...currentCart,
        {
          sareeId: saree.id,
          name: saree.name,
          image: saree.images?.[0],
          price: Number(saree.price) || 0,
          quantity: nextQuantity,
          maxStock,
        },
      ];
    });
  };

  const removeFromCart = (sareeId) => {
    setCart((currentCart) => currentCart.filter((item) => item.sareeId !== sareeId));
  };

  const updateQuantity = (sareeId, quantity) => {
    setCart((currentCart) => currentCart.flatMap((item) => {
      if (item.sareeId !== sareeId) return [item];
      const nextQuantity = Math.min(item.maxStock, Math.max(0, Number(quantity) || 0));
      return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
    }));
  };

  const clearCart = () => setCart([]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
