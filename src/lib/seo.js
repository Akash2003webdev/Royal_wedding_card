import { useEffect } from 'react';
export const SITE_URL = 'https://royalweddingcards.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
function meta(selector, attrs) { let node = document.head.querySelector(selector); if (!node) { node = document.createElement('meta'); document.head.appendChild(node); } Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); }
export function useSEO({ title, description, path = '/', noindex = false, image = DEFAULT_IMAGE, type = 'website', structuredData }) {
  const schemaJson = structuredData ? JSON.stringify(structuredData) : '';
  useEffect(() => {
    const url = new URL(path || '/', `${SITE_URL}/`).href; document.title = title;
    meta('meta[name="description"]', { name: 'description', content: description }); meta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : INDEX }); meta('meta[name="googlebot"]', { name: 'googlebot', content: noindex ? 'noindex, nofollow' : INDEX });
    meta('meta[property="og:title"]', { property: 'og:title', content: title }); meta('meta[property="og:description"]', { property: 'og:description', content: description }); meta('meta[property="og:url"]', { property: 'og:url', content: url }); meta('meta[property="og:type"]', { property: 'og:type', content: type }); meta('meta[property="og:image"]', { property: 'og:image', content: image || DEFAULT_IMAGE });
    meta('meta[name="twitter:title"]', { name: 'twitter:title', content: title }); meta('meta[name="twitter:description"]', { name: 'twitter:description', content: description }); meta('meta[name="twitter:image"]', { name: 'twitter:image', content: image || DEFAULT_IMAGE });
    let canonical = document.head.querySelector('link[rel="canonical"]'); if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); } canonical.href = url;
    let schema = document.head.querySelector('#page-structured-data'); if (schemaJson) { if (!schema) { schema = document.createElement('script'); schema.id = 'page-structured-data'; schema.type = 'application/ld+json'; document.head.appendChild(schema); } schema.textContent = schemaJson; } else schema?.remove();
  }, [title, description, path, noindex, image, type, schemaJson]);
}
