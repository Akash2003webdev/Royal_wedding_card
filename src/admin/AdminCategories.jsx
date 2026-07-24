import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { adminGetCategories, createCategory, updateCategory, deleteCategory } from '../supabase/queries.js';
import Modal from './Modal.jsx';
import ImageUploader from './ImageUploader.jsx';
import { inputCls, Field } from './formClasses.jsx';

const ICON_OPTIONS = ['Gem', 'Cake', 'Heart', 'Home', 'Baby', 'PartyPopper', 'Smartphone', 'Package', 'Sparkles'];

const EMPTY = { name: '', slug: '', description: '', icon: 'Sparkles', image_url: '', sort_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetCategories()
      .then(setCategories)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => setEditing({ ...EMPTY });
  const openEdit = (c) => setEditing({ ...c });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        description: editing.description || null,
        icon: editing.icon,
        image_url: editing.image_url || null,
        sort_order: Number(editing.sort_order) || 0,
      };
      if (editing.id) {
        await updateCategory(editing.id, payload);
        toast.success('Category updated');
      } else {
        await createCategory(payload);
        toast.success('Category created');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    try {
      await deleteCategory(c.id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Categories</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => {
            const Icon = Icons[c.icon] || Icons.Sparkles;
            return (
              <div key={c.id} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
                <div className="aspect-video bg-accent dark:bg-neutral-800 overflow-hidden">
                  {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className="text-secondary" />
                    <h3 className="font-heading font-semibold">{c.name}</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mb-3">/{c.slug}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit Category' : 'New Category'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <ImageUploader
              bucket="products"
              folder="categories"
              value={editing.image_url}
              onChange={(url) => setEditing((s) => ({ ...s, image_url: url }))}
            />
            <Field label="Name">
              <input
                required
                value={editing.name}
                onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Slug">
              <input
                required
                value={editing.slug}
                onChange={(e) => setEditing((s) => ({ ...s, slug: e.target.value }))}
                placeholder="wedding-invitations"
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={editing.description}
                onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                rows={2}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Icon">
                <select
                  value={editing.icon}
                  onChange={(e) => setEditing((s) => ({ ...s, icon: e.target.value }))}
                  className={inputCls}
                >
                  {ICON_OPTIONS.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sort Order">
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing((s) => ({ ...s, sort_order: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
