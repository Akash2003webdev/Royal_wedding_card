import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from '../animations/gsap.js';
import { revealBatch } from '../animations/scrollConfig.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { items } = useWishlist();

  useLayoutEffect(() => {
    if (items.length === 0) return;
    const ctx = gsap.context(() => revealBatch('.reveal-item'));
    return () => ctx.revert();
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-3xl font-heading font-bold mb-4">Your wishlist is empty</h1>
        <Link to="/collections" className="text-primary font-semibold underline">Browse collections</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-8">
      <h1 className="text-4xl font-heading font-bold mb-10">Your Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
