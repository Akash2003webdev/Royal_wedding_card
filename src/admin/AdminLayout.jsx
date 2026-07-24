import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, LayoutGrid, Image as ImageIcon,
  Images, ShoppingCart, Star, Users, ShieldAlert, Settings as SettingsIcon,
  ArrowLeft, LogOut, MoreHorizontal, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminLayout() {
  const { loading, isLoggedIn, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMoreModal, setShowMoreModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate('/login', { state: { redirect: '/admin' }, replace: true });
    } else if (!isAdmin) {
      navigate('/', { replace: true });
    }
  }, [loading, isLoggedIn, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="pt-20 pb-20 text-center text-neutral-500 flex flex-col items-center gap-3">
        <ShieldAlert size={28} className="text-secondary" />
        Loading admin area...
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const primaryNav = NAV.slice(0, 4);
  const overflowNav = NAV.slice(4);

  const isOverflowActive = overflowNav.some((item) => {
    if (item.end) {
      return window.location.pathname === item.to;
    }
    return window.location.pathname.startsWith(item.to);
  });

  return (
    <div className="min-h-screen bg-accent/30 dark:bg-neutral-950 pb-24 lg:pb-0">
      <div
        className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-black/5 dark:border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-neutral-500 hover:text-primary transition-colors shrink-0"
              aria-label="Back to site"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="text-lg font-heading font-bold truncate">
              <span className="text-gradient-gold">Admin Panel</span>
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 hover:text-red-500 transition-colors shrink-0"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        {/* Desktop: sticky sidebar */}
        <aside className="hidden lg:block glass rounded-2xl p-4 h-fit sticky top-24">
          <p className="px-2 pb-3 text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Admin Panel
          </p>
          <nav className="flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'hover:bg-white/60 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile & tablet: Strictly fixed bottom navigation bar */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-black/5 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <nav className="px-2 py-2 flex items-center justify-around">
          {primaryNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-primary dark:text-primary font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary text-white' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setShowMoreModal(true)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium whitespace-nowrap shrink-0 transition-colors ${
              isOverflowActive
                ? 'text-primary dark:text-primary font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isOverflowActive ? 'bg-primary text-white' : ''}`}>
              <MoreHorizontal size={18} />
            </div>
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* More Options Popup Modal */}
      {showMoreModal && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-fade-in">
          <div className="w-full bg-white dark:bg-neutral-900 rounded-t-3xl p-5 border-t border-black/5 dark:border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-black/5 dark:border-white/10">
              <h3 className="text-base font-heading font-bold text-neutral-900 dark:text-white">More Options</h3>
              <button
                onClick={() => setShowMoreModal(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 overflow-y-auto py-2">
              {overflowNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setShowMoreModal(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-xs font-medium transition-colors border ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`
                  }
                >
                  <Icon size={22} />
                  <span className="text-center truncate w-full">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}