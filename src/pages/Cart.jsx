import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, User, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrder } from '../supabase/queries.js';
import { WHATSAPP_NUMBER } from '../constants/business.js';
import { buildWhatsappCartMessage } from '../utils/whatsapp.js';

export default function Cart() {
  const { items, updateQty, removeFromCart, total, clearCart } = useCart();
  const { isLoggedIn, user, profile } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  // Prefill the checkout fields from the account's saved profile —
  // still editable, since the order contact can differ from the account.
  useEffect(() => {
    if (profile?.full_name) setCustomerName((prev) => prev || profile.full_name);
    if (profile?.phone) setCustomerPhone((prev) => prev || profile.phone);
    if (profile?.address) setCustomerAddress((prev) => prev || profile.address);
  }, [profile]);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleProceedClick = () => {
    if (!isLoggedIn) {
      // Browsing, wishlist and cart don't need an account —
      // only ask to sign in once they're actually ready to buy.
      navigate('/login', { state: { redirect: '/cart' } });
      return;
    }
    // Google sign-in doesn't provide a phone number, so some accounts
    // reach checkout with an incomplete profile — send them to fill it
    // in on the Account page rather than failing at order-creation time.
    if (!profile?.full_name || !profile?.phone || !profile?.address) {
      navigate('/account', { state: { needsProfile: true, redirect: '/cart' } });
      return;
    }
    // Always collect a name + phone + address at checkout — even for
    // logged-in shoppers — so the admin has a direct contact and
    // delivery destination for this order.
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error('Please add your name, phone number and delivery address');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setPlacing(true);
    try {
      await createOrder(user.id, items, total, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
      });
      toast.success('Order placed! We will contact you shortly.');

      const waMessage = buildWhatsappCartMessage({
        account: {
          fullName: profile?.full_name || null,
          phone: profile?.phone || null,
          email: user.email,
        },
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items,
        total,
      });
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`, '_blank');

      setShowConfirm(false);
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
            <div className="relative sm:col-span-2">
              <MapPin size={16} className="absolute left-4 top-4 text-neutral-400" />
              <textarea
                required
                rows={2}
                placeholder="Delivery address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleProceedClick}
        disabled={placing}
        className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
      >
        Proceed to Checkout
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl">
            <h2 className="font-heading font-bold text-xl mb-1">Confirm Your Order</h2>
            <p className="text-sm text-neutral-500 mb-5">Please check the details below before placing your order.</p>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2">{item.name} × {item.qty}</span>
                  <span className="text-neutral-500 shrink-0">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/5 dark:border-white/10 pt-3 mb-4 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">₹{total}</span>
              </div>
              <p className="text-xs text-neutral-500 pt-1">Contact: {customerName} · {customerPhone}</p>
              <p className="text-xs text-neutral-500">📍 {customerAddress}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={placing}
                className="flex-1 py-3 rounded-full font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={placing}
                className="flex-1 py-3 rounded-full font-semibold bg-primary text-white hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {placing ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
