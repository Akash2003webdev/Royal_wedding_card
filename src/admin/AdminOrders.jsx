import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetOrders, updateOrderStatus } from '../supabase/queries.js';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-600',
  cancelled: 'bg-red-500',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    adminGetOrders()
      .then(setOrders)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Orders</h1>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 text-left"
                >
                  <span className={`shrink-0 text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-1 rounded-full text-white ${STATUS_COLOR[o.status] || 'bg-neutral-400'}`}>
                    {o.status}
                  </span>
                  {o.users?.avatar_url ? (
                    <img src={o.users.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 hidden sm:block" />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm sm:text-base">
                      {o.customer_name || o.users?.full_name || 'Guest'} · {o.customer_phone || o.users?.phone || '—'}
                    </p>
                    <p className="text-xs text-neutral-400">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <span className="shrink-0 font-heading font-bold text-primary text-sm sm:text-base">₹{o.total}</span>
                  <span className="shrink-0">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-black/5 dark:border-white/10 pt-4">
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3">
                        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">Account (logged in as)</p>
                        {o.users ? (
                          <div className="flex items-center gap-2">
                            {o.users.avatar_url ? (
                              <img src={o.users.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{o.users.full_name || '—'}</p>
                              <p className="text-xs text-neutral-500">{o.users.phone || '—'}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-400">Guest (no account)</p>
                        )}
                      </div>
                      <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3">
                        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">Order Contact (entered at checkout)</p>
                        <p className="text-sm font-medium">{o.customer_name || '—'}</p>
                        <p className="text-xs text-neutral-500">{o.customer_phone || '—'}</p>
                        {o.customer_address && (
                          <p className="text-xs text-neutral-500 mt-1">📍 {o.customer_address}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {(o.order_items || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.products?.name || 'Deleted product'} × {item.qty}</span>
                          <span className="text-neutral-500">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <label className="block">
                      <span className="block text-xs font-medium mb-1.5 text-neutral-500">Update Status</span>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
          {orders.length === 0 && <p className="text-neutral-400 text-center py-10">No orders yet.</p>}
        </div>
      )}
    </div>
  );
}
