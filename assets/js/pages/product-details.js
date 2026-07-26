// ============================================================================
// ODE WORKS - Product (parts & accessories) details page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { productCard } from '../render.js';
import { formatCurrency, getQueryParam, starIcons, initials, escapeHtml } from '../utils.js';
import { toastSuccess, toastError } from '../toast.js';
import { addToCart } from '../cart.js';
import { isWishlisted, toggleWishlist } from '../wishlist.js';
import { getCurrentUser } from '../auth.js';
import { openModal, closeModal } from '../modal.js';

const slug = getQueryParam('slug');
const detailRoot = document.getElementById('detail-root');
let currentProduct = null;
let currentImages = [];
let selectedQty = 1;

if (!slug) {
  detailRoot.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-triangle-exclamation"></i><p>No product specified.</p></div>`;
} else {
  loadProduct();
}

async function loadProduct() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(name), product_images(image_url, is_primary, display_order)')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    detailRoot.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-helmet-safety"></i><p>Product not found. Connect Supabase and run the seed data to see live inventory.</p></div>`;
    return;
  }

  currentProduct = data;
  currentImages = (data.product_images || []).sort((a, b) => a.display_order - b.display_order);
  if (!currentImages.length) currentImages = [{ image_url: 'https://placehold.co/1000x1000/1a1a1a/fff?text=Ode+Works' }];

  document.title = `${data.name} | Ode Works`;
  document.getElementById('page-title').textContent = `${data.name} | Ode Works`;
  document.getElementById('breadcrumb-name').textContent = data.name;

  renderDetail();
  document.getElementById('reviews-section').style.display = 'block';
  loadReviews();
  loadRelated();
}

function renderDetail() {
  const p = currentProduct;
  const inStock = p.stock_quantity > 0;

  detailRoot.innerHTML = `
    <div>
      <div class="gallery-main"><img src="${currentImages[0].image_url}" alt="${p.name}" id="gallery-main-img"></div>
      <div class="gallery-thumbs">
        ${currentImages.map((img, i) => `<img src="${img.image_url}" class="${i === 0 ? 'active' : ''}" data-idx="${i}">`).join('')}
      </div>
    </div>
    <div class="detail-info">
      <span class="brand-tag">${p.product_categories?.name || ''}${p.sku ? ` · SKU: ${p.sku}` : ''}</span>
      <h1>${p.name}</h1>
      <div class="rating">${starIcons(p.rating)} <span class="count">${p.rating.toFixed(1)} (${p.review_count} reviews)</span></div>
      <div class="detail-price-row">
        <span class="price-current">${formatCurrency(p.price)}</span>
        ${p.compare_price ? `<span class="price-compare">${formatCurrency(p.compare_price)}</span>` : ''}
        ${inStock ? '<span class="badge badge-success">In Stock</span>' : '<span class="badge badge-danger">Out of Stock</span>'}
      </div>
      <p>${(p.description || '').slice(0, 200)}</p>

      <h4>Quantity</h4>
      <div class="qty-selector">
        <button id="qty-minus" type="button"><i class="fa-solid fa-minus"></i></button>
        <input type="text" id="qty-input" value="1" readonly>
        <button id="qty-plus" type="button"><i class="fa-solid fa-plus"></i></button>
      </div>

      <div class="detail-actions">
        <button class="btn btn-primary btn-lg" id="add-to-cart-btn" ${!inStock ? 'disabled' : ''}>
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
        <button class="btn-icon" id="wishlist-btn" style="width:52px;height:52px;" title="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
      </div>
      <p class="form-hint mt-2"><i class="fa-solid fa-truck"></i> Ships within Metro Manila in 2-3 business days.</p>
    </div>
  `;

  detailRoot.querySelectorAll('.gallery-thumbs img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.getElementById('gallery-main-img').src = thumb.src;
      detailRoot.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  const qtyInput = document.getElementById('qty-input');
  document.getElementById('qty-minus').addEventListener('click', () => { selectedQty = Math.max(1, selectedQty - 1); qtyInput.value = selectedQty; });
  document.getElementById('qty-plus').addEventListener('click', () => { selectedQty = Math.min(p.stock_quantity || 99, selectedQty + 1); qtyInput.value = selectedQty; });

  document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    await addToCart({ itemType: 'product', itemId: p.id, name: p.name, price: p.price, image: currentImages[0].image_url, slug: p.slug }, selectedQty);
    toastSuccess(`${p.name} (×${selectedQty}) added to your cart.`);
  });

  const wishBtn = document.getElementById('wishlist-btn');
  isWishlisted('product', p.id).then((v) => { wishBtn.querySelector('i').className = v ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; });
  wishBtn.addEventListener('click', async () => {
    const added = await toggleWishlist({ itemType: 'product', itemId: p.id, name: p.name, price: p.price, image: currentImages[0].image_url, slug: p.slug });
    wishBtn.querySelector('i').className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    toastSuccess(added ? 'Added to your wishlist.' : 'Removed from your wishlist.');
  });

  document.getElementById('overview-text').textContent = p.description || 'No description available yet.';

  const specs = p.specs || {};
  document.getElementById('full-specs-grid').innerHTML = Object.keys(specs).length
    ? Object.entries(specs).map(([k, v]) => `
        <div class="spec-chip glass"><div class="label" style="text-transform:capitalize;">${k.replace(/_/g, ' ')}</div><div class="value">${v}</div></div>
      `).join('')
    : '<p class="text-muted">No specifications listed.</p>';

  document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[data-tab-content]').forEach(c => c.style.display = c.dataset.tabContent === tab.dataset.tab ? 'block' : 'none');
    });
  });

  document.getElementById('write-review-btn').addEventListener('click', openReviewModal);
}

