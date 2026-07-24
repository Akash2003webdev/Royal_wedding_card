import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, prefersReducedMotion } from '../animations/gsap.js';

/**
 * Wraps route content and plays a fade/slide-in timeline whenever the
 * route changes. All GSAP work is scoped with gsap.context() and reverted
 * on cleanup to avoid animation leaks between route changes.
 */
export default function PageTransition({ children }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Always land on the top of the new page — browsers don't reset scroll
    // position automatically for client-side route changes.
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(containerRef.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return <div ref={containerRef}>{children}</div>;
}
