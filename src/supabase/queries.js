import { supabase } from './client.js';

// ---------- Normalizers ----------
// Map raw Supabase rows to the flat shape the UI components expect
// (image, category slug string, etc.) so pages don't need to know about
// the underlying table/column names.
function normalizeCategory(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    image: row.image_url,
  };
}

function normalizeProduct(row) {
  if (!row) return row;
  const images = (row.product_images || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return {
    id: row.id,
    category: row.categories?.slug ?? row.category_id,
    categoryName: row.categories?.name,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price != null ? Number(row.price) : row.price,
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    badge: row.badge,
    paperQuality: row.paper_quality,
    dimensions: row.dimensions,
    customizable: row.customizable,
    deliveryDays: row.delivery_days,
    stock: row.stock,
    rating: row.rating != null ? Number(row.rating) : 0,
    ratingCount: row.rating_count,
    image: images[0]?.url,
    images: images.map((img) => img.url),
    reviews: row.reviews,
  };
}

// ---------- Categories ----------
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return (data || []).map(normalizeCategory);
}

export async function getFeaturedCategories(limit = 4) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
    .limit(limit);
  if (error) throw error;
  return (data || []).map(normalizeCategory);
}

// ---------- Products ----------
export async function getProducts({ categorySlug, search, sort, limit = 24, offset = 0 } = {}) {
  let query = supabase
    .from('products')
    .select(`*, product_images(*), categories${categorySlug ? '!inner' : ''}(name, slug)`)
    .eq('is_active', true)
    .range(offset, offset + limit - 1);

  if (categorySlug) query = query.eq('categories.slug', categorySlug);
  if (search) query = query.ilike('name', `%${search}%`);
  if (sort === 'newest') query = query.order('created_at', { ascending: false });
  if (sort === 'price_low') query = query.order('price', { ascending: true });
  if (sort === 'price_high') query = query.order('price', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), categories(name, slug)')
    .eq('is_active', true)
    .in('badge', ['best_seller', 'premium'])
    .limit(limit);
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), categories(name, slug), reviews(*)')
    .eq('id', id)
    .order('created_at', { foreignTable: 'reviews', ascending: false })
    .single();
  if (error) throw error;
  return normalizeProduct(data);
}

export async function getRelatedProducts(categorySlug, excludeId, limit = 4) {
  if (!categorySlug) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), categories!inner(name, slug)')
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .neq('id', excludeId)
    .limit(limit);
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

// ---------- Reviews ----------
// Public: anyone can leave a review for a product (per RLS policy).
// Pass userId when the shopper is logged in so it's attributed to their account.
export async function submitReview(productId, { customerName, rating, comment, userId = null }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      customer_name: customerName,
      rating,
      comment,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Wishlist ----------
// A shopper's wishlist, joined back to full product rows so the UI has
// everything it needs (image, price, badge, etc.) without a second fetch.
export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('product_id, products(*, product_images(*), categories(name, slug))')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || [])
    .map((row) => normalizeProduct(row.products))
    .filter((p) => p && p.id);
}

export async function addWishlist(userId, productId) {
  const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
  if (error) throw error;
}

export async function removeWishlist(userId, productId) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

// ---------- Cart ----------
// A shopper's cart, joined to full product rows (qty comes from the cart
// row itself, everything else — name/price/image — comes from products).
export async function getCart(userId) {
  const { data, error } = await supabase
    .from('cart')
    .select('qty, product_id, products(*, product_images(*), categories(name, slug))')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || [])
    .map((row) => {
      const product = normalizeProduct(row.products);
      return product && product.id ? { ...product, qty: row.qty } : null;
    })
    .filter(Boolean);
}

export async function upsertCartItem(userId, productId, qty) {
  const { error } = await supabase
    .from('cart')
    .upsert({ user_id: userId, product_id: productId, qty }, { onConflict: 'user_id,product_id' });
  if (error) throw error;
}

export async function removeCartItem(userId, productId) {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function clearCartItems(userId) {
  const { error } = await supabase.from('cart').delete().eq('user_id', userId);
  if (error) throw error;
}

// ---------- Orders ----------
export async function createOrder(userId, items, total, contact = {}) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      status: 'pending',
      customer_name: contact.customerName || null,
      customer_phone: contact.customerPhone || null,
      customer_address: contact.customerAddress || null,
    })
    .select()
    .single();
  if (error) throw error;

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.id,
    qty: i.qty,
    price: i.price,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;
  return order;
}

