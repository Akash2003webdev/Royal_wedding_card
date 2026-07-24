import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ChevronDown, MapPin, Phone, MessageCircle, PlayCircle } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../animations/gsap.js';
import { revealBatch, revealUp, animateCounter } from '../animations/scrollConfig.js';
import CategoryCard from '../components/CategoryCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getFeaturedCategories, getFeaturedProducts, getActiveBanners, getGallery } from '../supabase/queries.js';
import { PHONE_TEL, WHATSAPP_NUMBER, ADDRESS_SHORT, ADDRESS_LINE, PHONE_DISPLAY } from '../constants/business.js';

const STATS = [
  { label: 'Years of Craft', value: 20, suffix: '+' },
  { label: 'Happy Customers', value: 10000, suffix: '+' },
  { label: 'Unique Designs', value: 5000, suffix: '+' },
];

const REVIEWS = [
  { name: 'Priya & Arjun', text: 'The wedding cards were beyond gorgeous — every guest asked where we got them.', rating: 5 },
  { name: 'Meera K.', text: 'Beautiful housewarming invites, delivered right on time. Highly recommend.', rating: 5 },
  { name: 'Rahul S.', text: 'Superhero birthday cards were a huge hit with the kids and parents alike.', rating: 5 },
  { name: 'Divya & Karthik', text: 'Premium acrylic invite felt truly royal. Worth every rupee.', rating: 5 },
];

const FAQS = [
  { q: 'How long does delivery take?', a: 'Standard designs ship in 5-7 days; premium and custom orders take 10-14 days depending on customization.' },
  { q: 'Can I customize the wording and colors?', a: 'Yes — every card can be customized with your names, dates, wording, and color palette at no extra cost.' },
  { q: 'Do you deliver across India?', a: 'We deliver pan-India, with express options available in major cities.' },
  { q: 'Can I order a sample before bulk printing?', a: 'Absolutely. We offer a single sample print so you can review paper quality and design before the full order.' },
];

