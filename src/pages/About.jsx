import { MapPin, Phone, Clock, Star, Sparkles } from 'lucide-react';
import { ABOUT_TEXT, ADDRESS_LINE, PHONE_DISPLAY, HOURS_TODAY, BUSINESS_NAME } from '../constants/business.js';

export default function About() {
  return (
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6 md:px-8">
      {/* Premium Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase mb-4">
        <Sparkles size={13} />
        <span>Crafted Excellence</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
        About {BUSINESS_NAME}
      </h1>

      {/* Rating / Trust Bar */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={15} className="fill-amber-500" />
          ))}
        </div>
        <span className="font-semibold text-sm">5.0</span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-light">
          Premier Invitation Printing Service
        </span>
      </div>

      {/* Main Description */}
      <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-12 leading-relaxed font-light">
        {ABOUT_TEXT}
      </p>

      {/* Modern Info Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="group flex items-start gap-4 p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110">
            <MapPin size={18} />
          </div>
          <div>
            <span className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Visit Us</span>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug">{ADDRESS_LINE}</span>
          </div>
        </div>

        <div className="group flex items-start gap-4 p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Phone size={18} />
          </div>
          <div>
            <span className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Call Us</span>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug">{PHONE_DISPLAY}</span>
          </div>
        </div>

        <div className="group flex items-start gap-4 p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Clock size={18} />
          </div>
          <div>
            <span className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Hours</span>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug">{HOURS_TODAY}</span>
          </div>
        </div>
      </div>
    </div>
  );
}