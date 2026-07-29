import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
  const { items, updateQty, removeFromCart, total, drawerOpen, closeDrawer } = useCart();
  const navigate = useNavigate();

  // Handle scroll lock and Escape key for accessibility
  useEffect(() => {
    if (!drawerOpen) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  const goToCheckout = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <>
      {/* Glassmorphism Backdrop */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        // Using a custom cubic-bezier for a buttery smooth, native-feeling slide animation
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white dark:bg-[#121212] z-[80] shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#8B1E3F]/10 p-2 rounded-full text-[#8B1E3F] dark:text-[#E85D83]">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">
              Your Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="group p-2 -mr-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Cart Items Area */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-2">
              <ShoppingBag size={48} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your cart is empty</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px]">
                Looks like you haven't added anything yet. Discover our latest collections.
              </p>
            </div>
            <button
              onClick={closeDrawer}
              className="mt-4 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200 shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5 shrink-0 w-24 h-24">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 border border-black/5 dark:border-white/10 rounded-xl" />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-3">
                    <p className="font-semibold text-[#8B1E3F] dark:text-[#E85D83]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                    
                    {/* Modern Pill Quantity Selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-white/10 rounded-full p-1 border border-transparent dark:border-white/5">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1A1A1A] px-6 py-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-[#8B1E3F] dark:text-[#E85D83]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={goToCheckout}
                className="group relative w-full flex items-center justify-center gap-2 bg-[#8B1E3F] hover:bg-[#721833] text-white py-3.5 rounded-xl font-medium transition-all duration-200 shadow-[0_4px_14px_0_rgba(139,30,63,0.39)] hover:shadow-[0_6px_20px_rgba(139,30,63,0.23)] hover:-translate-y-0.5"
              >
                Checkout Securely
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={closeDrawer}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}