import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MessageCircle, Minus, Plus, Truck, Ruler, FileText, Heart, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { gsap } from '../animations/gsap.js';
import { revealBatch } from '../animations/scrollConfig.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getProductById, getRelatedProducts, getProducts, submitReview, createWhatsappOrder } from '../supabase/queries.js';
import { WHATSAPP_NUMBER } from '../constants/business.js';
import { buildWhatsappOrderMessage } from '../utils/whatsapp.js';
import { useSEO, SITE_URL } from '../lib/seo.js';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const imgRef = useRef(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user, isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  useSEO({
    title: product ? `${product.name} | Royal Wedding Cards` : 'Wedding Card Design | Royal Wedding Cards',
    description: product ? `${product.name} — ${product.description || 'premium customizable invitation design'}. View price and order from Royal Wedding Cards.` : 'View wedding invitation card design details.',
    path: `/product/${id}`, type: 'product', image: product?.image,
    structuredData: product ? { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.images?.length ? product.images : [product.image].filter(Boolean), sku: product.id, url: `${SITE_URL}/product/${product.id}`, brand: { '@type': 'Brand', name: 'Royal Wedding Cards' }, offers: { '@type': 'Offer', priceCurrency: 'INR', price: product.price, availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${SITE_URL}/product/${product.id}` } } : undefined
  });

  useEffect(() => {
    let active = true;
    setProduct(null);
    setRelated([]);
    
    getProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setSelectedImage(data?.images?.[0] || data?.image || null);
        
        // Fetch all products to guarantee related items display properly
        return getProducts();
      })
      .then((allProducts) => {
        if (!active || !allProducts) return;
        // Filter out current product and pick up to 4 items
        const filtered = allProducts.filter((p) => p.id !== id);
        setRelated(filtered.slice(0, 4));
      })
      .catch((err) => console.error('Failed to load product details:', err));

    return () => {
      active = false;
    };
  }, [id]);

  useLayoutEffect(() => {
    if (!product) return;
    const ctx = gsap.context(() => revealBatch('.reveal-item'));
    return () => ctx.revert();
  }, [product]);

  const zoomIn = () => gsap.to(imgRef.current, { scale: 1.12, duration: 0.5, ease: 'power2.out' });
  const zoomOut = () => gsap.to(imgRef.current, { scale: 1, duration: 0.5, ease: 'power2.out' });

  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      toast.error('Please add your name and a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const newReview = await submitReview(product.id, {
        customerName: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        userId: user?.id ?? null,
      });
      setProduct((p) => ({ ...p, reviews: [newReview, ...(p.reviews || [])] }));
      setReviewForm({ name: '', rating: 5, comment: '' });
      toast.success('Thanks for your review!');
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWhatsappOrderClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirect: `/product/${id}` } });
      return;
    }
    // Google sign-in doesn't provide a phone number, so some accounts
    // reach this point with an incomplete profile — send them to fill
    // it in on the Account page rather than failing silently.
    if (!profile?.full_name || !profile?.phone || !profile?.address) {
      navigate('/account', { state: { needsProfile: true, redirect: `/product/${id}` } });
      return;
    }
    setShowOrderConfirm(true);
  };

  const handleConfirmWhatsappOrder = async () => {
    setPlacingOrder(true);
    try {
      await createWhatsappOrder(product, qty, user?.id ?? null, {
        customerName: profile.full_name,
        customerPhone: profile.phone,
        customerAddress: profile.address,
      });
      const waMessage = buildWhatsappOrderMessage(product, qty, {
        account: { fullName: profile.full_name, phone: profile.phone, email: user.email },
        customerName: profile.full_name,
        customerPhone: profile.phone,
        customerAddress: profile.address,
      });
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`, '_blank');
      setShowOrderConfirm(false);
    } catch (err) {
      toast.error(err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!product) {
    return (
      <div className="pt-40 pb-28 max-w-7xl mx-auto px-6 text-center text-neutral-500 font-medium">
        Loading royal design details...
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-[#2B2118]">
      {/* Product Main Section */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Image Preview with Zoom - Height reduced to aspect-[4/3] or max-h */}
        <div>
          <div
            className="relative rounded-3xl overflow-hidden aspect-[4/3] max-h-[500px] w-full bg-[#fffaf5] border border-black/5 shadow-md cursor-zoom-in"
            onMouseEnter={zoomIn}
            onMouseLeave={zoomOut}
            onClick={() => setShowImageZoom(true)}
          >
            <img ref={imgRef} src={selectedImage || product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#8B1E3F] text-white shadow-lg">
                {product.badge.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>

          {/* Thumbnail strip — only shows when the product has more than one image */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setSelectedImage(img)}
                  className={`shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-[#8B1E3F] shadow-md' : 'border-black/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#2B2118] tracking-tight">{product.name}</h1>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle wishlist"
                className="shrink-0 w-12 h-12 rounded-full border border-black/10 bg-[#fffaf5] flex items-center justify-center hover:scale-110 transition-all shadow-sm"
              >
                <Heart size={20} className={isWishlisted(product.id) ? 'fill-[#8B1E3F] text-[#8B1E3F]' : 'text-neutral-500'} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#D4AF37] mb-4 font-medium text-sm">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-[#D4AF37]" />
                <span className="text-[#2B2118] font-bold">{product.rating}</span>
              </div>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500">
                ({product.reviews?.length ?? product.ratingCount ?? 0} review{(product.reviews?.length ?? product.ratingCount ?? 0) === 1 ? '' : 's'})
              </span>
            </div>

            <p className="text-3xl font-bold text-[#8B1E3F] mb-6">₹{product.price}</p>

            <p className="text-neutral-600 mb-6 leading-relaxed text-sm md:text-base">
              A beautifully crafted invitation designed to set the tone for your celebration. Fully customizable with your names, dates, and wording — printed on premium card stock with meticulous royal finishing.
            </p>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-xs font-medium">
              <div className="flex flex-col items-center text-center gap-1.5 p-3.5 rounded-2xl bg-[#fffaf5] border border-black/5 shadow-sm">
                <FileText size={18} className="text-[#8B1E3F]" />
                <span className="text-[#2B2118]">Premium Card Stock</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3.5 rounded-2xl bg-[#fffaf5] border border-black/5 shadow-sm">
                <Ruler size={18} className="text-[#8B1E3F]" />
                <span className="text-[#2B2118]">5 x 7 inches</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3.5 rounded-2xl bg-[#fffaf5] border border-black/5 shadow-sm">
                <Truck size={18} className="text-[#8B1E3F]" />
                <span className="text-[#2B2118]">5-7 Day Delivery</span>
              </div>
            </div>
          </div>

          {/* Add to Cart & Quantity */}
          <div className="space-y-4 pt-4 border-t border-black/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-black/10 rounded-2xl bg-[#fffaf5] shadow-sm">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3.5 text-neutral-700 hover:text-[#8B1E3F]"><Minus size={16} /></button>
                <span className="w-10 text-center font-bold text-[#2B2118]">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3.5 text-neutral-700 hover:text-[#8B1E3F]"><Plus size={16} /></button>
              </div>
              <button
                onClick={() => addToCart(product, qty)}
                className="flex-1 bg-[#8B1E3F] text-white py-4 rounded-2xl font-semibold shadow-lg hover:bg-[#73152F] hover:scale-[1.01] transition-all"
              >
                Add to Cart
              </button>
            </div>

            <button
              onClick={handleWhatsappOrderClick}
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-4 rounded-2xl font-semibold shadow-lg hover:bg-[#20ba5a] hover:scale-[1.01] transition-all"
            >
              <MessageCircle size={20} /> Order via WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Write Review Section */}
      <section className="mt-28 grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div>
          <div className="flex items-baseline gap-3 mb-8 border-b border-black/5 pb-4">
            <h2 className="text-2xl font-heading font-bold text-[#2B2118]">Customer Reviews</h2>
            <span className="text-neutral-500 text-sm font-medium">
              {product.reviews?.length || 0} total · {product.rating} average rating
            </span>
          </div>

          {product.reviews?.length ? (
            <div className="space-y-6">
              {product.reviews.map((r) => (
                <div key={r.id} className="bg-[#fffaf5] border border-black/5 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-heading font-semibold text-[#2B2118]">{r.customer_name || 'Anonymous'}</p>
                    <span className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold">
                      <Star size={14} className="fill-[#D4AF37]" /> {r.rating}
                    </span>
                  </div>
                  {r.created_at && (
                    <p className="text-xs text-neutral-400 mb-3">{new Date(r.created_at).toLocaleDateString()}</p>
                  )}
                  <p className="text-sm text-neutral-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#fffaf5] border border-black/5 rounded-2xl p-8 text-center text-neutral-500">
              <p className="font-medium mb-1">No reviews yet</p>
              <p className="text-sm text-neutral-400">Be the first to share your experience with this design.</p>
            </div>
          )}
        </div>

        {/* Write a Review Card */}
        <div className="bg-[#fffaf5] border border-black/10 rounded-3xl p-8 shadow-sm h-fit sticky top-28">
          <h3 className="font-heading font-bold text-xl mb-2 text-[#2B2118]">Write a Review</h3>
          <p className="text-xs text-neutral-500 mb-6">Share your thoughts and feedback about this handcrafted design.</p>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Your Name</label>
              <input
                required
                placeholder="e.g. Priya & Arjun"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#8B1E3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Rating</label>
              <div className="flex items-center gap-1.5 bg-white border border-black/10 px-4 py-2.5 rounded-xl w-fit">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm((s) => ({ ...s, rating: n }))}
                    aria-label={`Rate ${n} stars`}
                    className="focus:outline-none"
                  >
                    <Star size={20} className={n <= reviewForm.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-neutral-300'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Your Review</label>
              <textarea
                required
                rows={4}
                placeholder="Share your experience with this design..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((s) => ({ ...s, comment: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#8B1E3F]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-[#8B1E3F] text-white py-3.5 rounded-xl font-semibold shadow-md hover:bg-[#73152F] hover:scale-[1.01] transition-all disabled:opacity-60"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </section>

      {showOrderConfirm && createPortal(
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl">
            <h2 className="font-heading font-bold text-xl mb-1 text-[#2B2118] dark:text-white">Confirm Your Order</h2>
            <p className="text-sm text-neutral-500 mb-5">Please check the details below before placing your order.</p>

            <div className="flex items-center justify-between text-sm mb-3">
              <span className="truncate pr-2">{product.name} × {qty}</span>
              <span className="text-neutral-500 shrink-0">₹{Number(product.price) * qty}</span>
            </div>

            <div className="border-t border-black/5 dark:border-white/10 pt-3 mb-4 space-y-1">
              <p className="text-xs text-neutral-500">Contact: {profile?.full_name} · {profile?.phone}</p>
              <p className="text-xs text-neutral-500">📍 {profile?.address}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderConfirm(false)}
                disabled={placingOrder}
                className="flex-1 py-3 rounded-full font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWhatsappOrder}
                disabled={placingOrder}
                className="flex-1 py-3 rounded-full font-semibold bg-[#25D366] text-white hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {placingOrder ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showImageZoom && createPortal(
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <button
            onClick={() => setShowImageZoom(false)}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={22} />
          </button>

          <img
            src={selectedImage || product.image}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl select-none"
          />

          {product.images?.length > 1 && (
            <div
              className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setSelectedImage(img)}
                  className={`shrink-0 w-12 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    (selectedImage || product.image) === img ? 'border-white' : 'border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
