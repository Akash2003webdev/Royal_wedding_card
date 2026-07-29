import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';
import { clearCartItems, getCart, removeCartItem, upsertCartItem } from '../supabase/queries.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getCart(user.id);
      setItems(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload from Supabase whenever the logged-in user changes (login/logout).
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = async (product, qty = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    const existing = items.find((i) => i.id === product.id);
    const newQty = existing ? existing.qty + qty : qty;

    // Optimistic update; rolled back with a full refresh if the write fails.
    setItems((prev) =>
      existing
        ? prev.map((i) => (i.id === product.id ? { ...i, qty: newQty } : i))
        : [...prev, { ...product, qty }]
    );

    try {
      await upsertCartItem(user.id, product.id, newQty);
      toast.success(`${product.name} added to cart`);
      setDrawerOpen(true);
    } catch (err) {
      refresh();
      toast.error(err.message || 'Could not add to cart');
    }
  };

  const removeFromCart = async (id) => {
    if (!user) return;
    const prevItems = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await removeCartItem(user.id, id);
    } catch (err) {
      setItems(prevItems);
      toast.error(err.message || 'Could not remove item');
    }
  };

  const updateQty = async (id, qty) => {
    if (!user) return;
    const nextQty = Math.max(1, qty);
    const prevItems = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: nextQty } : i)));
    try {
      await upsertCartItem(user.id, id, nextQty);
    } catch (err) {
      setItems(prevItems);
      toast.error(err.message || 'Could not update quantity');
    }
  };

  const clearCart = async () => {
    const prevItems = items;
    setItems([]);
    try {
      if (user) await clearCartItems(user.id);
    } catch (err) {
      setItems(prevItems);
      toast.error(err.message || 'Could not clear cart');
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items, loading, addToCart, removeFromCart, updateQty, clearCart, total, count,
        drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);