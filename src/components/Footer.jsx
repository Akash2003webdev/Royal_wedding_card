import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories } from '../supabase/queries.js';
import { ADDRESS_SHORT, PHONE_DISPLAY } from '../constants/business.js';

export default function Footer() {
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) setAllCategories(data);
      })
      .catch((err) => console.error('Failed to load categories:', err));
    return () => {
      active = false;
    };
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    toast.success('Subscribed! Watch your inbox for royal offers.');
    e.target.reset();
  };

  return (
    <footer className="bg-bgDark text-neutral-200 pt-16 pb-28 lg:pb-10 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-heading text-gradient-gold mb-3"> Royal Wedding Cards</h3>
          <p className="text-sm text-neutral-400 mb-4">
            Every Celebration Begins With A Beautiful Invitation.
          </p>
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-secondary"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-secondary"><Instagram size={18} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-secondary"><Youtube size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-secondary">Quick Links</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/collections" className="hover:text-white">Collections</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-secondary">Categories</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            {allCategories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-secondary">Stay Updated</h4>
          {/* <p className="text-sm text-neutral-400 mb-3">Get 10% off your first royal order.</p> */}
          <ul className="space-y-2 text-sm text-neutral-400">
            <li className="flex items-center gap-2"><MapPin size={14} /> {ADDRESS_SHORT}</li>
            <li className="flex items-center gap-2"><Phone size={14} /> {PHONE_DISPLAY}</li>
            <li className="flex items-center gap-2"><Mail size={14} /> info@h1enterprises.in</li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-neutral-500 mt-12">
        © {new Date().getFullYear()} Royal Wedding Cards. All rights reserved.
      </p>
    </footer>
  );
}
