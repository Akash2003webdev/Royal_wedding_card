import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../animations/gsap.js';

export default function Loader() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.loader-dot', {
        y: -12,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        stagger: 0.15,
        ease: 'sine.inOut',
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-bgLight dark:bg-bgDark gap-4">
      <div className="flex gap-2">
        <span className="loader-dot w-3 h-3 rounded-full bg-primary" />
        <span className="loader-dot w-3 h-3 rounded-full bg-secondary" />
        <span className="loader-dot w-3 h-3 rounded-full bg-primary" />
      </div>
      <p className="font-heading text-lg text-gradient-gold">Royal Invitations</p>
    </div>
  );
}
