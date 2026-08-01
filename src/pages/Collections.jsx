import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gsap } from '../animations/gsap.js';
import { revealBatch } from '../animations/scrollConfig.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import { getCategories, getProducts } from '../supabase/queries.js';

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'best_seller', label: 'Best Sellers' },
];

export default function Collections() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState(slug || 'all');

  // Collections and /collections/:slug share the same route element, so
  // React Router doesn't remount this component when navigating from one
  // category to another (e.g. clicking a different category card while
  // already on a collections page) — only the URL param changes. Without
  // this, activeCategory stays stuck on whichever category loaded first.
  useEffect(() => {
    setActiveCategory(slug || 'all');
  }, [slug]);

  const [sort, setSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(null);
  const [priceCeiling, setPriceCeiling] = useState(0);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getProducts(), getCategories()])
      .then(([productData, categoryData]) => {
        if (!active) return;
        setProducts(productData);
        setAllCategories(categoryData);
        const highest = productData.reduce((max, p) => Math.max(max, p.price || 0), 0);
        const ceiling = Math.ceil(highest / 100) * 100 || 5000;
        setPriceCeiling(ceiling);
        setMaxPrice(ceiling);
      })
      .catch((err) => console.error('Failed to load collections data:', err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => revealBatch('.reveal-item'));
    return () => ctx.revert();
  }, [activeCategory, sort, maxPrice, products]);

  const filtered = useMemo(() => {
    if (maxPrice == null) return [];
    let list = products.filter((p) => p.price <= maxPrice);
    if (activeCategory !== 'all') list = list.filter((p) => p.category === activeCategory);
    if (sort === 'price_low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'best_seller') list = list.filter((p) => p.badge === 'best_seller');
    return list;
  }, [activeCategory, sort, maxPrice, products]);

  const activeCategoryData = allCategories.find((c) => c.slug === activeCategory);

  // Landing view: no category picked yet — show category tiles (image +
  // name), same style as the Home page "Featured Categories" section.
  // Clicking a tile navigates to /collections/:slug which switches this
  // component into the filtered-products view below.
  if (activeCategory === 'all') {
    return (
      <div className="pt-28 md:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-[#2B2118]">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Collections</h1>
          <p className="text-neutral-600 text-sm md:text-base max-w-xl">
            Pick a category to see its designs — every collection curated with royal detail and handcrafted elegance.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-28 text-neutral-500 font-medium">Loading categories...</div>
        ) : allCategories.length === 0 ? (
          <div className="text-center py-24 bg-[#fffaf5] border border-black/5 rounded-3xl p-8 text-neutral-600">
            <p className="font-semibold text-lg mb-1 text-[#2B2118]">No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allCategories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Category view: a specific category was picked — show its products
  // with price filter + sort, and other categories to switch between.
  return (
    <div className="pt-28 md:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-[#2B2118]">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E3F] mb-3 hover:underline"
        >
          <ArrowLeft size={16} /> All Categories
        </Link>
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          {activeCategoryData?.name || 'Collections'}
        </h1>
        {activeCategoryData?.description && (
          <p className="text-neutral-600 text-sm md:text-base max-w-xl">{activeCategoryData.description}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 sticky top-28 bg-[#fffaf5]/60 border border-black/5 p-6 rounded-3xl shadow-sm">
          <div>
            <h3 className="font-semibold text-base mb-4 text-[#2B2118] border-b border-black/5 pb-2">Categories</h3>
            <div className="flex flex-col gap-1.5 text-sm">
              <Link
                to="/collections"
                className="text-left px-4 py-2.5 rounded-xl transition-all font-medium hover:bg-[#FFF6EA] text-neutral-700"
              >
                ← All Categories
              </Link>
              {allCategories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`text-left px-4 py-2.5 rounded-xl transition-all font-medium ${
                    activeCategory === c.slug
                      ? 'bg-[#8B1E3F] text-white shadow-md'
                      : 'hover:bg-[#FFF6EA] text-neutral-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-3 text-[#2B2118] border-b border-black/5 pb-2">
              Max Price: <span className="text-[#8B1E3F]">₹{maxPrice ?? 0}</span>
            </h3>
            <input
              type="range"
              min={0}
              max={priceCeiling || 100}
              value={maxPrice ?? 0}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#8B1E3F] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-2 font-medium">
              <span>₹0</span>
              <span>₹{priceCeiling}</span>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div>
          <div className="hidden lg:flex items-center justify-between gap-3 mb-6 bg-[#fffaf5]/60 border border-black/5 px-6 py-3.5 rounded-2xl shadow-sm">
            <p className="text-sm font-medium text-neutral-600">
              Showing <span className="font-bold text-[#2B2118]">{filtered.length}</span> royal designs
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-black/10 bg-white rounded-xl px-4 py-2 text-sm font-medium text-[#2B2118] focus:outline-none focus:border-[#8B1E3F]"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Sort Dropdown Bar */}
          <div className="flex lg:hidden items-center justify-between mb-6">
            <span className="text-sm font-medium text-neutral-600">{filtered.length} designs</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-black/10 bg-white rounded-xl px-3 py-2 text-sm font-medium text-[#2B2118]"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-28 text-neutral-500 font-medium">Loading royal designs...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-[#fffaf5] border border-black/5 rounded-3xl p-8 text-neutral-600">
              <p className="font-semibold text-lg mb-1 text-[#2B2118]">No designs match your filters</p>
              <p className="text-sm text-neutral-500">Try widening your price range or picking another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
