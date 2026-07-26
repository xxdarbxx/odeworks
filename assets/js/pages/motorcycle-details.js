// ============================================================================
// ODE WORKS - Motorcycle details page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { motorcycleCard } from '../render.js';
import { formatCurrency, getQueryParam, starIcons, initials, escapeHtml } from '../utils.js';
import { toastSuccess, toastError } from '../toast.js';
import { addToCart } from '../cart.js';
import { isWishlisted, toggleWishlist } from '../wishlist.js';
import { getCurrentUser } from '../auth.js';
import { openModal, closeModal } from '../modal.js';

const slug = getQueryParam('slug');
const detailRoot = document.getElementById('detail-root');

if (!slug) {
  detailRoot.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-triangle-exclamation"></i><p>No motorcycle specified.</p></div>`;
} else {
  loadMotorcycle();
}

let currentMoto = null;
let currentImages = [];
let selectedQty = 1;

async function loadMotorcycle() {
  const { data, error } = await supabase
    .from('motorcycles')
    .select('*, brands(name, slug), motorcycle_images(image_url, is_primary, display_order)')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    detailRoot.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-motorcycle"></i><p>Motorcycle not found. It may not be loaded yet — connect Supabase and run the seed data.</p></div>`;
    return;
  }

  currentMoto = data;
  currentImages = (data.motorcycle_images || []).sort((a, b) => a.display_order - b.display_order);
  if (!currentImages.length) currentImages = [{ image_url: 'https://placehold.co/1200x900/1a1a1a/fff?text=Ode+Works' }];

  document.title = `${data.name} | Ode Works`;
  document.getElementById('page-title').textContent = `${data.name} | Ode Works`;
  document.getElementById('breadcrumb-name').textContent = data.name;

  renderDetail();
  document.getElementById('reviews-section').style.display = 'block';
  loadReviews();
  loadRelated();
}

