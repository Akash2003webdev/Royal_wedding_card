// Builds a detailed WhatsApp message for a product order, using every
// relevant field we have on the normalized product object.

// Builds a WhatsApp message summarizing an entire cart checkout —
// who's logged in (account), who they entered at checkout (order contact,
// which can differ — e.g. ordering for someone else), every item with
// full specs, and the order total.
export function buildWhatsappCartMessage({ account, customerName, customerPhone, customerAddress, items, total }) {
  const lines = [];

  lines.push('Hi! I just placed an order 🎉');
  lines.push('');

  if (account && (account.fullName || account.phone || account.email)) {
    lines.push('*Account (logged in as):*');
    if (account.fullName) lines.push(`Name: ${account.fullName}`);
    if (account.phone) lines.push(`Phone: ${account.phone}`);
    if (account.email) lines.push(`Email: ${account.email}`);
    lines.push('');
  }

  lines.push('*Order Contact:*');
  lines.push(`Name: ${customerName}`);
  lines.push(`Phone: ${customerPhone}`);
  if (customerAddress) lines.push(`Delivery Address: ${customerAddress}`);
  lines.push('');
  lines.push('*Order Details:*');
  lines.push('');

  items.forEach((item, i) => {
    const lineTotal = Number(item.price) * item.qty;
    lines.push(`${i + 1}. *${item.name}*`);
    if (item.categoryName) lines.push(`   Category: ${item.categoryName}`);
    lines.push(`   Price: ₹${item.price} x ${item.qty} = ₹${lineTotal}`);
    if (item.paperQuality) lines.push(`   Paper Quality: ${item.paperQuality}`);
    if (item.dimensions) lines.push(`   Dimensions: ${item.dimensions}`);
    if (item.customizable !== undefined && item.customizable !== null) {
      lines.push(`   Customizable: ${item.customizable ? 'Yes' : 'No'}`);
    }
    if (item.deliveryDays) lines.push(`   Delivery: ${item.deliveryDays} days`);
    if (typeof window !== 'undefined' && item.id) {
      lines.push(`   Link: ${window.location.origin}/product/${item.id}`);
    }
    lines.push('');
  });

  lines.push(`*Total: ₹${total}*`);

  return lines.join('\n');
}

export function buildWhatsappOrderMessage(product, qty = 1, contact = {}) {
  const { account, customerName, customerPhone, customerAddress } = contact;
  const lines = [];

  lines.push('Hi! I\'d like to order this invitation 🎉');
  lines.push('');

  if (account && (account.fullName || account.phone || account.email)) {
    lines.push('*Account (logged in as):*');
    if (account.fullName) lines.push(`Name: ${account.fullName}`);
    if (account.phone) lines.push(`Phone: ${account.phone}`);
    if (account.email) lines.push(`Email: ${account.email}`);
    lines.push('');
  }

  if (customerName || customerPhone) {
    lines.push('*Order Contact:*');
    if (customerName) lines.push(`Name: ${customerName}`);
    if (customerPhone) lines.push(`Phone: ${customerPhone}`);
    if (customerAddress) lines.push(`Delivery Address: ${customerAddress}`);
    lines.push('');
  }

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
