import { useEffect, useRef, useState } from 'react';
import { Phone, ArrowUp } from 'lucide-react';
import { gsap } from '../animations/gsap.js';
import { WHATSAPP_NUMBER, PHONE_TEL } from '../constants/business.js';

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!topRef.current) return;
    gsap.to(topRef.current, {
      opacity: showTop ? 1 : 0,
      scale: showTop ? 1 : 0.6,
      pointerEvents: showTop ? 'auto' : 'none',
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [showTop]);

  return (
    <div className="fixed right-4 md:right-6 bottom-24 lg:bottom-8 z-40 flex flex-col gap-3 items-end">
      <button
        ref={topRef}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-premium opacity-0"
      >
        <ArrowUp size={18} />
      </button>
      <a
        href={`tel:${PHONE_TEL}`}
        aria-label="Call us"
        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-premium hover:scale-105 transition-transform"
      >
        <Phone size={20} />
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I want to order a custom invitation.')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp us"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-premium hover:scale-105 transition-transform"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.02h-.01a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.08.81.82-3-.2-.31a8.09 8.09 0 0 1-1.24-4.29c0-4.47 3.64-8.11 8.13-8.11 2.17 0 4.21.85 5.74 2.38a8.06 8.06 0 0 1 2.38 5.74c0 4.47-3.65 8.1-8.1 8.1Z"/>
        </svg>
      </a>
    </div>
  );
}
