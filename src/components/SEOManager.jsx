import { useLocation } from 'react-router-dom';
import { useSEO } from '../lib/seo.js';
const pages = {
  '/': ['Royal Wedding Cards | Wedding Invitation Cards in Sattur', 'Explore premium wedding invitation cards, royal box invitations, customized marriage cards and digital invitations at Royal Wedding Cards, Sattur.'],
  '/collections': ['Wedding Card Collections | Royal Wedding Cards', 'Browse wedding cards, engagement invitations, birthday invitations, housewarming cards, royal box invitations and customized designs.'],
  '/gallery': ['Wedding Invitation Gallery | Royal Wedding Cards', 'View premium wedding invitation designs, royal box cards, customized invitations and recent work from Royal Wedding Cards.'],
  '/about': ['About Royal Wedding Cards | Invitation Shop in Sattur', 'Learn about Royal Wedding Cards in Sattur, our invitation design experience, customization service and commitment to quality.'],
  '/contact': ['Contact Royal Wedding Cards | Wedding Card Shop Sattur', 'Contact Royal Wedding Cards at Vembakottai Road, Sattur for wedding invitations, customized cards, bulk orders and enquiries.']
};
function RouteSEO({ details, pathname, noindex }) {
  useSEO({ title: details[0], description: details[1], path: pathname, noindex });
  return null;
}
export default function SEOManager() {
  const { pathname } = useLocation(); const isPrivate = /^\/(cart|wishlist|login|account|admin)(\/|$)/.test(pathname); const isProduct = pathname.startsWith('/product/'); const isCategory = pathname.startsWith('/collections/');
  const details = pages[pathname] || (isCategory ? ['Wedding Invitation Collection | Royal Wedding Cards', 'Browse this premium invitation card collection from Royal Wedding Cards.'] : isProduct ? ['Wedding Card Design | Royal Wedding Cards', 'View price, images and customization details for this invitation design.'] : ['Page Not Found | Royal Wedding Cards', 'The requested page could not be found.']);
  if (isProduct) return null;
  return <RouteSEO details={details} pathname={pathname} noindex={isPrivate || (!pages[pathname] && !isCategory)} />;
}
