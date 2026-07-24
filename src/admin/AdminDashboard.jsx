import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, LayoutGrid, ShoppingCart, Star, Users, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../supabase/client.js';

const CARDS = [
  { key: 'products', label: 'Products', icon: Package, to: '/admin/products' },
  { key: 'categories', label: 'Categories', icon: LayoutGrid, to: '/admin/categories' },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, to: '/admin/orders' },
  { key: 'reviews', label: 'Reviews', icon: Star, to: '/admin/reviews' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin/users' },
  { key: 'gallery', label: 'Gallery Items', icon: ImageIcon, to: '/admin/gallery' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const tables = ['products', 'categories', 'orders', 'reviews', 'users', 'gallery'];
    Promise.all(
      tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true }))
    )
      .then((results) => {
        if (!active) return;
        const next = {};
        tables.forEach((t, i) => {
          next[t] = results[i].count ?? 0;
        });
        setCounts(next);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-1">
        <span className="text-gradient-gold">Dashboard</span>
      </h1>
      <p className="text-neutral-500 mb-8 text-sm">Full access to every table and storage bucket.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ key, label, icon: Icon, to }) => (
          <Link
            key={key}
            to={to}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10 hover:border-secondary hover:shadow-gold transition-all"
          >
            <Icon size={22} className="text-primary mb-3" />
            <p className="text-2xl font-heading font-bold">{loading ? '—' : counts[key] ?? 0}</p>
            <p className="text-sm text-neutral-500">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
