import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

// Floating "Cart Total / Checkout" pill — appears the moment something is
// added to the cart and updates live as items/quantities change.
export default function CartTotalBar() {
  const { count, total } = useCart();

  if (count === 0) return null;

  return (
    <div className="fixed z-40 left-4 bottom-24 lg:left-6 lg:bottom-8">
      <div className="flex items-center gap-4 bg-gradient-to-r from-[#8B1E3F] to-[#5E1329] text-white rounded-2xl shadow-premium pl-5 pr-2 py-2">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-white/70 font-semibold">Cart Total</p>
          <p className="text-lg font-bold leading-tight">₹{total}</p>
        </div>
        <Link
          to="/cart"
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
        >
          <ShoppingBag size={16} /> Checkout
        </Link>
      </div>
    </div>
  );
}