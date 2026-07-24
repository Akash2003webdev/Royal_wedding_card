import { useRef } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { gsap } from '../animations/gsap.js';

export default function CategoryCard({ category }) {
  const imgRef = useRef(null);
  const borderRef = useRef(null);
  const Icon = Icons[category.icon] || Icons.Sparkles;

  const onEnter = () => {
    gsap.to(imgRef.current, { scale: 1.1, duration: 0.7, ease: 'power3.out' });
    gsap.to(borderRef.current, { opacity: 1, duration: 0.3 });
  };
  const onLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.7, ease: 'power3.out' });
    gsap.to(borderRef.current, { opacity: 0, duration: 0.3 });
  };

  return (
    <Link
      to={`/collections/${category.slug}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="reveal-item opacity-0 relative rounded-2xl overflow-hidden aspect-[3/4] group block"
    >
      <img
        ref={imgRef}
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div
        ref={borderRef}
        className="absolute inset-0 border-2 border-secondary rounded-2xl opacity-0 pointer-events-none"
      />
      <div className="absolute bottom-0 p-5 text-white">
        <Icon size={26} className="text-secondary mb-2" />
        <h3 className="text-xl font-heading font-semibold mb-1">{category.name}</h3>
        <p className="text-sm text-neutral-200">{category.description}</p>
      </div>
    </Link>
  );
}
