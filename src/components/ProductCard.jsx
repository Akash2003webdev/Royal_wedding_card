import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MessageCircle } from 'lucide-react';
import { gsap } from '../animations/gsap.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { WHATSAPP_NUMBER } from '../constants/business.js';
import { createWhatsappOrder } from '../supabase/queries.js';
import { buildWhatsappOrderMessage } from '../utils/whatsapp.js';

const BADGE_LABEL = { new: 'New', best_seller: 'Best Seller', premium: 'Premium' };
const BADGE_COLOR = {
  new: 'bg-emerald-600',
  best_seller: 'bg-primary',
  premium: 'bg-secondary text-neutral-900',
};

export default function ProductCard({ product }) {
  const imgRef = useRef(null);
  const cardRef = useRef(null);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const wished = isWishlisted(product.id);

  // Fires alongside the WhatsApp link opening — not awaited, so it never
  // delays or blocks the tab from opening (and avoids popup blockers).
  const logWhatsappOrder = () => {
    createWhatsappOrder(product, 1, user?.id ?? null).catch((err) =>
      console.error('Failed to record WhatsApp order:', err)
    );
  };

  const onEnter = () => {
    gsap.to(imgRef.current, { scale: 1.08, duration: 0.6, ease: 'power3.out' });
    gsap.to(cardRef.current, {
      y: -6,
      boxShadow: '0 20px 45px rgba(212,175,55,0.25)',
      borderColor: '#D4AF37',
      duration: 0.35,
    });
  };
  const onLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.6, ease: 'power3.out' });
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      borderColor: 'rgba(0,0,0,0.06)',
      duration: 0.35,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="reveal-item group rounded-2xl overflow-hidden border border-black/5 bg-white dark:bg-neutral-900 opacity-0"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <Link to={`/product/${product.id}`}>
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white ${BADGE_COLOR[product.badge]}`}>
            {BADGE_LABEL[product.badge]}
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart size={16} className={wished ? 'fill-primary text-primary' : 'text-neutral-700'} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-heading text-lg mb-1 truncate">{product.name}</h3>
        <div className="flex items-center gap-1 text-secondary text-sm mb-2">
          <Star size={14} className="fill-secondary" /> {product.rating}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary">₹{product.price}</span>
          <div className="flex gap-2">
            <Link
              to={`/product/${product.id}`}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
            >
              View Details
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappOrderMessage(product, 1))}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Order on WhatsApp"
              onClick={logWhatsappOrder}
              className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
