// Builds a detailed WhatsApp message for a product order, using every
// relevant field we have on the normalized product object.

export function buildWhatsappOrderMessage(product, qty = 1) {
  const lines = [];

  lines.push('Hi! I\'d like to order this invitation 🎉');
  lines.push('');
  lines.push(`*${product.name}*`);

  if (product.categoryName) lines.push(`Category: ${product.categoryName}`);

  const unitPrice = Number(product.price);
  const total = unitPrice * qty;
  if (product.compareAtPrice && product.compareAtPrice > unitPrice) {
    lines.push(`Price: ₹${unitPrice} (was ₹${product.compareAtPrice}) x ${qty} = ₹${total}`);
  } else {
    lines.push(`Price: ₹${unitPrice} x ${qty} = ₹${total}`);
  }

  if (product.paperQuality) lines.push(`Paper Quality: ${product.paperQuality}`);
  if (product.dimensions) lines.push(`Dimensions: ${product.dimensions}`);
  if (product.customizable !== undefined && product.customizable !== null) {
    lines.push(`Customizable: ${product.customizable ? 'Yes' : 'No'}`);
  }
  if (product.deliveryDays) lines.push(`Delivery: ${product.deliveryDays} days`);
  if (product.rating) lines.push(`Rating: ${product.rating}★${product.ratingCount ? ` (${product.ratingCount} reviews)` : ''}`);

  if (product.description) {
    lines.push('');
    lines.push(product.description);
  }

  if (typeof window !== 'undefined' && product.id) {
    lines.push('');
    lines.push(`View product: ${window.location.origin}/product/${product.id}`);
  }

  return lines.join('\n');
}
