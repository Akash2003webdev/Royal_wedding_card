import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrder } from '../supabase/queries.js';

export default function Cart() {
  const { items, updateQty, removeFromCart, total, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [placing, setPlacing] = useState(false);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      // Browsing, wishlist and cart don't need an account —
      // only ask to sign in once they're actually ready to buy.
      navigate('/login', { state: { redirect: '/cart' } });
      return;
    }
    // Always collect a name + phone at checkout — even for logged-in
    // shoppers — so the admin has a direct contact for this order.
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Please add your name and phone number');
      return;
    }
    setPlacing(true);
    try {
      await createOrder(user.id, items, total, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
      toast.success('Order placed! We will contact you shortly.');
      clearCart();
      navigate('/account');
    } catch (err) {
      toast.error(err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">Your cart is empty</h1>
        <Link to="/collections" className="text-primary font-semibold underline">Browse collections</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-6 md:px-8">
      <h1 className="text-4xl font-heading font-bold mb-10">Your Cart</h1>
      <div className="space-y-4 mb-10">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border border-black/10 dark:border-white/10 rounded-xl p-4">
            <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-heading font-semibold">{item.name}</h3>
              <p className="text-primary font-semibold">₹{item.price}</p>
            </div>
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-full">
              <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2"><Minus size={14} /></button>
              <span className="w-6 text-center text-sm">{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2"><Plus size={14} /></button>
            </div>
            <button onClick={() => removeFromCart(item.id)} aria-label="Remove" className="text-neutral-400 hover:text-primary">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xl font-semibold mb-6">
        <span>Total</span>
        <span className="text-primary">₹{total}</span>
      </div>

      {isLoggedIn && (
        <div className="mb-6 bg-accent dark:bg-neutral-900 rounded-2xl p-5">
          <h3 className="font-heading font-semibold mb-1">Contact Details</h3>
          <p className="text-xs text-neutral-500 mb-4">So we can reach you about this order.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                required
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={placing}
        className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
      >
        {placing ? 'Placing Order...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
}
