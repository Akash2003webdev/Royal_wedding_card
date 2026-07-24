# Royal Invitations

Premium invitation-card storefront. Built with React 19 + Vite, Tailwind CSS,
GSAP/ScrollTrigger animations, React Router, Swiper, and Supabase (Auth/DB/Storage).

## What's included in this scaffold

- Full brand system (colors, fonts, glassmorphism) in `tailwind.config.js` / `index.css`
- GSAP setup (`src/animations/gsap.js`, `scrollConfig.js`) with `prefers-reduced-motion`
  support, scroll-batch reveals, animated counters, hover-lift helper
- `PageTransition` layout using `gsap.context()` + cleanup on route change
- Global state: `ThemeContext` (dark/light), `CartContext`, `WishlistContext`
  (all persisted to `localStorage` for now)
- Supabase client (`src/supabase/client.js`), a full query layer
  (`queries.js`), auth flows for Google/Email/OTP (`auth.js`), and a complete
  SQL schema with Row Level Security policies + storage buckets
  (`src/supabase/schema.sql`)
- Pages: Home (hero, featured categories, featured products carousel,
  about/stats, gallery preview, reviews carousel, FAQ accordion, contact CTA),
  Collections (filter by category/price/sort), Product Detail (zoom gallery,
  quantity, related products, WhatsApp order), Gallery (masonry), Cart,
  Wishlist, About, Contact (form + map), 404
- Header (scroll-blur navbar, mega menu, mobile bottom nav), Footer
  (newsletter, links, map), floating WhatsApp/Call/Scroll-to-top buttons,
  branded GSAP loader
- Seed data (`src/data`) for categories/products so the site runs and looks
  complete before Supabase is connected

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase project URL + anon key
npm run dev
```

## Wiring up Supabase

1. Create a Supabase project.
2. Run `src/supabase/schema.sql` in the Supabase SQL editor — it creates every
   table (`categories`, `products`, `product_images`, `users`, `wishlist`,
   `cart`, `orders`, `order_items`, `reviews`, `banners`, `gallery`,
   `settings`), enables Row Level Security, and creates the four storage
   buckets (`products`, `gallery`, `banners`, `avatars`).
3. Enable Google, Email, and OTP providers under Authentication → Providers.
4. Swap the seed data in `src/data/*` for calls to `src/supabase/queries.js`
   once your tables are populated (the query functions are already written
   for products, categories, reviews, gallery, banners, wishlist, cart, and
   orders).

## Honest scope note

This is a strong, working foundation — not the entire spec fully built out.
Given the size of the original brief (full admin CRUD dashboard with
analytics/charts, complete auth UI for all three providers, order management,
PWA/offline support, infinite scroll + pagination, SEO meta per page), a few
things are intentionally left as clearly-marked next steps rather than
half-built:

- **Admin panel** (`src/admin/`) — the folder exists but the CRUD screens,
  analytics dashboard, and moderation tools aren't built yet. The Supabase
  query layer already has the functions an admin panel would call.
- **Auth UI** — `src/supabase/auth.js` has working Google/Email/OTP functions,
  but there's no login/signup modal or account page wired to them yet.
- **Checkout/payment** — Cart page and `createOrder()` exist; a real payment
  gateway (Razorpay/Stripe) isn't integrated.
- **PWA/offline support, infinite scroll/pagination, per-page SEO meta tags**
  aren't set up yet.

Happy to build out any of these next — just say which one to tackle first.
