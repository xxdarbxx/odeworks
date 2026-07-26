// ============================================================================
// ODE WORKS - Gallery page: filterable before/after grid + lightbox
// ============================================================================
import { GALLERY } from '../data.js';
import { galleryCard } from '../render.js';

const gridEl = document.getElementById('gallery-grid');
const filterEl = document.getElementById('category-filter');
const categories = ['All', ...new Set(GALLERY.map(g => g.category))];

filterEl.innerHTML = categories.map((c, i) => `<button class="filter-pill ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');

function renderGrid(category) {
  const filtered = category === 'All' ? GALLERY : GALLERY.filter(g => g.category === category);
  gridEl.innerHTML = filtered.map(galleryCard).join('');
  gridEl.querySelectorAll('.gallery-card').forEach((card) => {
    card.addEventListener('click', () => {
      const item = GALLERY.find(g => g.id === card.dataset.galleryId);
      openLightbox(item);
    });
  });
}

filterEl.querySelectorAll('.filter-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    filterEl.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderGrid(pill.dataset.cat);
  });
});

const overlay = document.getElementById('lightbox-overlay');
function openLightbox(item) {
  document.getElementById('lightbox-title').textContent = item.title;
  document.getElementById('lightbox-before').src = item.before;
  document.getElementById('lightbox-after').src = item.after;
  overlay.classList.add('open');
}
function closeLightbox() { overlay.classList.remove('open'); }

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

renderGrid('All');
