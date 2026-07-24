import { useEffect, useLayoutEffect, useState } from 'react';
import { gsap } from '../animations/gsap.js';
import { revealBatch } from '../animations/scrollConfig.js';
import { getGallery } from '../supabase/queries.js';
import { Sparkles } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getGallery()
      .then((data) => {
        if (active) setImages(data || []);
      })
      .catch((err) => console.error('Failed to load gallery:', err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (images.length === 0) return;
    const ctx = gsap.context(() => revealBatch('.reveal-item'));
    return () => ctx.revert();
  }, [images]);

  return (
    <div className="pt-32 md:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-[#2B2118]">
      {/* Modern Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fffaf5] border border-[#D4AF37] text-[#8B1E3F] text-xs font-semibold shadow-sm mb-4">
          <Sparkles size={14} className="text-[#D4AF37]" />
          Visual Showcase
        </div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 tracking-tight">
          From Our Gallery
        </h1>
        <p className="text-neutral-600 text-sm md:text-base">
          A closer look at our handcrafted invitation details, premium finishes, and royal craft.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-32 text-neutral-500 font-medium">Loading royal gallery...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-24 bg-[#fffaf5] border border-black/5 rounded-3xl p-8 max-w-md mx-auto text-neutral-600">
          <p className="font-semibold text-lg mb-1 text-[#2B2118]">No gallery images yet</p>
          <p className="text-sm text-neutral-500">Check back soon for new royal design updates.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="reveal-item opacity-0 group relative overflow-hidden rounded-2xl bg-[#fffaf5] border border-black/5 shadow-sm break-inside-avoid"
            >
              <img
                src={img.image_url}
                alt={img.caption || 'Invitation gallery'}
                loading="lazy"
                className="w-full object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-xs md:text-sm font-medium tracking-wide">
                    {img.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}