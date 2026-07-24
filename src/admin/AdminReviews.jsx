import { useEffect, useState } from 'react';
import { Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetReviews, deleteReview } from '../supabase/queries.js';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetReviews()
      .then(setReviews)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (r) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(r.id);
      toast.success('Review deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Reviews</h1>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-heading font-semibold">{r.customer_name || 'Anonymous'}</p>
                    <span className="flex items-center gap-1 text-secondary text-xs">
                      <Star size={12} className="fill-secondary" /> {r.rating}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-2">{r.products?.name || 'General'}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{r.comment}</p>
                </div>
                <button onClick={() => handleDelete(r)} className="text-red-400 hover:text-red-500 shrink-0" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-neutral-400 text-center py-10">No reviews yet.</p>}
        </div>
      )}
    </div>
  );
}
