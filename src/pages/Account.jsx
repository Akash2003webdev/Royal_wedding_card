import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  User, LogOut, Package, ChevronDown, Heart, ArrowRight, 
  ShieldCheck, Clock, Phone, Save, AlertCircle, MapPin, 
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyOrders, updateUserProfile } from '../supabase/queries.js';
import ProfileAvatarEditor from '../components/ProfileAvatarEditor.jsx';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
  shipped: { label: 'Shipped', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-500' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
};

export default function Account() {
  const { user, isLoggedIn, loading, signOut, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const needsProfile = location.state?.needsProfile;
  const returnTo = location.state?.redirect;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setAvatarUrl(profile?.avatar_url || '');
  }, [profile]);

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-neutral-200 dark:border-neutral-800" />
            <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin ease-in-out duration-1000" />
          </div>
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Authenticating</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out securely');
    navigate('/');
  };

  const handleAvatarChange = async (url) => {
    setAvatarUrl(url);
    try {
      await updateUserProfile(user.id, { avatarUrl: url });
      await refreshProfile();
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Could not save photo to your profile');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Name, phone and address are required to place orders');
      return;
    }
    setSavingProfile(true);
    try {
      await updateUserProfile(user.id, { fullName: fullName.trim(), phone: phone.trim(), address: address.trim() });
      await refreshProfile();
      toast.success('Profile updated successfully');
      if (returnTo) navigate(returnTo);
    } catch (err) {
      toast.error(err.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-neutral-50 dark:bg-neutral-950 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200 dark:border-neutral-800/50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 ring-4 ring-white dark:ring-neutral-950 shadow-xl">
                <ProfileAvatarEditor userId={user.id} value={avatarUrl} onChange={handleAvatarChange} />
              </div>
              <div className="absolute inset-0 rounded-full border border-black/5 dark:border-white/5 pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {fullName || 'My Account'}
                </h1>
                {fullName && <ShieldCheck size={22} className="text-primary" />}
              </div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 text-sm font-semibold shadow-sm"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" /> 
            <span>Sign Out</span>
          </button>
        </header>

        {needsProfile && (
          <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 shadow-sm animate-in slide-in-from-top-4 duration-500">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">
              To ensure a seamless checkout experience, please provide your delivery details below.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- Left Column: Navigation & Profile --- */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-2 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60">
              <Link
                to="/wishlist"
                className="group flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Heart size={18} className="transition-transform group-hover:scale-110 duration-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Wishlist</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">View your saved items</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              </Link>
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User size={16} />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Personal Details</h2>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  />
                </div>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  />
                </div>
                <div className="relative group">
                  <MapPin size={16} className="absolute left-4 top-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                  <textarea
                    required
                    rows={3}
                    placeholder="Delivery Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-3.5 rounded-2xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-lg shadow-neutral-900/10 dark:shadow-white/10"
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingProfile ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* --- Right Column: Orders --- */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 min-h-full">
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Package size={16} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Order History</h2>
                </div>
                <span className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-6">
                    <Clock size={28} className="text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No orders yet</h3>
                  <p className="text-neutral-500 text-sm max-w-[260px] leading-relaxed">
                    When you place an order, your details and tracking status will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    const isOpen = expanded === o.id;
                    const statusInfo = STATUS_CONFIG[o.status] || { 
                      label: o.status, 
                      bg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700', 
                      dot: 'bg-neutral-400' 
                    };
                    
                    return (
                      <div 
                        key={o.id} 
                        className={`group rounded-2xl border transition-all duration-300 ease-out overflow-hidden ${
                          isOpen 
                            ? 'border-primary/30 bg-primary/[0.02] shadow-lg shadow-primary/5' 
                            : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <button
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="w-full flex items-center justify-between p-5 text-left"
                        >
                          <div className="flex items-center gap-5 min-w-0">
                            <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md border text-[10px] uppercase tracking-wider font-bold ${statusInfo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${o.status === 'pending' || o.status === 'shipped' ? 'animate-pulse' : ''}`} />
                              <span>{statusInfo.label}</span>
                            </div>
                            
                            <div className="min-w-0 hidden sm:block border-l border-neutral-200 dark:border-neutral-800 pl-5">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {(o.order_items || []).length} Item{(o.order_items || []).length === 1 ? '' : 's'}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="font-bold text-base text-neutral-900 dark:text-white">₹{o.total}</span>
                              <p className="text-xs text-neutral-500 sm:hidden mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary border-primary text-white dark:bg-primary' : 'text-neutral-500 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800'}`}>
                              <ChevronDown size={14} strokeWidth={2.5} />
                            </div>
                          </div>
                        </button>

                        {/* Expandable Content */}
                        <div 
                          className={`grid transition-all duration-300 ease-in-out ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-5 pb-5 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
                              {(o.order_items || []).map((item) => {
                                const images = (item.products?.product_images || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                                return (
                                  <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                                        {images[0]?.url ? (
                                          <img src={images[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                            <Package size={16} />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                          {item.products?.name || 'Product Details'}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">Qty: <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.qty}</span></p>
                                      </div>
                                    </div>
                                    <span className="text-sm font-bold text-neutral-900 dark:text-white shrink-0">₹{item.price}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}