import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Camera, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminGetProducts, adminGetCategories, createProduct, updateProduct, deleteProduct,
  addProductImage, uploadImage,
} from '../supabase/queries.js';
import Modal from './Modal.jsx';
import ImageUploader from './ImageUploader.jsx';
import { inputCls, Field } from './formClasses.jsx';

const EMPTY = {
  name: '', slug: '', category_id: '', description: '', price: '', compare_at_price: '',
  badge: '', paper_quality: '', dimensions: '', delivery_days: 5, stock: 100,
  is_active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState([]); // pending File objects for a new product
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    Promise.all([adminGetProducts(), adminGetCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({ ...EMPTY });
    setGalleryFiles([]);
  };
  const openEdit = (p) => {
    const cat = categories.find((c) => c.slug === p.category);
    setEditing({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: cat?.id || '',
      description: p.description || '',
      price: p.price,
      compare_at_price: p.compareAtPrice || '',
      badge: p.badge || '',
      paper_quality: p.paperQuality || '',
      dimensions: p.dimensions || '',
      delivery_days: p.deliveryDays ?? 5,
      stock: p.stock ?? 100,
      is_active: true,
      images: p.images || [],
      _productId: p.id,
    });
    setGalleryFiles([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        category_id: editing.category_id || null,
        description: editing.description || null,
        price: Number(editing.price),
        compare_at_price: editing.compare_at_price ? Number(editing.compare_at_price) : null,
        badge: editing.badge || null,
        paper_quality: editing.paper_quality || null,
        dimensions: editing.dimensions || null,
        delivery_days: Number(editing.delivery_days) || 5,
        stock: Number(editing.stock) || 0,
      };

      let productId = editing.id;
      if (productId) {
        await updateProduct(productId, payload);
        toast.success('Product updated');
      } else {
        const created = await createProduct(payload);
        productId = created.id;
        toast.success('Product created');
      }

      // Upload any newly-selected gallery images and attach them
      for (let i = 0; i < galleryFiles.length; i++) {
        const { url } = await uploadImage('products', galleryFiles[i], productId);
        await addProductImage(productId, url, i);
      }

      setEditing(null);
      setGalleryFiles([]);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(p.id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Products</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid gap-3 sm:hidden">
            {products.map((p) => (
              <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 p-3 flex gap-3">
                <div className="w-14 h-16 rounded-lg overflow-hidden bg-accent dark:bg-neutral-800 shrink-0">
                  {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium truncate">{p.name}</p>
                    <span className="text-primary font-semibold text-sm shrink-0">₹{p.price}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-1">{p.categoryName || '—'}</p>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                    <span className="flex items-center gap-1 text-secondary"><Star size={11} className="fill-secondary" />{p.rating}</span>
                    <span>Stock: {p.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-neutral-400 text-center py-10">No products yet.</p>}
          </div>

          {/* Tablet & up: table */}
          <div className="hidden sm:block bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-accent/60 dark:bg-neutral-800 text-left">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg overflow-hidden bg-accent dark:bg-neutral-800 shrink-0">
                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td className="p-3 text-neutral-500">{p.categoryName || '—'}</td>
                    <td className="p-3 text-primary font-semibold">₹{p.price}</td>
                    <td className="p-3 flex items-center gap-1 text-secondary"><Star size={12} className="fill-secondary" />{p.rating}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit Product' : 'New Product'} onClose={() => setEditing(null)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            {editing.images?.length > 0 && (
              <div>
                <span className="block text-sm font-medium mb-2">Existing Images</span>
                <div className="flex gap-2 flex-wrap">
                  {editing.images.map((url, i) => (
                    <div key={url} className="relative w-20 h-24 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="block text-sm font-medium mb-2">Add Gallery Images</span>
              <div className="rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-4">
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 flex-1 py-3 rounded-lg text-neutral-400 hover:text-secondary hover:bg-secondary/5 transition-colors"
                  >
                    <Camera size={20} />
                    <span className="text-xs">Camera</span>
                  </button>
                  <div className="w-px h-10 bg-neutral-300 dark:bg-neutral-700" />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 flex-1 py-3 rounded-lg text-neutral-400 hover:text-secondary hover:bg-secondary/5 transition-colors"
                  >
                    <ImageIcon size={20} />
                    <span className="text-xs">Gallery</span>
                  </button>
                </div>
                {/* capture="environment" opens the rear camera directly */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setGalleryFiles((prev) => [...prev, ...files]);
                    e.target.value = '';
                  }}
                />
                {/* no capture attr -> normal photo library, allows multi-select */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setGalleryFiles((prev) => [...prev, ...files]);
                    e.target.value = '';
                  }}
                />
              </div>
              {galleryFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {galleryFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 shrink-0">
                      <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                        aria-label="Remove"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input required value={editing.name} onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Slug">
                <input required value={editing.slug} onChange={(e) => setEditing((s) => ({ ...s, slug: e.target.value }))} className={inputCls} />
              </Field>
            </div>

            <Field label="Description">
              <textarea rows={2} value={editing.description} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} className={inputCls} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category">
                <select value={editing.category_id} onChange={(e) => setEditing((s) => ({ ...s, category_id: e.target.value }))} className={inputCls}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Badge">
                <select value={editing.badge} onChange={(e) => setEditing((s) => ({ ...s, badge: e.target.value }))} className={inputCls}>
                  <option value="">— None —</option>
                  <option value="new">New</option>
                  <option value="best_seller">Best Seller</option>
                  <option value="premium">Premium</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Price (₹)">
                <input required type="number" min="0" step="0.01" value={editing.price} onChange={(e) => setEditing((s) => ({ ...s, price: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Compare-at Price">
                <input type="number" min="0" step="0.01" value={editing.compare_at_price} onChange={(e) => setEditing((s) => ({ ...s, compare_at_price: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Stock">
                <input type="number" min="0" value={editing.stock} onChange={(e) => setEditing((s) => ({ ...s, stock: e.target.value }))} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Paper Quality">
                <input value={editing.paper_quality} onChange={(e) => setEditing((s) => ({ ...s, paper_quality: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Dimensions">
                <input value={editing.dimensions} onChange={(e) => setEditing((s) => ({ ...s, dimensions: e.target.value }))} placeholder="5 x 7 inches" className={inputCls} />
              </Field>
              <Field label="Delivery Days">
                <input type="number" min="1" value={editing.delivery_days} onChange={(e) => setEditing((s) => ({ ...s, delivery_days: e.target.value }))} className={inputCls} />
              </Field>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
