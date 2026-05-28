import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return; }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setItems(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity, variantId) => {
    await cartService.addToCart({ productId, quantity, variantId: variantId || undefined });
    await fetchCart();
  }, [fetchCart]);

  const updateItem = useCallback(async (id, quantity) => {
    await cartService.updateCartItem(id, { quantity });
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (id) => {
    await cartService.deleteCartItem(id);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    setItems([]); setTotal(0);
  }, []);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
