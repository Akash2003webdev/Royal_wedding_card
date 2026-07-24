import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { ADDRESS_LINE, PHONE_DISPLAY, HOURS_TODAY } from '../constants/business.js';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you within a day.");
    reset();
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-8">
      <h1 className="text-4xl font-heading font-bold mb-2">Contact Us</h1>
      <p className="text-neutral-500 mb-12">We'd love to help design your perfect invitation.</p>

      <div className="grid md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('name', { required: true })}
              placeholder="Your Name"
              className="w-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.name && <p className="text-primary text-xs mt-1">Name is required</p>}
          </div>
          <div>
            <input
              type="email"
              {...register('email', { required: true })}
              placeholder="Email Address"
              className="w-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {errors.email && <p className="text-primary text-xs mt-1">Email is required</p>}
          </div>
          <input
            {...register('phone')}
            placeholder="Phone Number"
            className="w-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <textarea
            {...register('message', { required: true })}
            placeholder="Tell us about your event..."
            rows={5}
            className="w-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            disabled={isSubmitting}
            className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3"><MapPin className="text-primary shrink-0" size={20} /> {ADDRESS_LINE}</div>
            <div className="flex items-center gap-3"><Phone className="text-primary shrink-0" size={20} /> {PHONE_DISPLAY}</div>
            <div className="flex items-center gap-3"><Mail className="text-primary shrink-0" size={20} /> info@h1enterprises.in</div>
            <div className="flex items-center gap-3"><Clock className="text-primary shrink-0" size={20} /> {HOURS_TODAY}</div>
          </div>
          <div className="rounded-3xl overflow-hidden h-72">
            <iframe
              title="map"
              className="w-full h-full border-0"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS_LINE)}&output=embed`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
