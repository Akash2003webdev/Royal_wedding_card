import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';
import { addWishlist, getWishlist, removeWishlist } from '../supabase/queries.js';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getWishlist(user.id);
      setItems(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload from Supabase whenever the logged-in user changes (login/logout).
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }
    const exists = items.some((i) => i.id === product.id);

    // Optimistic update so the heart icon flips instantly; rolled back below
    // if the Supabase write actually fails.
    setItems((prev) => (exists ? prev.filter((i) => i.id !== product.id) : [...prev, product]));

    try {
      if (exists) {
        await removeWishlist(user.id, product.id);
        toast('Removed from wishlist', { icon: '💔' });
      } else {
        await addWishlist(user.id, product.id);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      // Revert the optimistic change on failure.
      setItems((prev) => (exists ? [...prev, product] : prev.filter((i) => i.id !== product.id)));
      toast.error(err.message || 'Could not update wishlist');
    }
  };

  const isWishlisted = (id) => items.some((i) => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, loading, toggleWishlist, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);