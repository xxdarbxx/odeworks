// ============================================================================
// ODE WORKS - Motorcycles listing page: search, filter, sort, paginate
// ============================================================================
import { supabase } from '../supabase-client.js';
import { motorcycleCard } from '../render.js';
import { debounce, skeletonCards, getQueryParam, formatCurrency } from '../utils.js';

const gridEl = document.getElementById('motorcycle-grid');
const resultsCountEl = document.getElementById('results-count');
const paginationEl = document.getElementById('pagination');
const brandFiltersEl = document.getElementById('brand-filters');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const priceRange = document.getElementById('price-range');
const priceRangeValue = document.getElementById('price-range-value');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

const PAGE_SIZE = 9;
const state = {
  search: '',
  brandIds: new Set(),
  categories: new Set(getQueryParam('category') ? [getQueryParam('category')] : []),
  maxPrice: 900000,
  sort: 'newest',
  page: 1
};

document.querySelectorAll('.cat-cb').forEach((cb) => {
  if (state.categories.has(cb.value)) cb.checked = true;
  cb.addEventListener('change', () => {
    cb.checked ? state.categories.add(cb.value) : state.categories.delete(cb.value);
    state.page = 1;
    loadMotorcycles();
  });
});

async function loadBrandFilters() {
  const { data } = await supabase.from('brands').select('id, name').eq('is_active', true).order('name');
  if (!data) return;
  brandFiltersEl.innerHTML = data.map(b => `
    <label class="filter-option"><span><input type="checkbox" class="brand-cb" value="${b.id}"> ${b.name}</span></label>
  `).join('');
  brandFiltersEl.querySelectorAll('.brand-cb').forEach((cb) => {
    cb.addEventListener('change', () => {
      cb.checked ? state.brandIds.add(cb.value) : state.brandIds.delete(cb.value);
      state.page = 1;
      loadMotorcycles();
    });
  });
}

async function loadMotorcycles() {
  gridEl.innerHTML = skeletonCards(6);

  let query = supabase.from('motorcycles').select('*, brands(name), motorcycle_images(image_url, is_primary)', { count: 'exact' });

  if (state.search) query = query.ilike('name', `%${state.search}%`);
  if (state.brandIds.size) query = query.in('brand_id', [...state.brandIds]);
  if (state.categories.size) query = query.in('category', [...state.categories]);
  query = query.lte('price', state.maxPrice);

  switch (state.sort) {
    case 'price-asc': query = query.order('price', { ascending: true }); break;
    case 'price-desc': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const from = (state.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, error, count } = await query;

  if (error || !data || !data.length) {
    gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-motorcycle"></i><p>No motorcycles found. Try adjusting your filters, or connect Supabase to load live inventory.</p></div>`;
    resultsCountEl.textContent = '0 results';
    paginationEl.innerHTML = '';
    return;
  }

  gridEl.innerHTML = data.map(motorcycleCard).join('');
  resultsCountEl.textContent = `${count ?? data.length} motorcycle${(count ?? data.length) === 1 ? '' : 's'} found`;
  renderPagination(count ?? data.length);
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) { paginationEl.innerHTML = ''; return; }
  let html = `<button ${state.page === 1 ? 'disabled' : ''} data-page="${state.page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${state.page === pages ? 'disabled' : ''} data-page="${state.page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
  paginationEl.innerHTML = html;
  paginationEl.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.page = Number(btn.dataset.page);
    loadMotorcycles();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }));
}

searchInput.addEventListener('input', debounce((e) => {
  state.search = e.target.value.trim();
  state.page = 1;
  loadMotorcycles();
}, 350));

sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; state.page = 1; loadMotorcycles(); });

priceRange.addEventListener('input', (e) => {
  state.maxPrice = Number(e.target.value);
  priceRangeValue.textContent = formatCurrency(state.maxPrice);
});
priceRange.addEventListener('change', () => { state.page = 1; loadMotorcycles(); });

clearFiltersBtn.addEventListener('click', () => {
  state.search = ''; state.brandIds.clear(); state.categories.clear(); state.maxPrice = 900000; state.sort = 'newest'; state.page = 1;
  searchInput.value = ''; sortSelect.value = 'newest'; priceRange.value = 900000; priceRangeValue.textContent = formatCurrency(900000);
  document.querySelectorAll('.cat-cb, .brand-cb').forEach(cb => cb.checked = false);
  loadMotorcycles();
});

loadBrandFilters();
loadMotorcycles();
