import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap.js';

// Centralized ScrollTrigger defaults used across the app
export const scrollDefaults = {
  start: 'top 85%',
  end: 'bottom 20%',
  toggleActions: 'play none none none',
  markers: false,
};

/**
 * Standard fade + translateY reveal for a single element or ref.
 */
export function revealUp(target, opts = {}) {
  if (!target) return;
  if (prefersReducedMotion) {
    gsap.set(target, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    target,
    { opacity: 0, y: opts.y ?? 40 },
    {
      opacity: 1,
      y: 0,
      duration: opts.duration ?? 0.9,
      ease: opts.ease ?? 'power3.out',
      delay: opts.delay ?? 0,
      scrollTrigger: {
        trigger: opts.trigger ?? target,
        ...scrollDefaults,
        ...opts.scrollTrigger,
      },
    }
  );
}

/**
 * Batches a list of elements (e.g. product grid / gallery items) for
 * staggered scroll reveal — more performant than individual triggers.
 */
export function revealBatch(selectorOrArray, opts = {}) {
  const items = gsap.utils.toArray(selectorOrArray);
  if (!items.length) return;
  if (prefersReducedMotion) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        overwrite: true,
      }),
    once: true,
  });
  gsap.set(items, { opacity: 0, y: 40 });
}

/**
 * Animated number counter (used for About/stats section).
 */
export function animateCounter(el, endValue, opts = {}) {
  if (!el) return;
  const obj = { val: 0 };
  gsap.to(obj, {
    val: endValue,
    duration: opts.duration ?? 2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
    onUpdate: () => {
      el.innerText = Math.floor(obj.val).toLocaleString() + (opts.suffix ?? '');
    },
  });
}

/**
 * Hover lift + shadow (attach on mouseenter/mouseleave).
 */
export function attachHoverLift(el) {
  if (!el) return () => {};
  const enter = () =>
    gsap.to(el, { y: -8, boxShadow: '0 20px 45px rgba(139,0,0,0.18)', duration: 0.35, ease: 'power2.out' });
  const leave = () =>
    gsap.to(el, { y: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.06)', duration: 0.35, ease: 'power2.out' });
  el.addEventListener('mouseenter', enter);
  el.addEventListener('mouseleave', leave);
  return () => {
    el.removeEventListener('mouseenter', enter);
    el.removeEventListener('mouseleave', leave);
  };
}
