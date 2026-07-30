import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

// Slide-in cart drawer: opens automatically right after "Add to Cart",
// so the shopper sees confirmation + the running total without leaving
// the page. "View Cart & Checkout" hands off to the full /cart page.
export default function CartDrawer() {
  const { items, updateQty, removeFromCart, total, drawerOpen, closeDrawer } = useCart();
  const navigate = useNavigate();

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (drawerOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [drawerOpen]);

  const goToCheckout = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Cart"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#fffaf5] dark:bg-neutral-900 z-[80] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#8B1E3F]" />
            <h2 className="font-heading font-bold text-lg text-[#2B2118] dark:text-white">
              Your Cart {items.length > 0 && `(${items.length})`}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag size={40} className="text-neutral-300" />
            <p className="text-neutral-400">Your cart is empty.</p>
            <button
              onClick={closeDrawer}
              className="mt-2 text-sm font-semibold text-[#8B1E3F] underline"
            >
              Keep browsing
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-lg shrink-0 border border-black/5 dark:border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-[#2B2118] dark:text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-[#8B1E3F] font-semibold text-sm">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-full">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="p-1.5 text-neutral-500 hover:text-[#8B1E3F]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="p-1.5 text-neutral-500 hover:text-[#8B1E3F]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      className="text-neutral-400 hover:text-[#8B1E3F] p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer / totals + checkout */}
        {items.length > 0 && (
          <div className="border-t border-black/5 dark:border-white/10 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold text-[#2B2118] dark:text-white">
              <span>Subtotal</span>
              <span className="text-[#8B1E3F]">₹{total}</span>
            </div>
            <button
              onClick={goToCheckout}
              className="w-full bg-[#8B1E3F] text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform"
            >
              View Cart &amp; Checkout
            </button>
            <button
              onClick={closeDrawer}
              className="w-full text-sm text-neutral-500 hover:text-[#8B1E3F] transition-colors"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