function renderDetail() {
  const m = currentMoto;
  const wished = { current: false };

  detailRoot.innerHTML = `
    <div>
      <div class="gallery-main"><img src="${currentImages[0].image_url}" alt="${m.name}" id="gallery-main-img"></div>
      <div class="gallery-thumbs">
        ${currentImages.map((img, i) => `<img src="${img.image_url}" class="${i === 0 ? 'active' : ''}" data-idx="${i}">`).join('')}
      </div>
    </div>
    <div class="detail-info">
      <span class="brand-tag">${m.brands?.name || ''} · ${m.model_year}</span>
      <h1>${m.name}</h1>
      <div class="rating">${starIcons(m.rating)} <span class="count">${m.rating.toFixed(1)} (${m.review_count} reviews)</span></div>
      <div class="detail-price-row">
        <span class="price-current">${formatCurrency(m.price)}</span>
        ${m.compare_price ? `<span class="price-compare">${formatCurrency(m.compare_price)}</span>` : ''}
        ${m.status === 'available' ? '<span class="badge badge-success">In Stock</span>' : ''}
        ${m.status === 'coming_soon' ? '<span class="badge badge-warning">Coming Soon</span>' : ''}
        ${m.status === 'sold_out' ? '<span class="badge badge-danger">Sold Out</span>' : ''}
      </div>
      <p>${(m.description || '').slice(0, 160)}${m.description && m.description.length > 160 ? '…' : ''}</p>

      <div class="detail-specs-grid">
        <div class="spec-chip glass"><div class="label">Engine</div><div class="value">${m.engine_displacement || '—'}</div></div>
        <div class="spec-chip glass"><div class="label">Transmission</div><div class="value">${m.transmission || '—'}</div></div>
        <div class="spec-chip glass"><div class="label">Top Speed</div><div class="value">${m.top_speed || '—'}</div></div>
        <div class="spec-chip glass"><div class="label">Weight</div><div class="value">${m.weight || '—'}</div></div>
      </div>

      ${m.color_options?.length ? `
      <h4>Color Options</h4>
      <div class="color-swatches">
        ${m.color_options.map((c, i) => `<div class="color-swatch ${i === 0 ? 'active' : ''}" title="${c}" style="background:${colorToHex(c)};" data-color="${c}"></div>`).join('')}
      </div>` : ''}

      <h4>Quantity</h4>
      <div class="qty-selector">
        <button id="qty-minus" type="button"><i class="fa-solid fa-minus"></i></button>
        <input type="text" id="qty-input" value="1" readonly>
        <button id="qty-plus" type="button"><i class="fa-solid fa-plus"></i></button>
      </div>

      <div class="detail-actions">
        <button class="btn btn-primary btn-lg" id="add-to-cart-btn" ${m.status !== 'available' ? 'disabled' : ''}>
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
        <button class="btn-icon" id="wishlist-btn" style="width:52px;height:52px;" title="Add to wishlist"><i class="fa-regular fa-heart"></i></button>
        <a href="compare.html?add=${m.id}" class="btn-icon" style="width:52px;height:52px;" title="Compare"><i class="fa-solid fa-code-compare"></i></a>
      </div>
      <p class="form-hint mt-2"><i class="fa-solid fa-truck"></i> Available for test ride and pickup at our Galas, Quezon City showroom.</p>
    </div>
  `;

  // Gallery thumb switching
  detailRoot.querySelectorAll('.gallery-thumbs img').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.getElementById('gallery-main-img').src = thumb.src;
      detailRoot.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Color swatch switching
  detailRoot.querySelectorAll('.color-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      detailRoot.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
    });
  });

  // Qty selector
  const qtyInput = document.getElementById('qty-input');
  document.getElementById('qty-minus').addEventListener('click', () => { selectedQty = Math.max(1, selectedQty - 1); qtyInput.value = selectedQty; });
  document.getElementById('qty-plus').addEventListener('click', () => { selectedQty = Math.min(m.stock_quantity || 99, selectedQty + 1); qtyInput.value = selectedQty; });

  // Add to cart
  document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    await addToCart({ itemType: 'motorcycle', itemId: m.id, name: m.name, price: m.price, image: currentImages[0].image_url, slug: m.slug }, selectedQty);
    toastSuccess(`${m.name} (×${selectedQty}) added to your cart.`);
  });

  // Wishlist
  const wishBtn = document.getElementById('wishlist-btn');
  isWishlisted('motorcycle', m.id).then((v) => { wishBtn.querySelector('i').className = v ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; });
  wishBtn.addEventListener('click', async () => {
    const added = await toggleWishlist({ itemType: 'motorcycle', itemId: m.id, name: m.name, price: m.price, image: currentImages[0].image_url, slug: m.slug });
    wishBtn.querySelector('i').className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    toastSuccess(added ? 'Added to your wishlist.' : 'Removed from your wishlist.');
  });

  // Overview tab content
  document.getElementById('overview-text').textContent = m.description || 'No description available yet.';
  document.getElementById('highlights-grid').innerHTML = (m.highlights || []).map(h => `
    <div class="card" style="padding:16px 18px;display:flex;gap:12px;align-items:center;"><i class="fa-solid fa-circle-check" style="color:var(--color-accent);"></i>${h}</div>
  `).join('') || '<p class="text-muted">No highlights listed.</p>';

  document.getElementById('full-specs-grid').innerHTML = `
    <div class="spec-chip glass"><div class="label">Engine Type</div><div class="value">${m.engine_type || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Displacement</div><div class="value">${m.engine_displacement || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Transmission</div><div class="value">${m.transmission || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Fuel Capacity</div><div class="value">${m.fuel_capacity || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Weight</div><div class="value">${m.weight || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Seat Height</div><div class="value">${m.seat_height || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Top Speed</div><div class="value">${m.top_speed || '—'}</div></div>
    <div class="spec-chip glass"><div class="label">Category</div><div class="value" style="text-transform:capitalize;">${m.category}</div></div>
  `;

  // Tabs
  document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[data-tab-content]').forEach(c => c.style.display = c.dataset.tabContent === tab.dataset.tab ? 'block' : 'none');
    });
  });

  document.getElementById('write-review-btn').addEventListener('click', openReviewModal);
}

function colorToHex(name) {
  const map = { black: '#1a1a1a', white: '#f5f5f5', red: '#dc2626', blue: '#2563eb', green: '#84cc16', orange: '#f97316', grey: '#6b7280', gray: '#6b7280' };
  const key = Object.keys(map).find(k => name.toLowerCase().includes(k));
  return key ? map[key] : '#6366f1';
}

async function loadReviews() {
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('motorcycle_id', currentMoto.id)
    .order('created_at', { ascending: false });

  const reviews = data || [];
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
  const total = reviews.length || 1;

  document.getElementById('review-summary').innerHTML = `
    <div class="review-score">
      <div class="big">${currentMoto.rating.toFixed(1)}</div>
      <div class="rating">${starIcons(currentMoto.rating)}</div>
      <div class="text-muted mt-1">${currentMoto.review_count} reviews</div>
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
      <div class="form-group"><label>Title</label><input class="form-control" name="title" placeholder="Great bike!"></div>
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
      item_type: 'motorcycle',
      motorcycle_id: currentMoto.id,
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
    .from('motorcycles')
    .select('*, brands(name), motorcycle_images(image_url, is_primary)')
    .eq('category', currentMoto.category)
    .neq('id', currentMoto.id)
    .limit(4);

  const grid = document.getElementById('related-grid');
  if (!data || !data.length) { grid.innerHTML = '<p class="text-muted">No related motorcycles found.</p>'; return; }
  grid.innerHTML = data.map(motorcycleCard).join('');
}