async function loadReviews() {
  const { data } = await supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', currentProduct.id).order('created_at', { ascending: false });
  const reviews = data || [];
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
  const total = reviews.length || 1;

  document.getElementById('review-summary').innerHTML = `
    <div class="review-score">
      <div class="big">${currentProduct.rating.toFixed(1)}</div>
      <div class="rating">${starIcons(currentProduct.rating)}</div>
      <div class="text-muted mt-1">${currentProduct.review_count} reviews</div>
    </div>
    <div class="review-bars">
      ${[5,4,3,2,1].map(star => `
        <div class="review-bar-row">
          <span>${star}★</span>
          <div class="review-bar-track"><div class="review-bar-fill" style="width:${(dist[star-1]/total*100).toFixed(0)}%;"></div></div>
          <span>${dist[star-1]}</span>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('review-list').innerHTML = reviews.length ? reviews.map(r => `
    <div class="review-item">
      <div class="review-head">
        <div class="reviewer"><div class="avatar">${initials(r.profiles?.full_name)}</div>${escapeHtml(r.profiles?.full_name || 'Anonymous')}</div>
        <div class="rating">${starIcons(r.rating)}</div>
      </div>
      ${r.title ? `<strong>${escapeHtml(r.title)}</strong>` : ''}
      <p class="mt-1">${escapeHtml(r.comment || '')}</p>
    </div>
  `).join('') : '<p class="text-muted">No reviews yet. Be the first to share your experience.</p>';
}

async function openReviewModal() {
  const user = await getCurrentUser();
  if (!user) {
    toastError('Please log in to write a review.', 'Login required');
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  openModal(`
    <h3>Write a Review</h3>
    <form id="review-form" class="mt-3">
      <div class="form-group">
        <label>Your Rating</label>
        <div class="rating" id="star-input" style="font-size:1.4rem;cursor:pointer;">
          ${[1,2,3,4,5].map(i => `<i class="fa-regular fa-star" data-star="${i}"></i>`).join('')}
        </div>
      </div>
      <div class="form-group"><label>Title</label><input class="form-control" name="title" placeholder="Great product!"></div>
      <div class="form-group"><label>Comment</label><textarea class="form-control" name="comment" required></textarea></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="review-cancel-btn">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Review</button>
      </div>
    </form>
  `);

  let rating = 5;
  const stars = document.querySelectorAll('#star-input i');
  const paintStars = () => stars.forEach((s, i) => s.className = i < rating ? 'fa-solid fa-star' : 'fa-regular fa-star');
  paintStars();
  stars.forEach(s => s.addEventListener('click', () => { rating = Number(s.dataset.star); paintStars(); }));

  document.getElementById('review-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      item_type: 'product',
      product_id: currentProduct.id,
      rating,
      title: fd.get('title'),
      comment: fd.get('comment')
    });
    if (error) { toastError(error.message, 'Could not submit review'); return; }
    closeModal();
    toastSuccess('Thanks for sharing your experience!', 'Review submitted');
    loadReviews();
  });
}

async function loadRelated() {
  const { data } = await supabase
    .from('products')
    .select('*, product_categories(name), product_images(image_url, is_primary)')
    .eq('category_id', currentProduct.category_id)
    .neq('id', currentProduct.id)
    .limit(4);

  const grid = document.getElementById('related-grid');
  if (!data || !data.length) { grid.innerHTML = '<p class="text-muted">No related products found.</p>'; return; }
  grid.innerHTML = data.map(productCard).join('');
}
