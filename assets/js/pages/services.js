// ============================================================================
// ODE WORKS - Services page: filterable pricing list
// ============================================================================
import { SERVICES } from '../data.js';
import { formatCurrency } from '../utils.js';

const listEl = document.getElementById('services-list');
const filterEl = document.getElementById('category-filter');
const categories = ['All', ...new Set(SERVICES.map(s => s.category))];

filterEl.innerHTML = categories.map((c, i) => `<button class="filter-pill ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');

function renderList(category) {
  const filtered = category === 'All' ? SERVICES : SERVICES.filter(s => s.category === category);
  listEl.innerHTML = filtered.map(s => `
    <div class="card pricing-row">
      <div>
        <div class="name"><i class="${s.icon}" style="color:var(--color-accent);margin-right:10px;"></i>${s.name}</div>
        <div class="desc">${s.description}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div class="price">${formatCurrency(s.priceFrom)}</div>
        <a href="booking.html?service=${s.slug}" class="btn btn-outline btn-sm mt-1">Book</a>
      </div>
    </div>
  `).join('');
}

filterEl.querySelectorAll('.filter-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    filterEl.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderList(pill.dataset.cat);
  });
});

renderList('All');
