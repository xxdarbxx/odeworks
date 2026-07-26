// ============================================================================
// ODE WORKS - Shared card renderers (used by home/motorcycles/parts/etc.)
// ============================================================================
import { formatCurrency, starIcons } from './utils.js';

export function motorcycleImage(m) {
  const imgs = m.motorcycle_images || [];
  const primary = imgs.find(i => i.is_primary) || imgs[0];
  return primary?.image_url || 'https://placehold.co/600x450/1a1a1a/fff?text=Ode+Works';
}

export function productImage(p) {
  const imgs = p.product_images || [];
  const primary = imgs.find(i => i.is_primary) || imgs[0];
  return primary?.image_url || 'https://placehold.co/600x450/1a1a1a/fff?text=Ode+Works';
}

export function motorcycleCard(m) {
  const img = motorcycleImage(m);
  const brandName = m.brands?.name || '';
  return `
    <article class="card product-card" data-moto-id="${m.id}">
      <a href="motorcycle-details.html?slug=${m.slug}" class="card-media">
        <img src="${img}" alt="${m.name}" loading="lazy">
        <div class="card-badges">
          ${m.is_featured ? '<span class="badge badge-accent">Featured</span>' : ''}
          ${m.status === 'coming_soon' ? '<span class="badge badge-warning">Coming Soon</span>' : ''}
          ${m.status === 'sold_out' ? '<span class="badge badge-danger">Sold Out</span>' : ''}
        </div>
      </a>
      <div class="card-actions">
        <button class="btn-icon wishlist-toggle-btn" data-item-type="motorcycle" data-item-id="${m.id}" data-name="${m.name}" data-price="${m.price}" data-image="${img}" data-slug="${m.slug}" title="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
        <a href="compare.html?add=${m.id}" class="btn-icon" title="Compare"><i class="fa-solid fa-code-compare"></i></a>
      </div>
      <div class="card-body">
        <span class="text-muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;">${brandName} · ${m.model_year}</span>
        <h4><a href="motorcycle-details.html?slug=${m.slug}">${m.name}</a></h4>
        <div class="rating">${starIcons(m.rating)} <span class="count">(${m.review_count})</span></div>
        <div class="card-price">
          <span class="price-current">${formatCurrency(m.price)}</span>
          ${m.compare_price ? `<span class="price-compare">${formatCurrency(m.compare_price)}</span>` : ''}
        </div>
        <a href="motorcycle-details.html?slug=${m.slug}" class="btn btn-secondary btn-block mt-2">View Details</a>
      </div>
    </article>
  `;
}

export function productCard(p) {
  const img = productImage(p);
  return `
    <article class="card product-card" data-product-id="${p.id}">
      <a href="product-details.html?slug=${p.slug}" class="card-media">
        <img src="${img}" alt="${p.name}" loading="lazy">
        <div class="card-badges">
          ${p.is_featured ? '<span class="badge badge-accent">Featured</span>' : ''}
          ${p.stock_quantity === 0 ? '<span class="badge badge-danger">Out of Stock</span>' : ''}
        </div>
      </a>
      <div class="card-actions">
        <button class="btn-icon wishlist-toggle-btn" data-item-type="product" data-item-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${img}" data-slug="${p.slug}" title="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
      </div>
      <div class="card-body">
        <span class="text-muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;">${p.product_categories?.name || ''}</span>
        <h4><a href="product-details.html?slug=${p.slug}">${p.name}</a></h4>
        <div class="rating">${starIcons(p.rating)} <span class="count">(${p.review_count})</span></div>
        <div class="card-price">
          <span class="price-current">${formatCurrency(p.price)}</span>
          ${p.compare_price ? `<span class="price-compare">${formatCurrency(p.compare_price)}</span>` : ''}
        </div>
        <button class="btn btn-primary btn-block mt-2 add-to-cart-btn" data-item-type="product" data-item-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${img}" data-slug="${p.slug}">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>
  `;
}

export function blogCard(post) {
  return `
    <article class="card blog-card">
      <a href="blog-post.html?slug=${post.slug}"><img src="${post.cover_image_url}" alt="${post.title}" loading="lazy"></a>
      <div class="card-body" style="padding:20px;">
        <div class="blog-meta"><span>${post.category || 'Article'}</span><span>${new Date(post.published_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
        <h4><a href="blog-post.html?slug=${post.slug}">${post.title}</a></h4>
        <p class="mt-1" style="font-size:0.9rem;">${post.excerpt || ''}</p>
      </div>
    </article>
  `;
}

// Delegated click handling for wishlist/cart buttons rendered by the helpers above.
export function bindCardActions() {
  document.addEventListener('click', async (e) => {
    const wishBtn = e.target.closest('.wishlist-toggle-btn');
    if (wishBtn) {
      e.preventDefault();
      const { toggleWishlist } = await import('./wishlist.js');
      const { toastSuccess } = await import('./toast.js');
      const added = await toggleWishlist({
        itemType: wishBtn.dataset.itemType,
        itemId: wishBtn.dataset.itemId,
        name: wishBtn.dataset.name,
        price: wishBtn.dataset.price,
        image: wishBtn.dataset.image,
        slug: wishBtn.dataset.slug
      });
      wishBtn.querySelector('i').className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      toastSuccess(added ? 'Added to your wishlist.' : 'Removed from your wishlist.');
      return;
    }
    const cartBtn = e.target.closest('.add-to-cart-btn');
    if (cartBtn) {
      e.preventDefault();
      if (cartBtn.disabled) return;
      const { addToCart } = await import('./cart.js');
      const { toastSuccess } = await import('./toast.js');
      await addToCart({
        itemType: cartBtn.dataset.itemType,
        itemId: cartBtn.dataset.itemId,
        name: cartBtn.dataset.name,
        price: cartBtn.dataset.price,
        image: cartBtn.dataset.image,
        slug: cartBtn.dataset.slug
      });
      toastSuccess(`${cartBtn.dataset.name} added to your cart.`);
    }
  });
}
bindCardActions();
