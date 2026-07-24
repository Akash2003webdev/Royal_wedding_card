import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, LogOut, Package, ChevronDown, ChevronUp, Heart, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyOrders } from '../supabase/queries.js';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', dot: 'bg-blue-500' },
  shipped: { label: 'Shipped', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', dot: 'bg-indigo-500' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', dot: 'bg-rose-500' },
};

export default function Account() {
  const { user, isLoggedIn, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login', { state: { redirect: '/account' }, replace: true });
    }
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    getMyOrders(user.id)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => active && setOrdersLoading(false));
    return () => {
      active = false;
    };
  }, [user?.id]);

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wider uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out securely');
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-36 pb-24 max-w-3xl mx-auto px-6 md:px-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-black/5 via-black/[0.02] to-transparent dark:from-white/5 dark:via-white/[0.02] dark:to-transparent border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-white flex items-center justify-center shadow-lg shadow-primary/25">
              <User size={32} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">My Account</h1>
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 text-neutral-700 dark:text-neutral-300 hover:text-rose-500 transition-all duration-300 text-sm font-medium"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" /> 
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/wishlist"
          className="group flex items-center justify-between p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm">My Wishlist</h3>
              <p className="text-xs text-neutral-500">Saved items & favorites</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-neutral-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Orders Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2.5 tracking-tight">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package size={20} />
            </div> 
            Order History
          </h2>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-neutral-500">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-center bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Clock size={24} />
            </div>
            <h3 className="font-heading font-semibold mb-1">No orders placed yet</h3>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto">
              Once you place an order via Cart or WhatsApp, your tracking and details will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const isOpen = expanded === o.id;
              const statusInfo = STATUS_CONFIG[o.status] || { label: o.status, bg: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20', dot: 'bg-neutral-500' };
              
              return (
                <div 
                  key={o.id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-black/[0.01] dark:bg-white/[0.01] ${
                    isOpen ? 'border-primary/40 shadow-xl shadow-primary/5 bg-black/[0.02] dark:bg-white/[0.02]' : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                        <span className="capitalize">{statusInfo.label}</span>
                      </div>
                      
                      <div className="min-w-0 hidden sm:block">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {(o.order_items || []).length} item{(o.order_items || []).length === 1 ? '' : 's'}
                        </p>
                        <p className="text-xs text-neutral-400">{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <span className="font-heading font-bold text-base text-primary">₹{o.total}</span>
                        <p className="text-[11px] text-neutral-400 sm:hidden">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-neutral-400'}`}>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-black/5 dark:border-white/5 space-y-3 animate-fadeIn">
                      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider pt-2 mb-3">Order Items</div>
                      {(o.order_items || []).map((item) => {
                        const images = (item.products?.product_images || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-black/5 dark:border-white/5">
                                {images[0]?.url ? (
                                  <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <Package size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                  {item.products?.name || 'Product'}
                                </p>
                                <p className="text-xs text-neutral-400">Qty: {item.qty}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">₹{item.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}