export default function Home() {
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const gridRef = useRef(null);
  const statsRef = useRef([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([getFeaturedCategories(4), getFeaturedProducts(8), getActiveBanners(), getGallery(6)])
      .then(([categories, products, bannerData, galleryData]) => {
        if (!active) return;
        setFeaturedCategories(categories);
        setFeaturedProducts(products);
        setBanners(bannerData);
        setGalleryPreview(galleryData || []);
      })
      .catch((err) => console.error('Failed to load home data:', err));
    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      if (!prefersReducedMotion) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
          .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
          .fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
          .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.3');

        // Floating invitation cards parallax loop
        cardsRef.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            y: i % 2 === 0 ? -18 : 18,
            duration: 3 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        });
      } else {
        gsap.set(['.hero-eyebrow', '.hero-title', '.hero-sub', '.hero-cta'], { opacity: 1, y: 0 });
      }

      // Section reveals
      gsap.utils.toArray('.section-reveal').forEach((el) => revealUp(el));

      // Batch reveals
      revealBatch('.reveal-item');

      // Animated counters
      statsRef.current.forEach((el, i) => {
        if (el) animateCounter(el, STATS[i].value, { suffix: STATS[i].suffix });
      });
    }, heroRef);

    return () => ctx.revert();
  }, [featuredCategories, featuredProducts, banners, galleryPreview]);

  return (
    <div ref={heroRef}>
      {/* HERO */}
      <section
        className="relative min-h-[50vh] sm:min-h-screen flex items-start justify-center lg:justify-start overflow-hidden pt-28 pb-12 sm:pb-16 bg-[position:85%_center] sm:bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(
              180deg,
              rgba(255, 250, 245, 0.88) 0%,
              rgba(255, 250, 245, 0.72) 55%,
              rgba(255, 250, 245, 0.50) 100%
            ),
            url('/images/hero1.png')
          `,
        }}
      >
        {/* Mobile-la mattum background image blur aaga */}
        <div className="absolute inset-0 backdrop-blur-[2px] lg:backdrop-blur-none bg-black/5 lg:bg-transparent"></div>

        {/* Desktop-la left side gradient, mobile-la full soft overlay */}

        <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-8 flex flex-col items-center lg:items-start">
          <div className="max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">

            {/* Badge */}
            <p className="hero-eyebrow opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#D4AF37] text-[#8B1E3F] text-xs sm:text-sm font-semibold shadow-lg mb-6">
              ❤️ Trusted by 5000+ Happy Couples
            </p>

            {/* Heading */}
            <h1 className="hero-title opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold font-heading leading-tight text-[#2B2118]">
              Every Celebration Begins
              <span className="block text-[#8B1E3F] mt-1">
                With A Beautiful Invitation
              </span>
            </h1>

            {/* Description */}
            <p className="hero-sub opacity-0 mt-5 text-base sm:text-lg leading-7 sm:leading-8 text-[#4A3B32] font-medium max-w-lg">
              Handcrafted wedding, birthday, engagement and
              housewarming invitations — designed with royal
              elegance, delivered anywhere in India.
            </p>

            {/* Buttons */}
            <div className="hero-cta opacity-0 mt-8 grid grid-cols-2 sm:flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 max-w-xl">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-[#8B1E3F] text-white font-semibold shadow-xl hover:bg-[#73152F] transition-all duration-300 hover:scale-105"
              >
                Browse
              </Link>

              <Link
                to="/collections"
                className="inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 rounded-xl border-2 border-[#D4AF37] bg-white text-[#8B1E3F] font-semibold hover:bg-[#FFF6EA] transition-all duration-300"
              >
                Shop
              </Link>

              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-8 rounded-xl border border-[#8B1E3F] bg-white text-[#333] font-medium hover:bg-[#8B1E3F] hover:text-white transition-all duration-300"
              >
                <Phone size={18} />
                Call
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-[#25D366] text-white font-semibold hover:scale-105 transition-all duration-300"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>

          </div>
        </div>

        {/* Scroll Icon */}
        <ChevronDown className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[#8B1E3F] animate-bounce lg:hidden" />
      </section>

      {/* PROMOTIONAL BANNERS
      {banners.length > 0 && (
        <section className="section-reveal opacity-0 max-w-7xl mx-auto px-6 md:px-8 pt-16">
          <Swiper spaceBetween={20} slidesPerView={1} loop={banners.length > 1}>
            {banners.map((b) => (
              <SwiperSlide key={b.id}>
                <BannerSlide banner={b} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )} */}

      {/* FEATURED CATEGORIES */}
      <section className="section-reveal opacity-0 max-w-7xl mx-auto px-6 md:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-3">Featured Categories</h2>
        <p className="text-center text-neutral-500 mb-12">Explore our most-loved invitation collections</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCategories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-reveal opacity-0 bg-accent/40 dark:bg-neutral-900/40 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-3">Featured Products</h2>
          <p className="text-center text-neutral-500 mb-12">Our best sellers and premium picks</p>
          <Swiper spaceBetween={20} slidesPerView={1.2} breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}>
            {featuredProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="section-reveal opacity-0 max-w-7xl mx-auto px-6 md:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-3xl overflow-hidden aspect-video">
          <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80" alt="Craft studio" className="w-full h-full object-cover" />
          <button className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <PlayCircle size={56} className="text-white" />
          </button>
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Crafting Royal Moments Since Day One</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg">
            For over two decades, Royal Invitations has designed one-of-a-kind cards for weddings, birthdays, engagements and more — blending traditional craftsmanship with modern luxury.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {STATS.map((s, i) => (
              <div key={s.label}>
                <div ref={(el) => (statsRef.current[i] = el)} className="text-2xl sm:text-3xl font-heading font-bold text-primary">0</div>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {galleryPreview.length > 0 && (
        <section className="section-reveal opacity-0 max-w-7xl mx-auto px-6 md:px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">From Our Gallery</h2>
          <div ref={gridRef} className="columns-2 md:columns-3 gap-4 space-y-4">
            {galleryPreview.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={img.caption || 'Gallery invitation'}
                loading="lazy"
                className="reveal-item opacity-0 w-full rounded-xl break-inside-avoid hover:opacity-90 transition-opacity"
              />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/gallery" className="inline-block border-2 border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-colors">
              View Full Gallery
            </Link>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="section-reveal opacity-0 bg-royal-gradient text-white py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">What Our Customers Say</h2>
          <Swiper spaceBetween={24} slidesPerView={1} breakpoints={{ 768: { slidesPerView: 2 } }}>
            {REVIEWS.map((r) => (
              <SwiperSlide key={r.name}>
                <div className="glass rounded-2xl p-6 h-full">
                  <div className="flex gap-1 text-secondary mb-3">{'★'.repeat(r.rating)}</div>
                  <p className="mb-4 text-neutral-100">&ldquo;{r.text}&rdquo;</p>
                  <p className="font-semibold text-secondary">{r.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-reveal opacity-0 max-w-3xl mx-auto px-6 md:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} faq={f} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="section-reveal opacity-0 max-w-7xl mx-auto px-6 md:px-8 pb-20 grid md:grid-cols-2 gap-8 items-center">
        <div className="bg-accent dark:bg-neutral-900 rounded-3xl p-10">
          <h2 className="text-3xl font-heading font-bold mb-4">Let's Design Your Invitation</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Talk to our design team about custom wording, colors, and premium finishes.
          </p>
          <div className="flex items-center gap-2 text-sm mb-2"><MapPin size={16} className="text-primary shrink-0" /> {ADDRESS_SHORT}</div>
          <div className="flex items-center gap-2 text-sm mb-6"><Phone size={16} className="text-primary" /> {PHONE_DISPLAY}</div>
          <Link to="/contact" className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
            Contact Us
          </Link>
        </div>
        <div className="rounded-3xl overflow-hidden h-72 md:h-full">
          <iframe
            title="map"
            className="w-full h-full border-0"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS_LINE)}&output=embed`}
          />
        </div>
      </section>
    </div>
  );
}

function BannerSlide({ banner }) {
  const content = (
    <div className="relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[3/1]">
      <img src={banner.image} alt={banner.title || 'Promotional banner'} className="w-full h-full object-cover" />
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
          {banner.title && <h3 className="text-2xl md:text-4xl font-heading font-bold mb-1">{banner.title}</h3>}
          {banner.subtitle && <p className="text-sm md:text-base text-neutral-200">{banner.subtitle}</p>}
        </div>
      )}
    </div>
  );

  if (banner.link) {
    const isExternal = /^https?:\/\//.test(banner.link);
    return isExternal ? (
      <a href={banner.link} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    ) : (
      <Link to={banner.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function FaqItem({ faq, isOpen, onToggle }) {
  const bodyRef = useRef(null);

  useLayoutEffect(() => {
    if (!bodyRef.current) return;
    if (isOpen) {
      gsap.to(bodyRef.current, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' });
    } else {
      gsap.to(bodyRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, [isOpen]);

  return (
    <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium"
      >
        {faq.q}
        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </button>
      <div ref={bodyRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
        <p className="px-5 pb-4 text-sm text-neutral-500">{faq.a}</p>
      </div>
    </div>
  );
}
