import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetGallery, adminGetCategories, createGalleryItem, deleteGalleryItem } from '../supabase/queries.js';
import Modal from './Modal.jsx';
import ImageUploader from './ImageUploader.jsx';
import { inputCls, Field } from './formClasses.jsx';

const EMPTY = { image_url: '', caption: '', category_id: '' };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminGetGallery(), adminGetCategories()])
      .then(([g, c]) => {
        setItems(g);
        setCategories(c);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!creating.image_url) {
      toast.error('Please upload an image first');
      return;
    }
    setSaving(true);
    try {
      await createGalleryItem({
        image_url: creating.image_url,
        caption: creating.caption || null,
        category_id: creating.category_id || null,
      });
      toast.success('Added to gallery');
      setCreating(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('Remove this image from the gallery?')) return;
    try {
      await deleteGalleryItem(item.id);
      toast.success('Removed');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Gallery</h1>
        <button
          onClick={() => setCreating({ ...EMPTY })}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> Add Image
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative rounded-xl overflow-hidden break-inside-avoid group">
              <img src={item.image_url} alt={item.caption || ''} className="w-full" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                {item.caption && <span className="text-white text-xs truncate">{item.caption}</span>}
                <button
                  onClick={() => handleDelete(item)}
                  className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white shrink-0 ml-auto"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-neutral-400 text-center py-10 col-span-full">No gallery images yet.</p>}
        </div>
      )}

      {creating && (
        <Modal title="Add Gallery Image" onClose={() => setCreating(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUploader
              bucket="gallery"
              value={creating.image_url}
              onChange={(url) => setCreating((s) => ({ ...s, image_url: url }))}
            />
            <Field label="Caption">
              <input value={creating.caption} onChange={(e) => setCreating((s) => ({ ...s, caption: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Category (optional)">
              <select value={creating.category_id} onChange={(e) => setCreating((s) => ({ ...s, category_id: e.target.value }))} className={inputCls}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Add to Gallery'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
