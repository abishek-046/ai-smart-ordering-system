import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

/**
 * CartProvider — manages cart state globally for authenticated students.
 *
 * State design decisions:
 *  - Cart state lives in React context (not localStorage) so it always
 *    reflects the server's authoritative state. localStorage cart would
 *    drift if items became unavailable or prices changed.
 *  - fetchCart is wrapped in useCallback with [user] dependency so it
 *    automatically re-fetches when the user logs in or out.
 *  - On logout (user becomes null) the cart is reset to empty locally —
 *    no server call needed since the JWT is gone.
 *  - clearCart optimistically resets local state, then re-fetches on error
 *    to restore accurate state rather than showing stale empty cart.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], total: 0, totalItems: 0 }); return; }
    try {
      setLoading(true);
      const res = await cartApi.get();
      setCart(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (foodItemId, quantity = 1) => {
    try {
      await cartApi.add(foodItemId, quantity);
      await fetchCart();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    }
  }, [fetchCart]);

  const updateItem = useCallback(async (foodItemId, quantity) => {
    try {
      await cartApi.update(foodItemId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    try {
      await cartApi.remove(itemId);
      await fetchCart();
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart({ items: [], total: 0, totalItems: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
      // do NOT optimistically clear — refresh to show current server state
      await fetchCart();
    }
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
