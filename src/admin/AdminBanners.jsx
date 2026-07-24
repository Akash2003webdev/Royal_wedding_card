import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetBanners, createBanner, updateBanner, deleteBanner } from '../supabase/queries.js';
import Modal from './Modal.jsx';
import ImageUploader from './ImageUploader.jsx';
import { inputCls, Field } from './formClasses.jsx';

const EMPTY = { title: '', subtitle: '', image_url: '', link_url: '', active: true, sort_order: 0 };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetBanners()
      .then(setBanners)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => setEditing({ ...EMPTY });
  const openEdit = (b) => setEditing({
    id: b.id,
    title: b.title || '',
    subtitle: b.subtitle || '',
    image_url: b.image || '',
    link_url: b.link || '',
    active: true,
    sort_order: 0,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: editing.title || null,
        subtitle: editing.subtitle || null,
        image_url: editing.image_url || null,
        link_url: editing.link_url || null,
        active: !!editing.active,
        sort_order: Number(editing.sort_order) || 0,
      };
      if (editing.id) {
        await updateBanner(editing.id, payload);
        toast.success('Banner updated');
      } else {
        await createBanner(payload);
        toast.success('Banner created');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b) => {
    try {
      await updateBanner(b.id, { active: !b.active });
      load();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async (b) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteBanner(b.id);
      toast.success('Banner deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Banners</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> New Banner
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {banners.map((b) => (
            <div key={b.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 p-3">
              <div className="w-24 h-14 sm:w-28 sm:h-16 rounded-lg overflow-hidden bg-accent dark:bg-neutral-800 shrink-0">
                {b.image && <img src={b.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="font-heading font-semibold truncate">{b.title || 'Untitled banner'}</p>
                <p className="text-xs text-neutral-400 truncate">{b.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${b.active ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                  {b.active ? 'Active' : 'Hidden'}
                </span>
                <button onClick={() => toggleActive(b)} className="hover:text-secondary" aria-label="Toggle active">
                  {b.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(b)} className="hover:text-secondary" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(b)} className="text-red-400 hover:text-red-500" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-neutral-400 text-center py-10">No banners yet.</p>}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit Banner' : 'New Banner'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUploader
              bucket="banners"
              value={editing.image_url}
              onChange={(url) => setEditing((s) => ({ ...s, image_url: url }))}
            />
            <Field label="Title">
              <input value={editing.title} onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Subtitle">
              <input value={editing.subtitle} onChange={(e) => setEditing((s) => ({ ...s, subtitle: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Link (optional)">
              <input
                value={editing.link_url}
                onChange={(e) => setEditing((s) => ({ ...s, link_url: e.target.value }))}
                placeholder="/collections/wedding-invitations or https://..."
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sort Order">
                <input type="number" value={editing.sort_order} onChange={(e) => setEditing((s) => ({ ...s, sort_order: e.target.value }))} className={inputCls} />
              </Field>
              <label className="flex items-center gap-2 mt-7">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing((s) => ({ ...s, active: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Banner'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
