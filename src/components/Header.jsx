import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingBag, User, Menu, X,
  Home, LayoutGrid, BookOpen,
} from 'lucide-react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animations/gsap.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getCategories } from '../supabase/queries.js';

const LONG_PRESS_MS = 600;

export default function Header() {
  const headerRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const pressTimer = useRef(null);
  const longPressFired = useRef(false);

  const startPress = () => {
    longPressFired.current = false;
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      if (isAdmin) navigate('/admin');
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => {
    clearTimeout(pressTimer.current);
  };
  const handleLogoClick = (e) => {
    if (longPressFired.current) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) setAllCategories(data);
      })
      .catch((err) => console.error('Failed to load categories:', err));
    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion || !headerRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 120,
        onUpdate: (self) => {
          gsap.to(headerRef.current, {
            backgroundColor: self.progress > 0.1 ? 'rgba(255,250,245,0.90)' : 'rgba(255,250,245,0)',
            backdropFilter: self.progress > 0.1 ? 'blur(16px)' : 'blur(0px)',
            boxShadow: self.progress > 0.1 ? '0 8px 30px rgba(0,0,0,0.06)' : 'none',
            duration: 0.3,
            overwrite: true,
          });
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="absolute top-0 left-0 right-0 z-50 transition-colors text-[#2B2118] bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-24">
          {/* Brand Logo with Crown UI reference */}
          <Link
            to="/"
            className="flex flex-col items-center select-none py-2"
            onClick={handleLogoClick}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
          >
            <div className="flex items-center gap-1.5 text-[#8B1E3F]">
              <svg width="20" height="14" viewBox="0 0 24 18" fill="currentColor" className="text-[#D4AF37]">
                <path d="M12 1l3 5h6l-3.5 8.5h-11l-3.5-8.5h6l3-5z" fill="#D4AF37" />
                <circle cx="3" cy="15" r="1.5" fill="#D4AF37" />
                <circle cx="12" cy="16" r="1.5" fill="#D4AF37" />
                <circle cx="21" cy="15" r="1.5" fill="#D4AF37" />
              </svg>
            </div>
            <span className="text-2xl md:text-3xl font-heading font-bold text-gradient-gold">
              Royal Invitations
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-[1px] w-6 bg-[#D4AF37]"></span>
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#8B1E3F] font-semibold">Celebrate in style</span>
              <span className="h-[1px] w-6 bg-[#D4AF37]"></span>
            </div>
          </Link>

          {/* Original Nav Links from Code */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-[#2B2118]">
            <NavLink to="/" className="hover:text-[#8B1E3F] transition-colors">Home</NavLink>
            {/* <div className="relative group">
              <button className="hover:text-[#8B1E3F] transition-colors">Categories</button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="glass rounded-2xl shadow-premium p-6 grid grid-cols-2 gap-4 w-[420px] bg-white/95">
                  {allCategories.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/collections/${c.slug}`}
                      className="text-sm text-[#2B2118] hover:text-[#8B1E3F] transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div> */}
            <NavLink to="/collections" className="hover:text-[#8B1E3F] transition-colors">Collections</NavLink>
            <NavLink to="/gallery" className="hover:text-[#8B1E3F] transition-colors">Gallery</NavLink>
            <NavLink to="/about" className="hover:text-[#8B1E3F] transition-colors">About</NavLink>
            <NavLink to="/contact" className="hover:text-[#8B1E3F] transition-colors">Contact</NavLink>
          </nav>

          {/* Icons Action Area (Search & Theme toggles removed) */}
          <div className="flex items-center gap-4 text-[#2B2118]">
            <Link to="/wishlist" aria-label="Wishlist" className="relative hidden md:inline-flex hover:text-[#8B1E3F] transition-colors">
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8B1E3F] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative hover:text-[#8B1E3F] transition-colors">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8B1E3F] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>
            <Link to="/account" aria-label="Account" className="hidden md:inline-flex hover:text-[#8B1E3F] transition-colors">
              <User size={20} />
            </Link>
            <button
              className="lg:hidden text-[#2B2118]"
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#fffaf5]/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3 text-sm font-medium text-[#2B2118] border-b border-black/5 shadow-lg">
            <NavLink to="/" onClick={() => setMobileOpen(false)} className="hover:text-[#8B1E3F]">Home</NavLink>
            <NavLink to="/collections" onClick={() => setMobileOpen(false)} className="hover:text-[#8B1E3F]">Collections</NavLink>
            <NavLink to="/gallery" onClick={() => setMobileOpen(false)} className="hover:text-[#8B1E3F]">Gallery</NavLink>
            <NavLink to="/about" onClick={() => setMobileOpen(false)} className="hover:text-[#8B1E3F]">About</NavLink>
            <NavLink to="/contact" onClick={() => setMobileOpen(false)} className="hover:text-[#8B1E3F]">Contact</NavLink>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fffaf5]/95 backdrop-blur-md flex items-center py-3 px-1 border-t border-black/5 shadow-2xl text-[#2B2118]">
        <Link to="/" className="flex-1 min-w-0 flex flex-col items-center gap-1 text-[10px] xs:text-xs text-center hover:text-[#8B1E3F]"><Home size={20} /><span className="truncate">Home</span></Link>
        <Link to="/collections" className="flex-1 min-w-0 flex flex-col items-center gap-1 text-[10px] xs:text-xs text-center hover:text-[#8B1E3F]"><LayoutGrid size={20} /><span className="truncate">Categories</span></Link>
        <Link to="/gallery" className="flex-1 min-w-0 flex flex-col items-center gap-1 text-[10px] xs:text-xs text-center hover:text-[#8B1E3F]"><BookOpen size={20} /><span className="truncate">Gallery</span></Link>
        <Link to="/wishlist" className="flex-1 min-w-0 flex flex-col items-center gap-1 text-[10px] xs:text-xs text-center hover:text-[#8B1E3F]"><Heart size={20} /><span className="truncate">Wishlist</span></Link>
        <Link to="/account" className="flex-1 min-w-0 flex flex-col items-center gap-1 text-[10px] xs:text-xs text-center hover:text-[#8B1E3F]"><User size={20} /><span className="truncate">Profile</span></Link>
      </nav>
    </>
  );
}