// Logs a single-product order when someone taps "Order via WhatsApp".
// Works for guests too (userId can be null) — the click itself is the
// intent to buy, so we record it without forcing a login first.
export async function createWhatsappOrder(product, qty = 1, userId = null, contact = {}) {
  return createOrder(userId, [{ id: product.id, qty, price: product.price }], Number(product.price) * qty, contact);
}

// A shopper's own order history (RLS restricts this to auth.uid() = user_id).
export async function getMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, slug, product_images(url, sort_order)))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ---------- Reviews ----------
export async function getReviews(limit = 12) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ---------- Gallery ----------
export async function getGallery(limit = 30) {
  const { data, error } = await supabase.from('gallery').select('*').limit(limit);
  if (error) throw error;
  return data;
}

// ---------- Banners ----------
function normalizeBanner(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image_url,
    link: row.link_url,
  };
}

export async function getActiveBanners() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data || []).map(normalizeBanner);
}

// ============================================================
// STORAGE — image uploads
// ============================================================

// Uploads a File to a public bucket and returns its public URL.
// folder is an optional prefix, e.g. 'categories' or 'products/<id>'.
export async function uploadImage(bucket, file, folder = '') {
  const ext = file.name.split('.').pop();
  const path = `${folder ? `${folder}/` : ''}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteImage(bucket, path) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// ============================================================
// ADMIN — role
// ============================================================

export async function getUserRole(userId) {
  const { data, error } = await supabase.from('users').select('role').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.role || 'user';
}

// Full profile (name, phone, avatar) for the logged-in user — used to
// prefill checkout and to show "who's logged in" alongside orders.
// Some accounts (created before the profile trigger existed, or hit
// mid-signup) may not have a matching `users` row yet — maybeSingle()
// avoids throwing on 0 rows, and we create the row on the spot instead.
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, phone, address, avatar_url, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({ id: userId })
    .select('id, full_name, phone, address, avatar_url, role')
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function updateUserProfile(userId, { fullName, phone, address, avatarUrl } = {}) {
  const patch = { id: userId };
  if (fullName !== undefined) patch.full_name = fullName;
  if (phone !== undefined) patch.phone = phone;
  if (address !== undefined) patch.address = address;
  if (avatarUrl !== undefined) patch.avatar_url = avatarUrl;
  // upsert (not update) so this also works if the `users` row doesn't
  // exist yet — update-with-no-matching-row would otherwise return 0
  // rows and .single() would throw this same coercion error.
  const { data, error } = await supabase.from('users').upsert(patch).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// ADMIN — Categories
// ============================================================

export async function adminGetCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function createCategory(payload) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, payload) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// ADMIN — Products
// ============================================================

export async function adminGetProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), categories(name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function addProductImage(productId, url, sortOrder = 0, alt = '') {
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, sort_order: sortOrder, alt })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductImage(id) {
  const { error } = await supabase.from('product_images').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// ADMIN — Banners
// ============================================================

export async function adminGetBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('sort_order');
  if (error) throw error;
  return (data || []).map(normalizeBanner);
}

export async function createBanner(payload) {
  const { data, error } = await supabase.from('banners').insert(payload).select().single();
  if (error) throw error;
  return normalizeBanner(data);
}

export async function updateBanner(id, payload) {
  const { data, error } = await supabase.from('banners').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return normalizeBanner(data);
}

export async function deleteBanner(id) {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// ADMIN — Gallery
// ============================================================

export async function adminGetGallery() {
  const { data, error } = await supabase
    .from('gallery')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createGalleryItem(payload) {
  const { data, error } = await supabase.from('gallery').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id) {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// ADMIN — Reviews
// ============================================================

export async function adminGetReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteReview(id) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// ADMIN — Orders
// ============================================================

export async function adminGetOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!orders?.length) return [];

  // orders.user_id references auth.users, not public.users, so PostgREST
  // can't auto-embed the profile — fetch matching profiles and merge them in.
  const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))];
  let profilesById = {};
  if (userIds.length) {
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, phone, avatar_url')
      .in('id', userIds);
    if (profileError) throw profileError;
    profilesById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  }

  return orders.map((o) => ({ ...o, users: profilesById[o.user_id] || null }));
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// ADMIN — Users
// ============================================================

export async function adminGetUsers() {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateUserRole(id, role) {
  const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// ADMIN — Settings
// ============================================================

export async function getAllSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  return data || [];
}

export async function upsertSetting(key, value) {
  const { data, error } = await supabase.from('settings').upsert({ key, value }).select().single();
  if (error) throw error;
  return data;
}