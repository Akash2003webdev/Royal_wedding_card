import { Link } from 'react-router-dom';
import { useSEO } from '../lib/seo.js';

export default function NotFound() {
  useSEO({ title: 'Page Not Found | Royal Wedding Cards', description: 'The requested page could not be found.', path: window.location.pathname, noindex: true });
  return (
    <div className="pt-40 pb-20 text-center">
      <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
      <p className="text-neutral-500 mb-6">This invitation seems to have gone missing.</p>
      <Link to="/" className="text-primary font-semibold underline">Back to Home</Link>
    </div>
  );
}
